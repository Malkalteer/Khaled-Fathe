const bcrypt = require('bcryptjs');
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Category = require('../models/Category');
const Project = require('../models/Project');

const PASSWORD = 'Passw0rd!';

exports.createUser = async ({ isAdmin = false, email } = {}) => {
  const user = await User.create({
    username: isAdmin ? 'Admin' : 'Client',
    email: email || (isAdmin ? 'admin@test.dev' : `user${Date.now()}${Math.random()}@test.dev`),
    password: await bcrypt.hash(PASSWORD, 4),
    phone: '0123456789',
    isAdmin,
  });
  return user;
};

/** يعيد agent يحمل كوكيز الجلسة */
exports.login = async (user) => {
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/login').send({ email: user.email, password: PASSWORD });
  if (res.status !== 200) throw new Error(`login failed: ${res.status} ${JSON.stringify(res.body)}`);
  return agent;
};

exports.createProject = async (overrides = {}) => {
  const category = overrides.category || (await Category.create({ name: 'خشب', image: 'https://img.test/c.jpg' }))._id;
  return Project.create({ title: 'طاولة', images: ['https://img.test/p.jpg'], category, ...overrides });
};

exports.app = app;
exports.request = request;
