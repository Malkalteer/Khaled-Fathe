const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { chatValidation } = require('../middleware/validation');
const { chatLimiter } = require('../middleware/rateLimits');
const { chat } = require('../controllers/chatController');

const router = express.Router();

router.post('/', requireAuth, chatLimiter, chatValidation, chat);

module.exports = router;
