const { app, request, createUser } = require('./helpers');
const User = require('../models/User');
const auth = require('../controllers/authController');

const fakeGoogle = (payload) => auth._setGoogleVerifier(async (token) => {
  if (token !== 'valid-google-credential-token') throw new Error('bad token');
  return payload;
});

describe('Google sign-in', () => {
  beforeEach(() => { process.env.GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com'; });
  afterAll(() => { delete process.env.GOOGLE_CLIENT_ID; auth._setGoogleVerifier(null); });

  test('config exposes the client id', async () => {
    expect((await request(app).get('/api/auth/config')).body.googleClientId).toBe('test-client.apps.googleusercontent.com');
  });

  test('new Google user is created without password and gets a session', async () => {
    fakeGoogle({ sub: 'g-123', email: 'New.Person@gmail.com', email_verified: true, name: 'سامر', picture: 'https://pic' });
    const agent = request.agent(app);
    const res = await agent.post('/api/auth/google').send({ credential: 'valid-google-credential-token' });
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ username: 'سامر', isAdmin: false, hasPassword: false });
    expect((await agent.get('/api/auth/me')).status).toBe(200);
    const user = await User.findOne({ googleId: 'g-123' });
    expect(user.email).toBe('newperson@gmail.com');

    // password login cannot be used for a Google-only account
    expect((await request(app).post('/api/auth/login').send({ email: 'newperson@gmail.com', password: 'anything1A' })).status).toBe(400);
  });

  test('admin with the same Gmail is linked and keeps admin rights', async () => {
    const admin = await createUser({ isAdmin: true, email: 'engkhaledfathykhf@gmail.com' });
    fakeGoogle({ sub: 'g-admin', email: 'Engkhaledfathy.khf@gmail.com', email_verified: true, name: 'Khaled' });
    const res = await request(app).post('/api/auth/google').send({ credential: 'valid-google-credential-token' });
    expect(res.status).toBe(200);
    expect(res.body.user.isAdmin).toBe(true);
    expect((await User.findById(admin._id)).googleId).toBe('g-admin');
    expect(await User.countDocuments()).toBe(1);
  });

  test('rejects invalid tokens and unverified emails', async () => {
    fakeGoogle({ sub: 'g-x', email: 'x@gmail.com', email_verified: false });
    expect((await request(app).post('/api/auth/google').send({ credential: 'wrong-token-wrong-token' })).status).toBe(401);
    expect((await request(app).post('/api/auth/google').send({ credential: 'valid-google-credential-token' })).status).toBe(401);
  });

  test('disabled when GOOGLE_CLIENT_ID is not set', async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    expect((await request(app).post('/api/auth/google').send({ credential: 'valid-google-credential-token' })).status).toBe(503);
  });
});
