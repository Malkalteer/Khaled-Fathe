const express = require('express');
const projectController = require('../controllers/projectController');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');
const { idParam, projectValidation, reorderValidation } = require('../middleware/validation');

const router = express.Router();
const admin = [requireAuth, requireAdmin];

router.get('/', optionalAuth, projectController.getProjects);
router.get('/admin', ...admin, projectController.getAdminProjects);
router.put('/reorder', ...admin, reorderValidation, projectController.reorderProjects);
router.get('/:id', optionalAuth, idParam(), projectController.getProject);
router.post('/', ...admin, projectValidation, projectController.createProject);
router.put('/:id', ...admin, idParam(), projectValidation, projectController.updateProject);
router.patch('/:id/visibility', ...admin, idParam(), projectController.setVisibility);
router.delete('/:id', ...admin, idParam(), projectController.deleteProject);

module.exports = router;
