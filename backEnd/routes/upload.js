const express = require('express');
const multer = require('multer');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const HttpError = require('../utils/httpError');
const { uploadBuffer } = require('../services/cloudinary');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif|avif)$/.test(file.mimetype)),
});

// POST /api/upload — رفع صورة (للإدارة فقط) إلى Cloudinary مع ضغط وتحويل تلقائي للصيغة
router.post('/', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) throw new HttpError(400, 'الرجاء اختيار صورة (JPG أو PNG أو WebP)');

  const result = await uploadBuffer(req.file.buffer, {
    folder: 'khaled-designs',
    resource_type: 'image',
    use_filename: true,
    unique_filename: true,
    // تصغير الصور الكبيرة قبل التخزين
    transformation: [{ width: 2000, height: 2000, crop: 'limit' }],
  });

  // f_auto,q_auto: يقدّم Cloudinary الصورة بصيغة WebP/AVIF وجودة مناسبة تلقائياً
  const url = result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
  res.status(201).json({ url });
});

module.exports = router;
