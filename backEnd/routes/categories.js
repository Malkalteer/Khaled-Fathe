const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', categoryController.getCategories);
router.post('/', requireAuth, requireAdmin, categoryController.createCategory);
router.put('/:id', requireAuth, requireAdmin, categoryController.updateCategory);
router.delete('/:id', requireAuth, requireAdmin, categoryController.deleteCategory);

module.exports = router;
