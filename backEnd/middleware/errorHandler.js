const mongoose = require("mongoose");
const multer = require("multer");
const HttpError = require("../utils/httpError");

exports.notFound = (req, res) => {
  res.status(404).json({ message: "المسار غير موجود" });
};

// معالج أخطاء مركزي: التفاصيل تُسجَّل في الخادم فقط، والزائر يرى رسالة عامة.
// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: "معرّف غير صالح" });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: "بيانات الإدخال غير صالحة" });
  }
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "حجم الملف أكبر من المسموح" : "تعذر رفع الملف";
    return res.status(400).json({ message });
  }
  if (err && err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    const messages = { code: "كود المنتج مستخدم لمنتج آخر", email: "البريد الإلكتروني مستخدم مسبقاً" };
    return res.status(409).json({ message: messages[field] || "القيمة مستخدمة مسبقاً" });
  }
  if (err && err.message === "Origin غير مسموح") {
    return res.status(403).json({ message: "طلب غير صالح" });
  }
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "صيغة الطلب غير صالحة" });
  }

  console.error(`[${req.method} ${req.originalUrl}]`, err);
  res.status(500).json({ message: "حدث خطأ في الخادم، حاول مرة أخرى لاحقاً" });
};
