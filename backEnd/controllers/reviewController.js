const Review = require('../models/Review');
const User = require('../models/User');
const HttpError = require('../utils/httpError');

const PUBLISHED = { approved: { $ne: false } };

// POST /api/reviews — صاحب التقييم يُؤخذ من الجلسة فقط، وليس من جسم الطلب
exports.createReview = async (req, res) => {
  const user = await User.findById(req.user.sub).select('username isAdmin');
  if (!user) throw new HttpError(401, 'انتهت الجلسة');

  const review = await Review.create({
    user: user._id,
    username: user.username,
    rating: req.body.rating,
    text: req.body.text,
    approved: Boolean(user.isAdmin),
  });
  res.status(201).json({
    message: review.approved ? 'تم نشر التقييم' : 'شكراً لك! سيظهر تقييمك بعد مراجعة الإدارة',
    review,
  });
};

// GET /api/reviews — المنشورة فقط
exports.getReviews = async (req, res) => {
  const reviews = await Review.find(PUBLISHED).select('-user').sort({ createdAt: -1 }).limit(100).lean();
  res.json({ reviews });
};

// GET /api/reviews/admin — الكل للإدارة
exports.getAllReviews = async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 }).lean();
  res.json({
    reviews: reviews.map((review) => ({ ...review, approved: review.approved !== false })),
  });
};

// PATCH /api/reviews/:id  { approved: boolean }
exports.setApproval = async (req, res) => {
  if (typeof req.body.approved !== 'boolean') throw new HttpError(400, 'قيمة غير صالحة');
  const review = await Review.findByIdAndUpdate(req.params.id, { approved: req.body.approved }, { returnDocument: 'after' });
  if (!review) throw new HttpError(404, 'التقييم غير موجود');
  res.json({ review });
};

exports.deleteReview = async (req, res) => {
  const deleted = await Review.findByIdAndDelete(req.params.id);
  if (!deleted) throw new HttpError(404, 'التقييم غير موجود');
  res.json({ message: 'تم حذف التقييم' });
};
