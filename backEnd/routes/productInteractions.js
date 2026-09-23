const express = require('express');
const router = express.Router();
const { requireAuth, optionalAuth } = require('../middleware/auth');
const productInteractionController = require('../controllers/productInteractionController');

router.get('/favorites', requireAuth, productInteractionController.getUserFavorites);
router.get('/:productId', optionalAuth, productInteractionController.getProductStats);
router.post('/:productId', requireAuth, productInteractionController.saveInteraction);
router.put('/:productId', requireAuth, productInteractionController.saveInteraction);

module.exports = router;
