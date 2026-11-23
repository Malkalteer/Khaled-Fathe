const User = require('../models/User');
const Project = require('../models/Project');
const Category = require('../models/Category');
const Review = require('../models/Review');
const QuoteRequest = require('../models/QuoteRequest');
const ProductInteraction = require('../models/ProductInteraction');

// GET /api/admin/stats — أرقام لوحة التحكم في طلب واحد
exports.getStats = async (req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [
    users, newUsers, projects, hiddenProjects, categories,
    reviews, pendingReviews, quotes, newQuotes, favorites, ratingAgg, topRated, latestQuotes, latestReviews,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: weekAgo } }),
    Project.countDocuments(),
    Project.countDocuments({ hidden: true }),
    Category.countDocuments(),
    Review.countDocuments(),
    Review.countDocuments({ approved: false }),
    QuoteRequest.countDocuments(),
    QuoteRequest.countDocuments({ status: 'new' }),
    ProductInteraction.countDocuments({ favorite: true }),
    Review.aggregate([{ $match: { approved: { $ne: false } } }, { $group: { _id: null, avg: { $avg: '$rating' } } }]),
    ProductInteraction.aggregate([
      { $match: { rating: { $ne: null } } },
      { $group: { _id: '$product', avg: { $avg: '$rating' }, votes: { $sum: 1 } } },
      { $sort: { avg: -1, votes: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } },
      { $unwind: '$project' },
      { $project: { _id: 1, avg: 1, votes: 1, title: '$project.title', image: { $arrayElemAt: ['$project.images', 0] } } },
    ]),
    QuoteRequest.find().sort({ createdAt: -1 }).limit(5).select('name phone status createdAt file.name').lean(),
    Review.find({ approved: false }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  res.json({
    users, newUsers, projects, hiddenProjects, categories,
    reviews, pendingReviews, quotes, newQuotes, favorites,
    averageReview: ratingAgg[0] ? Number(ratingAgg[0].avg.toFixed(2)) : 0,
    topRated: topRated.map((p) => ({ ...p, avg: Number(p.avg.toFixed(2)) })),
    latestQuotes,
    latestReviews,
  });
};
