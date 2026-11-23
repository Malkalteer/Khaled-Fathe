const express = require('express');
const categoryController = require('../controllers/categoryController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { idParam, categoryValidation } = require('../middleware/validation');

const router = express.Router();
const admin = [requireAuth, requireAdmin];

router.get('/', categoryController.getCategories);
router.post('/', ...admin, categoryValidation, categoryController.createCategory);
router.put('/:id', ...admin, idParam(), categoryValidation, categoryController.updateCategory);
router.delete('/:id', ...admin, idParam(), categoryController.deleteCategory);

module.exports = router;
