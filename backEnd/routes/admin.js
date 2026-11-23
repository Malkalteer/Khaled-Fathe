const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { getStats } = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', requireAuth, requireAdmin, getStats);

module.exports = router;
