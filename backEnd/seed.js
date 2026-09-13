const bcrypt = require('bcryptjs');
const User = require('./models/User');

module.exports = async () => {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  }

  const email = process.env.ADMIN_EMAIL.toLowerCase().trim();
  const existingAdmin = await User.findOne({ email });
  if (existingAdmin) return;

  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await User.create({
    username: 'Administrator',
    email,
    password,
    phone: 'not-provided',
    isAdmin: true
  });
  console.log('تم إنشاء حساب الأدمن الافتراضي بنجاح');
};
