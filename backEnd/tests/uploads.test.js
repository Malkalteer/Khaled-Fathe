const sharp = require('sharp');
const { app, request, createUser, login } = require('./helpers');

const asBuffer = (req) => req.buffer(true).parse((r, cb) => {
  const chunks = [];
  r.on('data', (c) => chunks.push(c));
  r.on('end', () => cb(null, Buffer.concat(chunks)));
});

const pngBuffer = () =>
  sharp({ create: { width: 3000, height: 1500, channels: 3, background: { r: 200, g: 120, b: 40 } } }).png().toBuffer();

describe('local file storage', () => {
  test('admin image upload is converted to webp, resized and served from /uploads', async () => {
    const admin = await login(await createUser({ isAdmin: true }));
    const res = await admin.post('/api/upload').attach('image', await pngBuffer(), { filename: 'photo.png', contentType: 'image/png' });
    expect(res.status).toBe(201);
    expect(res.body.url).toMatch(/\/uploads\/images\/\d{4}\/\d{2}\/[a-f0-9]{32}\.webp$/);

    const path = new URL(res.body.url).pathname;
    const file = await asBuffer(request(app).get(path));
    expect(file.status).toBe(200);
    expect(file.headers['content-type']).toBe('image/webp');
    expect(file.headers['cache-control']).toContain('immutable');
    const meta = await sharp(file.body).metadata();
    expect(meta.format).toBe('webp');
    expect(meta.width).toBe(2000);
  });

  test('fake images and non-admins are rejected', async () => {
    const admin = await login(await createUser({ isAdmin: true }));
    const fake = await admin.post('/api/upload').attach('image', Buffer.from('<script>alert(1)</script>'), { filename: 'x.png', contentType: 'image/png' });
    expect(fake.status).toBe(400);

    const user = await login(await createUser());
    const denied = await user.post('/api/upload').attach('image', await pngBuffer(), { filename: 'a.png', contentType: 'image/png' });
    expect(denied.status).toBe(403);
  });

  test('quote files are private: only admins can download them', async () => {
    const res = await request(app).post('/api/quotes')
      .field('name', 'سامي').field('phone', '0100000000')
      .attach('file', Buffer.from('0\nSECTION\n2\nENTITIES'), 'door.dxf');
    expect(res.status).toBe(201);

    const admin = await login(await createUser({ isAdmin: true }));
    const { quotes } = (await admin.get('/api/quotes')).body;
    expect(quotes[0].file.url).toBe(`/api/quotes/${quotes[0]._id}/file`);

    expect((await request(app).get(quotes[0].file.url)).status).toBe(401);
    const dl = await asBuffer(admin.get(quotes[0].file.url));
    expect(dl.status).toBe(200);
    expect(dl.headers['content-disposition']).toContain('door.dxf');
    expect(dl.body.toString()).toContain('SECTION');

    expect((await admin.delete(`/api/quotes/${quotes[0]._id}`)).status).toBe(200);
  });

  test('path traversal is impossible', () => {
    const { resolvePrivateFile } = require('../services/storage');
    expect(() => resolvePrivateFile('../../etc/passwd')).toThrow();
  });
});
