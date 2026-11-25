/**
 * ينقل الصور الموجودة حالياً على Cloudinary (أو أي رابط خارجي) إلى السيرفر،
 * ثم يحدّث روابطها في قاعدة البيانات.
 *
 * تجربة بدون تغيير أي شيء:   node scripts/migrate-images-to-local.js --dry-run
 * التنفيذ الفعلي:              node scripts/migrate-images-to-local.js
 *
 * يحتاج: MONGO_URI و SITE_URL (أو PUBLIC_URL) و UPLOADS_DIR في ملف .env
 */
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Project = require('../models/Project');
const { saveImage } = require('../services/storage');

const DRY_RUN = process.argv.includes('--dry-run');
const base = (process.env.PUBLIC_URL || process.env.SITE_URL || '').replace(/\/$/, '');

const isExternal = (url) => typeof url === 'string' && /^https?:\/\//i.test(url) && !(base && url.startsWith(`${base}/uploads/`));
// طلب وهمي يكفي saveImage لبناء الرابط من SITE_URL
const fakeReq = { protocol: 'https', get: () => new URL(base).host };
const cache = new Map();
let migrated = 0;
let failed = 0;

const migrate = async (url) => {
  if (!isExternal(url)) return url;
  if (cache.has(url)) return cache.get(url);
  if (DRY_RUN) {
    console.log('  سيُنقل:', url);
    migrated += 1;
    return url;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const local = await saveImage(Buffer.from(await res.arrayBuffer()), fakeReq);
    cache.set(url, local);
    migrated += 1;
    console.log('  ✓', url, '→', local);
    return local;
  } catch (error) {
    failed += 1;
    console.warn('  ✗ تعذر نقل', url, '-', error.message);
    return url; // نُبقي الرابط القديم إذا فشل التحميل
  }
};

(async () => {
  if (!base) throw new Error('ضع SITE_URL في ملف .env أولاً (مثل https://khfdesign.cloud)');
  await mongoose.connect(process.env.MONGO_URI);
  console.log(DRY_RUN ? '— تجربة فقط، لن يتغير شيء —' : '— بدء النقل —');

  for (const cat of await Category.find()) {
    const image = await migrate(cat.image);
    if (image !== cat.image) {
      cat.image = image;
      await cat.save();
    }
  }

  for (const project of await Project.find()) {
    const images = [];
    for (const img of project.images) images.push(await migrate(img));
    if (images.some((img, i) => img !== project.images[i])) {
      project.images = images;
      await project.save();
    }
  }

  console.log(`\nانتهى: ${migrated} صورة ${DRY_RUN ? 'ستُنقل' : 'نُقلت'}، ${failed} فشلت.`);
  await mongoose.disconnect();
})().catch(async (error) => {
  console.error('خطأ:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
