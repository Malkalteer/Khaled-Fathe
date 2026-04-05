const Project = require('../models/Project');

exports.getProjects = async (req, res) => {
  const projects = await Project.find().populate('category').sort({ createdAt: -1 });
  res.json(projects);
};

exports.createProject = async (req, res) => {
  const { title, images, category, description } = req.body;
  const proj = new Project({ title, images, category, description });
  await proj.save();
  res.status(201).json(proj);
};

exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const { title, images, category, description } = req.body;
  const proj = await Project.findByIdAndUpdate(id, { title, images, category, description }, { new: true });
  res.json(proj);
};

exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  await Project.findByIdAndDelete(id);
  res.json({ success: true });
};
