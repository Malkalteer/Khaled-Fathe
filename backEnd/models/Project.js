const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  images: { type: [String], required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, default: '' },
  price: { type: Number, default: 0 },
  material: { type: String, default: '' },
  dimensions: { type: String, default: '' },
  details: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);