const { app, request, createUser, login } = require('./helpers');
const User = require('../models/User');
const { MAX_SESSIONS } = require('../utils/authTokens');

describe('auth', () => {
  test('register validates input and creates a non-admin user', async () => {
    const bad = await request(app).post('/api/auth/register').send({ username: 'a', email: 'x', phone: '1', password: '123' });
    expect(bad.status).toBe(400);

    const res = await request(app).post('/api/auth/register').send({
      username: 'Ahmad', email: 'Ahmad@Test.dev', phone: '0123456', password: 'Passw0rd1', isAdmin: true,
    });
    expect(res.status).toBe(201);
    const user = await User.findOne({ email: 'ahmad@test.dev' });
    expect(user.isAdmin).toBe(false);
  });

  test('login sets httpOnly cookies and /me returns the user', async () => {
    const user = await createUser();
    const agent = await login(user);
    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(user.email);
    expect(me.body.user.password).toBeUndefined();
  });

  test('wrong password returns a generic error and failed logs are capped at 20', async () => {
    const user = await createUser();
    for (let i = 0; i < 25; i += 1) {
      const res = await request(app).post('/api/auth/login').send({ email: user.email, password: 'Wrong123' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('بيانات الدخول غير صحيحة');
    }
    const fresh = await User.findById(user._id);
    expect(fresh.failedLoginLogs.length).toBe(20);
    expect(fresh.lockoutUntil.getTime()).toBeGreaterThan(Date.now());
  });

  test('refresh tokens are pruned and capped', async () => {
    const user = await createUser();
    user.refreshTokens.push({ tokenHash: 'expired', expiresAt: new Date(Date.now() - 1000) });
    await user.save();
    for (let i = 0; i < MAX_SESSIONS + 3; i += 1) await login(user);
    const fresh = await User.findById(user._id);
    expect(fresh.refreshTokens.length).toBe(MAX_SESSIONS);
    expect(fresh.refreshTokens.find((t) => t.tokenHash === 'expired')).toBeUndefined();
  });

  test('refresh rotates the session', async () => {
    const user = await createUser();
    const agent = await login(user);
    const res = await agent.post('/api/auth/refresh');
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(String(user._id));
  });

  test('admin cannot delete another admin and users list hides secrets', async () => {
    const admin = await createUser({ isAdmin: true });
    const other = await createUser({ isAdmin: true, email: 'admin2@test.dev' });
    const agent = await login(admin);
    expect((await agent.delete(`/api/auth/users/${other._id}`)).status).toBe(403);
    expect((await agent.delete('/api/auth/users/not-an-id')).status).toBe(400);
    const list = await agent.get('/api/auth/users');
    expect(list.status).toBe(200);
    expect(list.body.users[0].password).toBeUndefined();
    expect(list.body.users[0].refreshTokens).toBeUndefined();
  });
});
