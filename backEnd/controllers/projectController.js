const Project = require('../models/Project');

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('category').sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { title, images, category, description, price, material, dimensions, details } = req.body;
    const proj = new Project({
      title,
      images,
      category,
      description,
      price: Number(price) || 0,
      material: material || '',
      dimensions: dimensions || '',
      details: Array.isArray(details) ? details : []
    });
    await proj.save();
    res.status(201).json(proj);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, images, category, description, price, material, dimensions, details } = req.body;
    const proj = await Project.findByIdAndUpdate(id, {
      title,
      images,
      category,
      description,
      price: Number(price) || 0,
      material: material || '',
      dimensions: dimensions || '',
      details: Array.isArray(details) ? details : []
    }, { new: true });
    res.json(proj);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await Project.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
};
