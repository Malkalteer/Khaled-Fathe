const os = require('os');
const fs = require('fs');
const path = require('path');

// مجلد مؤقت للملفات المرفوعة أثناء الاختبارات
process.env.UPLOADS_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'khf-uploads-'));

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
  fs.rmSync(process.env.UPLOADS_DIR, { recursive: true, force: true });
});
