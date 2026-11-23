const { app, request, createUser, login, createProject } = require('./helpers');

describe('ratings, favorites & reviews', () => {
  test('rating and favorite return aggregated stats; favorites list works', async () => {
    const project = await createProject();
    const u1 = await login(await createUser());
    const u2 = await login(await createUser());

    const r1 = await u1.post(`/api/product-interactions/${project._id}`).send({ rating: 5, favorite: true });
    expect(r1.status).toBe(200);
    expect(r1.body).toMatchObject({ averageRating: 5, votes: 1, favorites: 1, userRating: 5, userFavorite: true });

    const r2 = await u2.post(`/api/product-interactions/${project._id}`).send({ rating: 2 });
    expect(r2.body).toMatchObject({ averageRating: 3.5, votes: 2, favorites: 1, userRating: 2, userFavorite: false });

    expect((await u1.post(`/api/product-interactions/${project._id}`).send({ rating: 9 })).status).toBe(400);

    const favs = await u1.get('/api/product-interactions/favorites');
    expect(favs.status).toBe(200);
    expect(favs.body).toHaveLength(1);
    expect(favs.body[0]).toMatchObject({ title: project.title, averageRating: 3.5, votes: 2 });

    const list = await u1.get('/api/projects');
    expect(list.body[0]).toMatchObject({ userRating: 5, userFavorite: true });
  });

  test('reviews use the session user, wait for approval, then show publicly', async () => {
    const user = await createUser();
    const agent = await login(user);
    const res = await agent.post('/api/reviews').send({
      rating: 4, text: 'عمل ممتاز', userId: '64b000000000000000000000', username: 'Hacker',
    });
    expect(res.status).toBe(201);
    expect(res.body.review.username).toBe(user.username);
    expect(String(res.body.review.user)).toBe(String(user._id));

    expect((await request(app).get('/api/reviews')).body.reviews).toHaveLength(0);

    const admin = await login(await createUser({ isAdmin: true }));
    const pending = await admin.get('/api/reviews/admin');
    expect(pending.body.reviews[0].approved).toBe(false);
    expect((await admin.patch(`/api/reviews/${res.body.review._id}`).send({ approved: true })).status).toBe(200);

    const pub = await request(app).get('/api/reviews');
    expect(pub.body.reviews).toHaveLength(1);
    expect(pub.body.reviews[0].user).toBeUndefined();
  });

  test('chat requires login and validates messages', async () => {
    expect((await request(app).post('/api/chat').send({ messages: [{ role: 'user', text: 'hi' }] })).status).toBe(401);
    const agent = await login(await createUser());
    expect((await agent.post('/api/chat').send({ messages: [] })).status).toBe(400);
    const chat = require('../controllers/chatController');
    chat._setClient({ models: { generateContent: async () => ({ text: 'أهلاً' }) } });
    process.env.GEMINI_API_KEY = 'test';
    const ok = await agent.post('/api/chat').send({ messages: [{ role: 'user', text: 'مرحبا' }] });
    expect(ok.status).toBe(200);
    expect(ok.body.text).toBe('أهلاً');
  });

  test('quote request without a file is stored and visible to admins', async () => {
    const project = await createProject();
    const res = await request(app).post('/api/quotes')
      .field('name', 'محمد').field('phone', '0100000000').field('message', 'أريد لوحة 1x2 م')
      .field('product', String(project._id));
    expect(res.status).toBe(201);

    const bad = await request(app).post('/api/quotes')
      .field('name', 'محمد').field('phone', '0100000000')
      .attach('file', Buffer.from('MZ'), 'virus.exe');
    expect(bad.status).toBe(400);

    const admin = await login(await createUser({ isAdmin: true }));
    const list = await admin.get('/api/quotes');
    expect(list.body.quotes).toHaveLength(1);
    expect(list.body.quotes[0].product.title).toBe(project.title);
    const upd = await admin.patch(`/api/quotes/${list.body.quotes[0]._id}`).send({ status: 'done' });
    expect(upd.body.quote.status).toBe('done');

    const stats = await admin.get('/api/admin/stats');
    expect(stats.status).toBe(200);
    expect(stats.body).toMatchObject({ projects: 1, quotes: 1, newQuotes: 0 });
  });
});
