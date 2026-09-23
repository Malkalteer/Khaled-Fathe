const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const productInteractionController = require('../controllers/productInteractionController');

router.get('/:productId', productInteractionController.getProductStats);
router.post('/:productId', requireAuth, productInteractionController.saveInteraction);
router.put('/:productId', requireAuth, productInteractionController.saveInteraction);

module.exports = router;
