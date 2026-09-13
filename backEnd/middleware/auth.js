const jwt = require("jsonwebtoken");

const getAccessToken = (req) => req.cookies && req.cookies.accessToken;

exports.requireAuth = (req, res, next) => {
  const token = getAccessToken(req);
  if (!token) return res.status(401).json({ message: "غير مصرح" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "انتهت الجلسة" });
  }
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "غير مصرح" });
  }
  next();
};

exports.verifyRequestOrigin = (req, res, next) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();

  const allowedOrigin = process.env.FRONTEND_URL;
  const origin = req.get("origin");
  const referer = req.get("referer");
  const validReferer = referer && allowedOrigin && referer.startsWith(`${allowedOrigin}/`);

  if (!allowedOrigin || (origin !== allowedOrigin && !validReferer)) {
    return res.status(403).json({ message: "طلب غير صالح" });
  }
  next();
};