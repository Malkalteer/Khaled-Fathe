const mongoose = require('mongoose');
const ProductInteraction = require('../models/ProductInteraction');
const Project = require('../models/Project');
const HttpError = require('../utils/httpError');
const { getStatsForProducts, withStats, getUserId } = require('../services/productStats');

const ensureProjectExists = async (productId) => {
  if (!(await Project.exists({ _id: productId }))) throw new HttpError(404, 'العمل غير موجود');
};

const statsResponse = async (productId, userId) => {
  const stats = await getStatsForProducts([productId], userId);
  return { productId, ...stats.get(String(productId)) };
};

exports.getProductStats = async (req, res) => {
  const { productId } = req.params;
  await ensureProjectExists(productId);
  res.json(await statsResponse(productId, getUserId(req)));
};

// GET /api/product-interactions/favorites — استعلامان فقط مهما كان عدد المفضلة
exports.getUserFavorites = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(getUserId(req));
  const favorites = await ProductInteraction.find({ user: userId, favorite: true }).select('product').lean();
  const projects = await Project.find({ _id: { $in: favorites.map((f) => f.product) }, hidden: { $ne: true } })
    .populate('category', '_id name')
    .populate('categories', '_id name')
    .lean();
  const data = await withStats(projects, userId);
  res.json(data.map((p) => ({
    _id: p._id,
    title: p.title,
    description: p.description || '',
    images: p.images || [],
    category: p.category || null,
    categories: p.categories || [],
    code: p.code,
    price: p.price,
    averageRating: p.averageRating,
    votes: p.votes,
    favorites: p.favorites,
    userRating: p.userRating,
    userFavorite: true,
  })));
};

exports.saveInteraction = async (req, res) => {
  const { productId } = req.params;
  const { rating, favorite } = req.body;
  const userId = getUserId(req);
  await ensureProjectExists(productId);

  const update = {};
  if (rating != null) update.rating = rating;
  if (favorite != null) update.favorite = favorite;
  if (Object.keys(update).length === 0) throw new HttpError(400, 'لا يوجد شيء لحفظه');

  await ProductInteraction.findOneAndUpdate(
    { product: productId, user: userId },
    { $set: update },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );
  res.json(await statsResponse(productId, userId));
};
