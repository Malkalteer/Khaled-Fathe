const Project = require('../models/Project');
const Category = require('../models/Category');

const escapeXml = (value) => String(value).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

const siteUrl = () => (process.env.SITE_URL || 'https://khfdesign.cloud').replace(/\/$/, '');

// GET /sitemap.xml — يُنشأ تلقائياً من الأعمال والفئات الموجودة
exports.sitemap = async (req, res) => {
  const base = siteUrl();
  const [projects, categories] = await Promise.all([
    Project.find({ hidden: { $ne: true } }).select('_id updatedAt').lean(),
    Category.find().select('_id updatedAt').lean(),
  ]);

  const urls = [
    { loc: `${base}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${base}/portfolio/all`, changefreq: 'weekly', priority: '0.9' },
    { loc: `${base}/contact`, changefreq: 'monthly', priority: '0.7' },
    ...categories.map((c) => ({ loc: `${base}/portfolio/${c._id}`, lastmod: c.updatedAt, changefreq: 'weekly', priority: '0.8' })),
    ...projects.map((p) => ({ loc: `${base}/project/${p._id}`, lastmod: p.updatedAt, changefreq: 'monthly', priority: '0.7' })),
  ];

  const body = urls.map((u) => [
    '  <url>',
    `    <loc>${escapeXml(u.loc)}</loc>`,
    u.lastmod ? `    <lastmod>${new Date(u.lastmod).toISOString().slice(0, 10)}</lastmod>` : null,
    `    <changefreq>${u.changefreq}</changefreq>`,
    `    <priority>${u.priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n')).join('\n');

  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
};
