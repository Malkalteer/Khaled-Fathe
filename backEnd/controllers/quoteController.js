const path = require('path');
const QuoteRequest = require('../models/QuoteRequest');
const Project = require('../models/Project');
const HttpError = require('../utils/httpError');
const { savePrivateFile, resolvePrivateFile, deletePrivateFile } = require('../services/storage');
const { getUserId } = require('../services/productStats');

exports.ALLOWED_EXTENSIONS = ['.dxf', '.stl', '.dwg', '.svg', '.pdf', '.step', '.stp', '.obj', '.ai', '.eps', '.png', '.jpg', '.jpeg'];

// POST /api/quotes  (multipart/form-data) — طلب عرض سعر مع ملف تصميم اختياري
exports.createQuote = async (req, res) => {
  const { name, phone, email, message, product } = req.body;
  if (!req.file && !(message && message.trim())) {
    throw new HttpError(400, 'أرفق ملف التصميم أو اكتب وصفاً للمشروع');
  }
  if (product && !(await Project.exists({ _id: product }))) {
    throw new HttpError(400, 'المنتج المحدد غير موجود');
  }

  let file = undefined;
  if (req.file) {
    const storedPath = await savePrivateFile(req.file.buffer, req.file.originalname);
    file = { path: storedPath, name: path.basename(req.file.originalname).slice(0, 200), size: req.file.size };
  }

  const quote = await QuoteRequest.create({
    name,
    phone,
    email: email || '',
    message: message || '',
    product: product || null,
    user: getUserId(req),
    file,
  });
  if (file) {
    // رابط التحميل يمر عبر الخادم ويتطلب صلاحية المدير
    quote.file.url = `/api/quotes/${quote._id}/file`;
    await quote.save();
  }
  res.status(201).json({ message: 'تم استلام طلبك، سنتواصل معك قريباً', id: quote._id });
};

exports.getQuotes = async (req, res) => {
  const filter = req.query.status ? { status: String(req.query.status) } : {};
  const quotes = await QuoteRequest.find(filter).populate('product', 'title images').sort({ createdAt: -1 }).limit(500).lean();
  res.json({ quotes });
};

exports.updateQuote = async (req, res) => {
  const update = { status: req.body.status };
  if (typeof req.body.adminNote === 'string') update.adminNote = req.body.adminNote;
  const quote = await QuoteRequest.findByIdAndUpdate(req.params.id, update, { returnDocument: 'after' }).populate('product', 'title images');
  if (!quote) throw new HttpError(404, 'الطلب غير موجود');
  res.json({ quote });
};

exports.deleteQuote = async (req, res) => {
  const deleted = await QuoteRequest.findByIdAndDelete(req.params.id);
  if (!deleted) throw new HttpError(404, 'الطلب غير موجود');
  await deletePrivateFile(deleted.file && deleted.file.path);
  res.json({ success: true });
};

// GET /api/quotes/:id/file — تحميل ملف العميل (للمدير فقط)
exports.downloadQuoteFile = async (req, res) => {
  const quote = await QuoteRequest.findById(req.params.id).select('file').lean();
  if (!quote || !quote.file || !quote.file.path) throw new HttpError(404, 'الملف غير موجود');
  const full = resolvePrivateFile(quote.file.path);
  res.set('X-Content-Type-Options', 'nosniff');
  res.download(full, quote.file.name || path.basename(full), { dotfiles: 'deny' }, (err) => {
    if (err && !res.headersSent) res.status(404).json({ message: 'الملف غير موجود على السيرفر' });
  });
};
