const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const ACCESS_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/"
};

exports.issueTokens = async (user, res) => {
  const accessToken = jwt.sign(
    { sub: user._id.toString(), isAdmin: Boolean(user.isAdmin) },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  user.refreshTokens.push({
    tokenHash: crypto.createHash("sha256").update(refreshToken).digest("hex"),
    expiresAt
  });
  await user.save();
  res.cookie(ACCESS_COOKIE, accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie(REFRESH_COOKIE, refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

exports.hashRefreshToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
exports.ACCESS_COOKIE = ACCESS_COOKIE;
exports.REFRESH_COOKIE = REFRESH_COOKIE;
exports.cookieOptions = cookieOptions;