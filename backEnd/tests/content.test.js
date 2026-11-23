const { app, request, createUser, login, createProject } = require('./helpers');
const Category = require('../models/Category');
const Project = require('../models/Project');

describe('projects & categories', () => {
  test('only admins can create projects and input is validated', async () => {
    const user = await createUser();
    const userAgent = await login(user);
    const cat = await Category.create({ name: 'رخام', image: 'https://img.test/c.jpg' });
    const payload = { title: 'لوحة', images: ['https://img.test/1.jpg'], category: String(cat._id), price: 10 };

    expect((await request(app).post('/api/projects').send(payload)).status).toBe(401);
    expect((await userAgent.post('/api/projects').send(payload)).status).toBe(403);

    const admin = await login(await createUser({ isAdmin: true }));
    const invalid = await admin.post('/api/projects').send({ ...payload, images: ['javascript:alert(1)'] });
    expect(invalid.status).toBe(400);
    const noCat = await admin.post('/api/projects').send({ ...payload, category: '64b000000000000000000000' });
    expect(noCat.status).toBe(400);

    const ok = await admin.post('/api/projects').send(payload);
    expect(ok.status).toBe(201);
    expect(ok.body.title).toBe('لوحة');
  });

  test('invalid or missing ids return 400/404 instead of 500', async () => {
    expect((await request(app).get('/api/projects/abc')).status).toBe(400);
    expect((await request(app).get('/api/projects/64b000000000000000000000')).status).toBe(404);
    expect((await request(app).get('/api/product-interactions/64b000000000000000000000')).status).toBe(404);
  });

  test('hidden projects are excluded publicly but listed for admins; stats are inline', async () => {
    const visible = await createProject({ title: 'ظاهر' });
    await createProject({ title: 'مخفي', hidden: true, category: visible.category });

    const pub = await request(app).get('/api/projects');
    expect(pub.status).toBe(200);
    expect(pub.body.map((p) => p.title)).toEqual(['ظاهر']);
    expect(pub.body[0]).toMatchObject({ averageRating: 0, votes: 0, favorites: 0 });

    const admin = await login(await createUser({ isAdmin: true }));
    const all = await admin.get('/api/projects/admin');
    expect(all.body).toHaveLength(2);
  });

  test('reorder sets the display order', async () => {
    const a = await createProject({ title: 'A' });
    const b = await createProject({ title: 'B', category: a.category });
    const admin = await login(await createUser({ isAdmin: true }));
    expect((await admin.put('/api/projects/reorder').send({ ids: [String(b._id), String(a._id)] })).status).toBe(200);
    const pub = await request(app).get('/api/projects');
    expect(pub.body.map((p) => p.title)).toEqual(['B', 'A']);
  });

  test('a category with projects cannot be deleted', async () => {
    const project = await createProject();
    const admin = await login(await createUser({ isAdmin: true }));
    expect((await admin.delete(`/api/categories/${project.category}`)).status).toBe(409);
    await Project.deleteMany({});
    expect((await admin.delete(`/api/categories/${project.category}`)).status).toBe(200);
  });

  test('server errors do not leak internal messages', async () => {
    const spy = jest.spyOn(Project, 'find').mockImplementation(() => { throw new Error('secret db detail'); });
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('secret');
    spy.mockRestore();
    errSpy.mockRestore();
  });

  test('sitemap lists visible projects only', async () => {
    const visible = await createProject();
    const hidden = await createProject({ hidden: true, category: visible.category });
    const res = await request(app).get('/sitemap.xml');
    expect(res.status).toBe(200);
    expect(res.text).toContain(`/project/${visible._id}`);
    expect(res.text).not.toContain(`/project/${hidden._id}`);
    expect(res.text).toContain(`/portfolio/${visible.category}`);
  });
});
