const Category = require('../models/Category');
const Project = require('../models/Project');
const HttpError = require('../utils/httpError');

exports.getCategories = async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 }).lean();
  res.json(categories);
};

exports.createCategory = async (req, res) => {
  const { name, image } = req.body;
  const category = await Category.create({ name, image });
  res.status(201).json(category);
};

exports.updateCategory = async (req, res) => {
  const { name, image } = req.body;
  const category = await Category.findByIdAndUpdate(req.params.id, { name, image }, { returnDocument: 'after', runValidators: true });
  if (!category) throw new HttpError(404, 'الفئة غير موجودة');
  res.json(category);
};

exports.deleteCategory = async (req, res) => {
  const count = await Project.countDocuments({ $or: [{ category: req.params.id }, { categories: req.params.id }] });
  if (count > 0) {
    throw new HttpError(409, `لا يمكن حذف الفئة لأنها تحتوي على ${count} عمل. انقل الأعمال أو احذفها أولاً.`);
  }
  const deleted = await Category.findByIdAndDelete(req.params.id);
  if (!deleted) throw new HttpError(404, 'الفئة غير موجودة');
  res.json({ success: true });
};
