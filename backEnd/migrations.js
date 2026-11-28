const Project = require('./models/Project');

/** تحديثات بسيطة على البيانات تُنفَّذ عند تشغيل الخادم (آمنة للتكرار) */
module.exports = async () => {
  // المنتجات القديمة لها فئة واحدة في category: ننسخها إلى categories
  const res = await Project.updateMany(
    { category: { $ne: null }, $or: [{ categories: { $exists: false } }, { categories: { $size: 0 } }] },
    [{ $set: { categories: ['$category'] } }],
    { updatePipeline: true }
  );
  if (res.modifiedCount) console.log(`تم تحديث ${res.modifiedCount} منتج لدعم الفئات المتعددة`);
};
