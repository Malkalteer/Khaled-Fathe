const jwt = require("jsonwebtoken");

exports.getAllowedOrigins = () => [
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
  "http://localhost:3000",
  "http://localhost:5173",
  "https://khaled-fathe.vercel.app"
];

const getAccessToken = (req) => req.cookies && req.cookies.accessToken;

exports.optionalAuth = (req, res, next) => {
  const token = getAccessToken(req);
  if (!token) return next();

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.user = null;
  }
  next();
};

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

  const allowedOrigins = exports.getAllowedOrigins();
  const origin = req.get("origin");
  const referer = req.get("referer");
  if (!origin && !referer) return next();
  const validOrigin = origin && allowedOrigins.includes(origin);
  const validReferer = referer && allowedOrigins.some((allowedOrigin) => referer.startsWith(`${allowedOrigin}/`));

  if (!validOrigin && !validReferer) {
    return res.status(403).json({ message: "طلب غير صالح" });
  }
  next();
};