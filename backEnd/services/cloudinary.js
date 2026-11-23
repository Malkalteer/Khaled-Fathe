const cloudinary = require('cloudinary').v2;
const HttpError = require('../utils/httpError');

const REQUIRED = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
let configured = false;

const ensureConfigured = () => {
  const missing = REQUIRED.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    console.error(`Cloudinary configuration is missing: ${missing.join(', ')}`);
    throw new HttpError(500, 'إعدادات تخزين الملفات غير مكتملة على الخادم');
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    configured = true;
  }
};

/** يرفع Buffer إلى Cloudinary ويعيد النتيجة */
exports.uploadBuffer = (buffer, options) => {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return reject(new HttpError(502, 'تعذر رفع الملف إلى خدمة التخزين'));
      }
      resolve(result);
    });
    stream.end(buffer);
  });
};
