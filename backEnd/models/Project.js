const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  // كود المنتج (يدخله المدير، فريد) ويُرسل مع طلبات واتساب
  code: { type: String, trim: true, uppercase: true, maxlength: 30 },
  images: { type: [String], required: true },
  // الفئة الأساسية (الأولى) — للتوافق مع البيانات القديمة
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  // كل الفئات التي يظهر فيها المنتج (فئة أو أكثر)
  categories: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], default: undefined, index: true },
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
ProjectSchema.index({ code: 1 }, { unique: true, sparse: true });

// يُبقي category و categories متطابقتين
ProjectSchema.pre('validate', function syncCategories() {
  if (Array.isArray(this.categories) && this.categories.length > 0) {
    const unique = [...new Map(this.categories.map((c) => [String(c), c])).values()];
    this.categories = unique;
    this.category = unique[0];
  } else if (this.category) {
    this.categories = [this.category];
  }
  if (this.code === '') this.code = undefined;
});

module.exports = mongoose.model('Project', ProjectSchema);
