const express = require("express");
const { register, login, getAllUsers } = require("../controllers/authController");

const router = express.Router();


// جلب جميع المستخدمين (للأدمن)
router.get("/users", getAllUsers);
// حذف مستخدم
router.delete("/users/:id", require("../controllers/authController").deleteUser);
router.post("/register", register);
router.post("/login", login);

module.exports = router;
