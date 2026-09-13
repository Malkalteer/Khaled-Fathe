const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// POST /api/reviews
router.post('/', requireAuth, reviewController.createReview);
// GET /api/reviews
router.get('/', reviewController.getReviews);
// DELETE /api/reviews/:id
router.delete('/:id', requireAuth, requireAdmin, reviewController.deleteReview);

module.exports = router;
