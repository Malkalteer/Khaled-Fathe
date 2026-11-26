const { execFileSync } = require('child_process');
const mongoose = require('mongoose');
const path = require('path');
const { app, request, createUser } = require('./helpers');
const User = require('../models/User');
const seed = require('../seed');

describe('admin email', () => {
  test('set-admin-email script changes the login email (gmail dots accepted)', async () => {
    const admin = await createUser({ isAdmin: true, email: 'old-admin@test.dev' });
    execFileSync('node', [path.join(__dirname, '../scripts/set-admin-email.js'), 'Engkhaledfathy.khf@gmail.com'], {
      env: { ...process.env, MONGO_URI: mongoose.connection.client.s.url },
    });
    const updated = await User.findById(admin._id);
    expect(updated.email).toBe('engkhaledfathykhf@gmail.com');

    for (const typed of ['Engkhaledfathy.khf@gmail.com', 'engkhaledfathykhf@gmail.com']) {
      const res = await request(app).post('/api/auth/login').send({ email: typed, password: 'Passw0rd!' });
      expect(res.status).toBe(200);
      expect(res.body.user.isAdmin).toBe(true);
    }
    expect((await request(app).post('/api/auth/login').send({ email: 'old-admin@test.dev', password: 'Passw0rd!' })).status).toBe(400);
  });

  test('seed uses the same normalization, so it does not create a duplicate admin', async () => {
    await createUser({ isAdmin: true, email: 'engkhaledfathykhf@gmail.com' });
    process.env.ADMIN_EMAIL = 'Engkhaledfathy.khf@gmail.com';
    process.env.ADMIN_PASSWORD = 'Whatever123';
    await seed();
    expect(await User.countDocuments({ isAdmin: true })).toBe(1);
  });
});
