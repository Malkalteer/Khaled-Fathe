const express = require('express');
const reviewController = require('../controllers/reviewController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { idParam, reviewValidation } = require('../middleware/validation');
const { reviewLimiter } = require('../middleware/rateLimits');

const router = express.Router();
const admin = [requireAuth, requireAdmin];

router.get('/', reviewController.getReviews);
router.get('/admin', ...admin, reviewController.getAllReviews);
router.post('/', requireAuth, reviewLimiter, reviewValidation, reviewController.createReview);
router.patch('/:id', ...admin, idParam(), reviewController.setApproval);
router.delete('/:id', ...admin, idParam(), reviewController.deleteReview);

module.exports = router;
