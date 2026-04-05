const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// POST /api/reviews
router.post('/', reviewController.createReview);
// GET /api/reviews
router.get('/', reviewController.getReviews);
// DELETE /api/reviews/:id
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
