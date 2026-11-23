const path = require('path');
const QuoteRequest = require('../models/QuoteRequest');
const Project = require('../models/Project');
const HttpError = require('../utils/httpError');
const { uploadBuffer } = require('../services/cloudinary');
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
    const ext = path.extname(req.file.originalname).toLowerCase();
    const result = await uploadBuffer(req.file.buffer, {
      folder: 'khaled-designs/quotes',
      resource_type: 'raw',
      use_filename: true,
      unique_filename: true,
      filename_override: path.basename(req.file.originalname, ext).replace(/[^\w؀-ۿ-]+/g, '_').slice(0, 60) + ext,
    });
    file = { url: result.secure_url, name: req.file.originalname.slice(0, 200), size: req.file.size, publicId: result.public_id };
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
  res.json({ success: true });
};
