const mongoose = require('mongoose');
const ProductInteraction = require('../models/ProductInteraction');

const toObjectId = (id) => (id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(String(id)));

const emptyStats = () => ({ averageRating: 0, votes: 0, favorites: 0, userRating: null, userFavorite: false });

/**
 * يحسب إحصائيات عدة منتجات باستعلام aggregate واحد (بدلاً من طلب لكل منتج).
 * يعيد Map: productId -> { averageRating, votes, favorites, userRating, userFavorite }
 */
exports.getStatsForProducts = async (productIds, userId = null) => {
  const ids = productIds.map(toObjectId);
  const result = new Map(ids.map((id) => [String(id), emptyStats()]));
  if (ids.length === 0) return result;

  const [aggregated, userInteractions] = await Promise.all([
    ProductInteraction.aggregate([
      { $match: { product: { $in: ids } } },
      {
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          votes: { $sum: { $cond: [{ $ne: [{ $ifNull: ['$rating', null] }, null] }, 1, 0] } },
          favorites: { $sum: { $cond: ['$favorite', 1, 0] } },
        },
      },
    ]),
    userId && mongoose.isValidObjectId(userId)
      ? ProductInteraction.find({ product: { $in: ids }, user: toObjectId(userId) }).select('product rating favorite').lean()
      : [],
  ]);

  for (const row of aggregated) {
    const entry = result.get(String(row._id));
    if (!entry) continue;
    entry.averageRating = Number((row.averageRating || 0).toFixed(2));
    entry.votes = row.votes;
    entry.favorites = row.favorites;
  }
  for (const row of userInteractions) {
    const entry = result.get(String(row.product));
    if (!entry) continue;
    entry.userRating = row.rating ?? null;
    entry.userFavorite = Boolean(row.favorite);
  }
  return result;
};

exports.withStats = async (projects, userId = null) => {
  const stats = await exports.getStatsForProducts(projects.map((p) => p._id), userId);
  return projects.map((project) => ({ ...project, ...stats.get(String(project._id)) }));
};

exports.getUserId = (req) => (req.user ? req.user.sub || req.user.id : null);
