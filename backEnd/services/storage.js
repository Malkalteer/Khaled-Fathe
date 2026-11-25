const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const HttpError = require('../utils/httpError');

/**
 * تخزين الملفات على السيرفر نفسه بدلاً من Cloudinary.
 *
 * UPLOADS_DIR/
 *   public/images/YYYY/MM/<random>.webp   ← صور الموقع (تُعرض للجميع عبر /uploads/...)
 *   private/quotes/YYYY/MM/<random>.<ext> ← ملفات العملاء (للمدير فقط عبر /api/quotes/:id/file)
 */
const uploadsRoot = () => path.resolve(process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads'));
const publicDir = () => path.join(uploadsRoot(), 'public');
const privateDir = () => path.join(uploadsRoot(), 'private');

const datedFolder = () => {
  const now = new Date();
  return path.join(String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, '0'));
};

const randomName = () => crypto.randomBytes(16).toString('hex');

/** الرابط العام للموقع: من الإعدادات، أو من الطلب نفسه */
const publicBaseUrl = (req) => {
  const fromEnv = process.env.PUBLIC_URL || process.env.SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
};

/**
 * يحفظ صورة بعد التحقق أنها صورة حقيقية: تُدوَّر حسب EXIF، وتُصغَّر لحد أقصى 2000px،
 * وتُحوَّل إلى WebP، وتُحذف بياناتها الوصفية (الموقع الجغرافي...). يعيد الرابط الكامل.
 */
exports.saveImage = async (buffer, req) => {
  const relative = path.join('images', datedFolder(), `${randomName()}.webp`);
  const target = path.join(publicDir(), relative);
  await fs.mkdir(path.dirname(target), { recursive: true });
  try {
    await sharp(buffer, { limitInputPixels: 50_000_000 })
      .rotate()
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(target);
  } catch {
    await fs.rm(target, { force: true });
    throw new HttpError(400, 'الملف ليس صورة صالحة');
  }
  return `${publicBaseUrl(req)}/uploads/${relative.split(path.sep).join('/')}`;
};

/** يحفظ ملف عميل (DXF / STL ...) في مجلد خاص لا يُعرض للعامة. يعيد المسار النسبي. */
exports.savePrivateFile = async (buffer, originalName) => {
  const ext = path.extname(originalName || '').toLowerCase().replace(/[^.a-z0-9]/g, '');
  const relative = path.join('quotes', datedFolder(), `${randomName()}${ext}`);
  const target = path.join(privateDir(), relative);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, buffer, { flag: 'wx' });
  return relative.split(path.sep).join('/');
};

/** المسار الكامل لملف خاص، مع منع الخروج من المجلد (../) */
exports.resolvePrivateFile = (relative) => {
  const base = privateDir();
  const full = path.resolve(base, relative || '');
  if (!relative || !full.startsWith(base + path.sep)) throw new HttpError(404, 'الملف غير موجود');
  return full;
};

exports.deletePrivateFile = async (relative) => {
  if (!relative) return;
  try {
    await fs.rm(exports.resolvePrivateFile(relative), { force: true });
  } catch {
    /* ignore */
  }
};

exports.publicDir = publicDir;
exports.uploadsRoot = uploadsRoot;
