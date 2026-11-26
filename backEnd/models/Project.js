const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  images: { type: [String], required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  description: { type: String, default: '' },
  price: { type: Number, default: 0, min: 0 },
  material: { type: String, default: '' },
  dimensions: { type: String, default: '' },
  details: { type: [String], default: [] },
  // إخفاء العمل من الموقع بدلاً من حذفه
  hidden: { type: Boolean, default: false, index: true },
  // يظهر في قسم «الأكثر مبيعاً» في الصفحة الرئيسية (يحدده المدير)
  bestSeller: { type: Boolean, default: false, index: true },
  // ترتيب العرض (الأصغر أولاً) ويُضبط بالسحب من لوحة التحكم
  order: { type: Number, default: 0 },
}, { timestamps: true });

ProjectSchema.index({ order: 1, createdAt: -1 });

module.exports = mongoose.model('Project', ProjectSchema);
