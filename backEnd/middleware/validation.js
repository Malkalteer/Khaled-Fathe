const { body, validationResult } = require("express-validator");

const passwordRules = [
  body("password")
    .isLength({ min: 8 })
    .matches(/[a-z]/)
    .matches(/[A-Z]/)
    .matches(/\d/)
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "بيانات الإدخال غير صالحة" });
  next();
};

exports.registerValidation = [
  body("username").trim().isLength({ min: 2, max: 80 }),
  body("email").isEmail().normalizeEmail(),
  body("phone").trim().isLength({ min: 5, max: 30 }),
  ...passwordRules,
  handleValidation
];

exports.loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 1, max: 200 }),
  handleValidation
];