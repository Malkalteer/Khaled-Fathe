const Project = require('../models/Project');
const Category = require('../models/Category');
const ProductInteraction = require('../models/ProductInteraction');
const HttpError = require('../utils/httpError');
const { withStats, getUserId } = require('../services/productStats');

const SORT = { order: 1, createdAt: -1 };

const pickProjectFields = (body) => ({
  title: body.title,
  images: body.images,
  category: body.category,
  description: body.description || '',
  price: Number(body.price) || 0,
  material: body.material || '',
  dimensions: body.dimensions || '',
  details: Array.isArray(body.details) ? body.details.filter(Boolean) : [],
  ...(typeof body.hidden === 'boolean' ? { hidden: body.hidden } : {}),
  ...(typeof body.bestSeller === 'boolean' ? { bestSeller: body.bestSeller } : {}),
});

const ensureCategory = async (categoryId) => {
  if (!(await Category.exists({ _id: categoryId }))) throw new HttpError(400, 'الفئة المختارة غير موجودة');
};

// GET /api/projects — الأعمال الظاهرة فقط مع إحصائيات التقييم والمفضلة (طلب واحد)
exports.getProjects = async (req, res) => {
  const projects = await Project.find({ hidden: { $ne: true } }).populate('category').sort(SORT).lean();
  res.json(await withStats(projects, getUserId(req)));
};

// GET /api/projects/admin — كل الأعمال بما فيها المخفية
exports.getAdminProjects = async (req, res) => {
  const projects = await Project.find().populate('category').sort(SORT).lean();
  res.json(await withStats(projects));
};

// GET /api/projects/:id
exports.getProject = async (req, res) => {
  const project = await Project.findById(req.params.id).populate('category').lean();
  const isAdmin = Boolean(req.user && req.user.isAdmin);
  if (!project || (project.hidden && !isAdmin)) throw new HttpError(404, 'العمل غير موجود');
  const [withData] = await withStats([project], getUserId(req));
  res.json(withData);
};

exports.createProject = async (req, res) => {
  const data = pickProjectFields(req.body);
  await ensureCategory(data.category);
  // العمل الجديد يظهر أولاً
  const first = await Project.findOne().sort({ order: 1 }).select('order').lean();
  const project = await Project.create({ ...data, order: first ? first.order - 1 : 0 });
  res.status(201).json(project);
};

exports.updateProject = async (req, res) => {
  const data = pickProjectFields(req.body);
  await ensureCategory(data.category);
  const project = await Project.findByIdAndUpdate(req.params.id, data, { returnDocument: 'after', runValidators: true });
  if (!project) throw new HttpError(404, 'العمل غير موجود');
  res.json(project);
};

// PATCH /api/projects/:id/visibility  { hidden: boolean }
exports.setVisibility = async (req, res) => {
  if (typeof req.body.hidden !== 'boolean') throw new HttpError(400, 'قيمة الإخفاء غير صالحة');
  const project = await Project.findByIdAndUpdate(req.params.id, { hidden: req.body.hidden }, { returnDocument: 'after' });
  if (!project) throw new HttpError(404, 'العمل غير موجود');
  res.json(project);
};

// PATCH /api/projects/:id/best-seller  { bestSeller: boolean }
exports.setBestSeller = async (req, res) => {
  if (typeof req.body.bestSeller !== 'boolean') throw new HttpError(400, 'قيمة غير صالحة');
  const project = await Project.findByIdAndUpdate(req.params.id, { bestSeller: req.body.bestSeller }, { returnDocument: 'after' });
  if (!project) throw new HttpError(404, 'العمل غير موجود');
  res.json(project);
};

// PUT /api/projects/reorder  { ids: [...] } بالترتيب المطلوب
exports.reorderProjects = async (req, res) => {
  const ids = [...new Set(req.body.ids)];
  await Project.bulkWrite(ids.map((id, index) => ({
    updateOne: { filter: { _id: id }, update: { $set: { order: index } } },
  })));
  res.json({ success: true });
};

exports.deleteProject = async (req, res) => {
  const deleted = await Project.findByIdAndDelete(req.params.id);
  if (!deleted) throw new HttpError(404, 'العمل غير موجود');
  await ProductInteraction.deleteMany({ product: deleted._id });
  res.json({ success: true });
};
