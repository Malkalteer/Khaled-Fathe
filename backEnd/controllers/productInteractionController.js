const ProductInteraction = require('../models/ProductInteraction');
const Project = require('../models/Project');

const ensureProjectExists = async (productId) => {
  const project = await Project.findById(productId);
  if (!project) throw new Error('Project not found');
  return project;
};

exports.getProductStats = async (req, res) => {
  try {
    const { productId } = req.params;
    await ensureProjectExists(productId);

    const interactions = await ProductInteraction.find({ product: productId });

    const ratings = interactions
      .filter((item) => item.rating != null)
      .map((item) => item.rating);
    const totalRating = ratings.reduce((sum, value) => sum + value, 0);
    const averageRating = ratings.length ? totalRating / ratings.length : 0;
    const votes = ratings.length;
    const favorites = interactions.filter((item) => item.favorite).length;

    const userId = req.user ? req.user.sub || req.user.id : null;
    const userRating = userId
      ? await ProductInteraction.findOne({ product: productId, user: userId }).select('rating favorite')
      : null;

    res.json({
      productId,
      averageRating: Number(averageRating.toFixed(2)),
      votes,
      favorites,
      userRating: userRating ? userRating.rating : null,
      userFavorite: userRating ? userRating.favorite : false,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load product stats' });
  }
};

exports.saveInteraction = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'غير مصرح' });
    }

    const { productId } = req.params;
    const { rating, favorite } = req.body;
    const userId = req.user.sub || req.user.id;

    await ensureProjectExists(productId);

    const interaction = await ProductInteraction.findOne({ product: productId, user: userId });

    if (interaction) {
      if (rating != null) interaction.rating = Math.min(5, Math.max(1, Number(rating)));
      if (favorite != null) interaction.favorite = Boolean(favorite);
      await interaction.save();
      const updated = await ProductInteraction.findOne({ product: productId, user: userId }).select('rating favorite');
      return res.json({ success: true, interaction: updated });
    }

    const newInteraction = new ProductInteraction({
      product: productId,
      user: userId,
      rating: rating != null ? Math.min(5, Math.max(1, Number(rating))) : null,
      favorite: favorite != null ? Boolean(favorite) : false,
    });

    await newInteraction.save();
    res.status(201).json({ success: true, interaction: newInteraction });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to save interaction' });
  }
};
