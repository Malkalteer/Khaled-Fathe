const express = require('express');
const multer = require('multer');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const HttpError = require('../utils/httpError');
const { saveImage } = require('../services/storage');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif|avif|heic|heif)$/.test(file.mimetype)),
});

// POST /api/upload — رفع صورة (للإدارة فقط) وحفظها على السيرفر بصيغة WebP مضغوطة
router.post('/', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) throw new HttpError(400, 'الرجاء اختيار صورة (JPG أو PNG أو WebP)');
  const url = await saveImage(req.file.buffer, req);
  res.status(201).json({ url });
});

module.exports = router;
