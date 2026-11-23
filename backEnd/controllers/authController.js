const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Review = require("../models/Review");
const ProductInteraction = require("../models/ProductInteraction");
const HttpError = require("../utils/httpError");
const {
  issueTokens,
  hashRefreshToken,
  REFRESH_COOKIE,
  ACCESS_COOKIE,
  cookieOptions
} = require("../utils/authTokens");

const MAX_FAILED_LOGS = 20;
const LOCK_AFTER = 5;
const LOCK_MINUTES = 15;
// هاش وهمي لمقارنة وقت الاستجابة عندما لا يوجد المستخدم (يمنع كشف الإيميلات الموجودة)
const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEeU0eW7f7s4vSx7H7YQ3x3fGf7nJ4xQf5G";
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
  user.failedLoginLogs.push({ at: new Date(), ip: req.ip || "unknown" });
  // نحتفظ بآخر 20 محاولة فقط
  user.failedLoginLogs = user.failedLoginLogs.slice(-MAX_FAILED_LOGS);
  if (user.failedLoginAttempts >= LOCK_AFTER) {
    user.lockoutUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
    user.failedLoginAttempts = 0;
  }
  await user.save();
};

exports.register = async (req, res) => {
  const { username, email, password, phone } = req.body;
  const userExists = await User.exists({ email });
  if (userExists) throw new HttpError(400, "تعذر إنشاء الحساب، ربما البريد مستخدم مسبقاً");

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ username, email, password: hashedPassword, phone, isAdmin: false });
  res.status(201).json({ message: "تم إنشاء الحساب بنجاح", user: publicUser(user) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const passwordMatches = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);

  const locked = user && user.lockoutUntil && user.lockoutUntil > new Date();
  if (!user || locked || !passwordMatches) {
    await recordFailedLogin(user, req);
    throw new HttpError(400, invalidCredentials);
  }

  user.failedLoginAttempts = 0;
  user.lockoutUntil = null;
  await issueTokens(user, res);
  res.status(200).json({ message: "تم تسجيل الدخول", user: publicUser(user) });
};

exports.refresh = async (req, res) => {
  const token = req.cookies[REFRESH_COOKIE];
  if (!token) throw new HttpError(401, "انتهت الجلسة");

  const tokenHash = hashRefreshToken(token);
  const user = await User.findOne({ "refreshTokens.tokenHash": tokenHash });
  const session = user?.refreshTokens.find((item) => item.tokenHash === tokenHash);
  if (!user || !session || session.expiresAt <= new Date()) {
    throw new HttpError(401, "انتهت الجلسة");
  }
  user.refreshTokens = user.refreshTokens.filter((item) => item.tokenHash !== tokenHash);
  await issueTokens(user, res);
  res.json({ user: publicUser(user) });
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) throw new HttpError(401, "انتهت الجلسة");
  res.json({ user: publicUser(user) });
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
  const users = await User.find({}, { password: 0, refreshTokens: 0, failedLoginLogs: 0 }).sort({ createdAt: -1 });
  res.json({ users });
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  if (id === req.user.sub) throw new HttpError(400, "لا يمكنك حذف حسابك الحالي");

  const user = await User.findById(id);
  if (!user) throw new HttpError(404, "المستخدم غير موجود");
  if (user.isAdmin) throw new HttpError(403, "لا يمكن حذف حساب مدير");

  const userId = new mongoose.Types.ObjectId(id);
  await Promise.all([
    User.deleteOne({ _id: userId }),
    Review.deleteMany({ user: userId }),
    ProductInteraction.deleteMany({ user: userId })
  ]);
  res.json({ message: "تم حذف المستخدم" });
};
