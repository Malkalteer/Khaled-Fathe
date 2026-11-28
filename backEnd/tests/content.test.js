const { app, request, createUser, login, createProject } = require('./helpers');
const Category = require('../models/Category');
const Project = require('../models/Project');

describe('projects & categories', () => {
  test('only admins can create projects and input is validated', async () => {
    const user = await createUser();
    const userAgent = await login(user);
    const cat = await Category.create({ name: 'رخام', image: 'https://img.test/c.jpg' });
    const payload = { title: 'لوحة', code: 'pn-001', images: ['https://img.test/1.jpg'], category: String(cat._id), price: 10 };

    expect((await request(app).post('/api/projects').send(payload)).status).toBe(401);
    expect((await userAgent.post('/api/projects').send(payload)).status).toBe(403);

    const admin = await login(await createUser({ isAdmin: true }));
    const invalid = await admin.post('/api/projects').send({ ...payload, images: ['javascript:alert(1)'] });
    expect(invalid.status).toBe(400);
    const noCat = await admin.post('/api/projects').send({ ...payload, category: '64b000000000000000000000' });
    expect(noCat.status).toBe(400);

    expect((await admin.post('/api/projects').send({ ...payload, code: '' })).status).toBe(400);

    const ok = await admin.post('/api/projects').send(payload);
    expect(ok.status).toBe(201);
    expect(ok.body.title).toBe('لوحة');
    expect(ok.body.code).toBe('PN-001');

    const dup = await admin.post('/api/projects').send({ ...payload, code: 'PN-001' });
    expect(dup.status).toBe(409);
    expect(dup.body.message).toContain('PN-001');
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

describe('best sellers', () => {
  test('admin can flag a project as best seller and it is returned publicly', async () => {
    const project = await createProject();
    const admin = await login(await createUser({ isAdmin: true }));
    expect((await request(app).patch(`/api/projects/${project._id}/best-seller`).send({ bestSeller: true })).status).toBe(401);
    const res = await admin.patch(`/api/projects/${project._id}/best-seller`).send({ bestSeller: true });
    expect(res.status).toBe(200);
    expect((await request(app).get('/api/projects')).body[0].bestSeller).toBe(true);
  });
});

describe('multiple categories', () => {
  test('a project can belong to two categories and shows in both; category delete is blocked by either', async () => {
    const [a, b] = await Category.insertMany([{ name: 'أبواب', image: 'https://img.test/a.jpg' }, { name: 'هدايا', image: 'https://img.test/b.jpg' }]);
    const admin = await login(await createUser({ isAdmin: true }));
    const res = await admin.post('/api/projects').send({
      title: 'باب', code: 'D-1', images: ['https://img.test/p.jpg'], categories: [String(a._id), String(b._id), String(a._id)],
    });
    expect(res.status).toBe(201);
    expect(res.body.categories.map(String)).toEqual([String(a._id), String(b._id)]);
    expect(String(res.body.category)).toBe(String(a._id));

    const pub = (await request(app).get('/api/projects')).body[0];
    expect(pub.categories.map((c) => c.name)).toEqual(['أبواب', 'هدايا']);

    expect((await admin.delete(`/api/categories/${b._id}`)).status).toBe(409);

    const upd = await admin.put(`/api/projects/${res.body._id}`).send({ title: 'باب', code: 'D-1', images: ['https://img.test/p.jpg'], categories: [String(b._id)] });
    expect(upd.status).toBe(200);
    expect(String(upd.body.category)).toBe(String(b._id));
    expect((await admin.delete(`/api/categories/${a._id}`)).status).toBe(200);
  });

  test('startup migration copies the old single category into categories', async () => {
    const project = await createProject();
    await Project.collection.updateOne({ _id: project._id }, { $unset: { categories: '' } });
    await require('../migrations')();
    const fresh = await Project.findById(project._id).lean();
    expect(fresh.categories.map(String)).toEqual([String(project.category)]);
  });
});
