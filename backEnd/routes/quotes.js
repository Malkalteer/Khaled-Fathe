const path = require('path');
const express = require('express');
const multer = require('multer');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');
const { idParam, quoteValidation, quoteStatusValidation } = require('../middleware/validation');
const { quoteLimiter } = require('../middleware/rateLimits');
const HttpError = require('../utils/httpError');
const controller = require('../controllers/quoteController');

const router = express.Router();
const admin = [requireAuth, requireAdmin];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 1, fields: 10 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!controller.ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new HttpError(400, `نوع الملف غير مدعوم. الأنواع المسموحة: ${controller.ALLOWED_EXTENSIONS.join(' ')}`));
    }
    cb(null, true);
  },
});

router.post('/', optionalAuth, quoteLimiter, upload.single('file'), quoteValidation, controller.createQuote);
router.get('/', ...admin, controller.getQuotes);
router.get('/:id/file', ...admin, idParam(), controller.downloadQuoteFile);
router.patch('/:id', ...admin, idParam(), quoteStatusValidation, controller.updateQuote);
router.delete('/:id', ...admin, idParam(), controller.deleteQuote);

module.exports = router;
