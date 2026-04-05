const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.json(categories);
};

exports.createCategory = async (req, res) => {
  const { name, image } = req.body;
  const cat = new Category({ name, image });
  await cat.save();
  res.status(201).json(cat);
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, image } = req.body;
  const cat = await Category.findByIdAndUpdate(id, { name, image }, { new: true });
  res.json(cat);
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  await Category.findByIdAndDelete(id);
  res.json({ success: true });
};
