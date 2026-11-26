/**
 * تغيير البريد الذي يسجّل به المدير الدخول (مع الإبقاء على كلمة المرور نفسها).
 *
 *   npm run admin:email -- Engkhaledfathy.khf@gmail.com
 *
 * بعدها غيّر ADMIN_EMAIL في ملف .env إلى نفس البريد، ثم أعد تشغيل الخادم.
 */
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const User = require('../models/User');
const { normalizeEmail } = require('../utils/email');

(async () => {
  const input = process.argv[2];
  if (!input || !/^\S+@\S+\.\S+$/.test(input)) throw new Error('اكتب البريد الجديد بعد الأمر، مثال: npm run admin:email -- name@gmail.com');
  const email = normalizeEmail(input);

  await mongoose.connect(process.env.MONGO_URI);
  const admins = await User.find({ isAdmin: true });
  if (admins.length === 0) throw new Error('لا يوجد حساب مدير في قاعدة البيانات');

  const taken = await User.findOne({ email });
  if (taken && !taken.isAdmin) throw new Error('هذا البريد مستخدم في حساب عميل. احذف ذلك الحساب أولاً من لوحة التحكم.');
  if (taken && taken.isAdmin) {
    console.log(`✓ حساب المدير يستخدم هذا البريد بالفعل: ${input}`);
  } else {
    const current = normalizeEmail(process.env.ADMIN_EMAIL || '');
    const admin = admins.length === 1 ? admins[0] : admins.find((a) => a.email === current);
    if (!admin) throw new Error('يوجد أكثر من مدير؛ ضع البريد الحالي في ADMIN_EMAIL داخل .env ثم أعد المحاولة');
    const old = admin.email;
    admin.email = email;
    admin.refreshTokens = []; // تسجيل الخروج من كل الأجهزة
    await admin.save();
    console.log(`✓ تم تغيير بريد المدير من ${old} إلى ${input}`);
  }
  console.log('\nالخطوة التالية: عدّل السطر التالي في ملف .env ثم أعد تشغيل الخادم:');
  console.log(`ADMIN_EMAIL=${input}`);
  await mongoose.disconnect();
})().catch(async (error) => {
  console.error('خطأ:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
