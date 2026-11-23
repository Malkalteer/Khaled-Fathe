const rateLimit = require("express-rate-limit");

const make = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test",
    message: { message }
  });

exports.loginLimiter = make(15 * 60 * 1000, 20, "محاولات كثيرة، حاول بعد 15 دقيقة");
exports.registerLimiter = make(60 * 60 * 1000, 10, "محاولات تسجيل كثيرة، حاول لاحقاً");
exports.chatLimiter = make(10 * 60 * 1000, 30, "رسائل كثيرة، انتظر قليلاً ثم حاول مجدداً");
exports.quoteLimiter = make(60 * 60 * 1000, 5, "أرسلت طلبات كثيرة، حاول بعد ساعة");
exports.reviewLimiter = make(60 * 60 * 1000, 10, "تقييمات كثيرة، حاول لاحقاً");
