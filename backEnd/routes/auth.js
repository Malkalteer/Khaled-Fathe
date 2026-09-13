const express = require("express");
const rateLimit = require("express-rate-limit");
const { register, login, refresh, logout, getAllUsers, deleteUser } = require("../controllers/authController");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { registerValidation, loginValidation } = require("../middleware/validation");

const router = express.Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false });

// جلب جميع المستخدمين (للأدمن)
router.get("/users", requireAuth, requireAdmin, getAllUsers);
// حذف مستخدم
router.delete("/users/:id", requireAuth, requireAdmin, deleteUser);
router.post("/register", registerValidation, register);
router.post("/login", loginLimiter, loginValidation, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

module.exports = router;
