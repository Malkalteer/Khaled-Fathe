const express = require('express');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { idParam, interactionValidation } = require('../middleware/validation');
const controller = require('../controllers/productInteractionController');

const router = express.Router();
const productId = idParam('productId');

router.get('/favorites', requireAuth, controller.getUserFavorites);
router.get('/:productId', optionalAuth, productId, controller.getProductStats);
router.post('/:productId', requireAuth, productId, interactionValidation, controller.saveInteraction);
router.put('/:productId', requireAuth, productId, interactionValidation, controller.saveInteraction);

module.exports = router;
