exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Review.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const Review = require('../models/Review');
const User = require('../models/User');

exports.createReview = async (req, res) => {
  try {
    const { rating, text, userId, username } = req.body;
    if (!userId || !username) return res.status(400).json({ message: 'User info required' });
    if (!rating || !text) return res.status(400).json({ message: 'Rating and text required' });

    const review = await Review.create({
      user: userId,
      username,
      rating,
      text
    });
    res.status(201).json({ message: 'Review added', review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
