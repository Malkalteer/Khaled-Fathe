const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const ACCESS_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";
const MAX_SESSIONS = 10;
const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/"
};

const hashRefreshToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// يحذف الجلسات المنتهية ويُبقي أحدث MAX_SESSIONS فقط حتى لا تكبر المصفوفة بلا نهاية.
const pruneRefreshTokens = (tokens, now = new Date()) =>
  tokens
    .filter((item) => item.expiresAt > now)
    .sort((a, b) => b.expiresAt - a.expiresAt)
    .slice(0, MAX_SESSIONS - 1);

exports.issueTokens = async (user, res) => {
  const accessToken = jwt.sign(
    { sub: user._id.toString(), isAdmin: Boolean(user.isAdmin) },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  user.refreshTokens = pruneRefreshTokens(user.refreshTokens || []);
  user.refreshTokens.push({ tokenHash: hashRefreshToken(refreshToken), expiresAt });
  await user.save();
  res.cookie(ACCESS_COOKIE, accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie(REFRESH_COOKIE, refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

exports.hashRefreshToken = hashRefreshToken;
exports.pruneRefreshTokens = pruneRefreshTokens;
exports.MAX_SESSIONS = MAX_SESSIONS;
exports.ACCESS_COOKIE = ACCESS_COOKIE;
exports.REFRESH_COOKIE = REFRESH_COOKIE;
exports.cookieOptions = cookieOptions;
