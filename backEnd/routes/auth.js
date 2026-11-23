const express = require("express");
const { register, login, refresh, logout, me, getAllUsers, deleteUser } = require("../controllers/authController");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { registerValidation, loginValidation, idParam } = require("../middleware/validation");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimits");

const router = express.Router();

router.get("/users", requireAuth, requireAdmin, getAllUsers);
router.delete("/users/:id", requireAuth, requireAdmin, idParam(), deleteUser);
router.post("/register", registerLimiter, registerValidation, register);
router.post("/login", loginLimiter, loginValidation, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

module.exports = router;
