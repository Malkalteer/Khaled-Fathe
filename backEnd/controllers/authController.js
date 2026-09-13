const User = require("../models/User");
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");
const {
  issueTokens,
  hashRefreshToken,
  REFRESH_COOKIE,
  ACCESS_COOKIE,
  cookieOptions
} = require("../utils/authTokens");

const invalidCredentials = "بيانات الدخول غير صحيحة";
const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  phone: user.phone,
  isAdmin: Boolean(user.isAdmin)
});

const recordFailedLogin = async (user, req) => {
  if (!user) return;
  user.failedLoginAttempts += 1;
  user.failedLoginLogs.push({ at: new Date(), ip: req.ip });
  if (user.failedLoginAttempts >= 5) {
    user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
    user.failedLoginAttempts = 0;
  }
  await user.save();
};

exports.register = async (req, res) => {
  const { username, email, password, phone } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "تعذر إنشاء الحساب" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, password: hashedPassword, phone, isAdmin: false });
    res.status(201).json({ message: "تم إنشاء الحساب بنجاح", user: publicUser(user) });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "تعذر إنشاء الحساب" });
  }
};

exports.login = async (req, res) => {
  const { email, password, adminCode } = req.body;
  try {
    const user = await User.findOne({ email });
    const passwordMatches = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, "$2b$12$C6UzMDM.H6dfI/f/IKcEeU0eW7f7s4vSx7H7YQ3x3fGf7nJ4xQf5G");

    const locked = user && user.lockoutUntil && user.lockoutUntil > new Date();
    const adminMfaValid = !user?.isAdmin || (
      adminCode &&
      process.env.ADMIN_TOTP_SECRET &&
      speakeasy.totp.verify({ secret: process.env.ADMIN_TOTP_SECRET, encoding: "base32", token: adminCode, window: 1 })
    );
    if (!user || locked || !passwordMatches || !adminMfaValid) {
      await recordFailedLogin(user, req);
      return res.status(400).json({ message: invalidCredentials });
    }

    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await issueTokens(user, res);
    res.status(200).json({ message: "تم تسجيل الدخول", user: publicUser(user) });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "تعذر تسجيل الدخول" });
  }
};

exports.refresh = async (req, res) => {
  const token = req.cookies[REFRESH_COOKIE];
  if (!token) return res.status(401).json({ message: "انتهت الجلسة" });
  try {
    const tokenHash = hashRefreshToken(token);
    const user = await User.findOne({ "refreshTokens.tokenHash": tokenHash });
    const session = user?.refreshTokens.find((item) => item.tokenHash === tokenHash);
    if (!user || !session || session.expiresAt <= new Date()) {
      return res.status(401).json({ message: "انتهت الجلسة" });
    }
    user.refreshTokens = user.refreshTokens.filter((item) => item.tokenHash !== tokenHash);
    await issueTokens(user, res);
    res.json({ user: publicUser(user) });
  } catch (error) {
    console.error("Refresh error:", error.message);
    res.status(401).json({ message: "انتهت الجلسة" });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (token) {
      const tokenHash = hashRefreshToken(token);
      await User.updateOne({ "refreshTokens.tokenHash": tokenHash }, { $pull: { refreshTokens: { tokenHash } } });
    }
  } finally {
    res.clearCookie(ACCESS_COOKIE, cookieOptions);
    res.clearCookie(REFRESH_COOKIE, cookieOptions);
    res.json({ message: "تم تسجيل الخروج" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0, refreshTokens: 0 });
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "تعذر جلب المستخدمين" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "المستخدم غير موجود" });
    res.json({ message: "تم حذف المستخدم" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ message: "تعذر حذف المستخدم" });
  }
};
