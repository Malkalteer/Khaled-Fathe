const { body, param, validationResult } = require("express-validator");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    return res.status(400).json({
      message: first && typeof first.msg === "string" && first.msg !== "Invalid value"
        ? first.msg
        : "بيانات الإدخال غير صالحة",
      fields: errors.array().map((error) => error.path)
    });
  }
  next();
};

const httpsUrl = (field, label) =>
  body(field)
    .isString()
    .trim()
    .isURL({ protocols: ["http", "https"], require_protocol: true, require_tld: false })
    .withMessage(`${label} يجب أن يكون رابطاً صالحاً`)
    .isLength({ max: 1000 });

exports.handleValidation = handleValidation;

exports.idParam = (name = "id") => [
  param(name).isMongoId().withMessage("معرّف غير صالح"),
  handleValidation
];

const passwordRules = [
  body("password")
    .isString()
    .isLength({ min: 8, max: 200 })
    .matches(/[a-z]/)
    .matches(/[A-Z]/)
    .matches(/\d/)
    .withMessage("كلمة المرور يجب أن تحتوي على 8 أحرف، حرف كبير، حرف صغير، ورقم")
];

exports.registerValidation = [
  body("username").isString().trim().isLength({ min: 2, max: 80 }).withMessage("الاسم يجب أن يكون بين 2 و80 حرفاً"),
  body("email").isEmail().withMessage("البريد الإلكتروني غير صالح").normalizeEmail(),
  body("phone").isString().trim().isLength({ min: 5, max: 30 }).withMessage("رقم الهاتف غير صالح"),
  ...passwordRules,
  handleValidation
];

exports.googleValidation = [
  body("credential").isString().isLength({ min: 20, max: 5000 }).withMessage("بيانات جوجل غير صالحة"),
  handleValidation
];

exports.loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 1, max: 200 }),
  handleValidation
];

exports.categoryValidation = [
  body("name").isString().trim().isLength({ min: 1, max: 80 }).withMessage("اسم الفئة مطلوب (حتى 80 حرفاً)"),
  httpsUrl("image", "صورة الفئة"),
  handleValidation
];

exports.projectValidation = [
  body("title").isString().trim().isLength({ min: 1, max: 150 }).withMessage("عنوان العمل مطلوب (حتى 150 حرفاً)"),
  body("images").isArray({ min: 1, max: 20 }).withMessage("أضف صورة واحدة على الأقل (حتى 20 صورة)"),
  httpsUrl("images.*", "رابط الصورة"),
  body("code")
    .isString().withMessage("كود المنتج مطلوب")
    .trim()
    .toUpperCase()
    .matches(/^[\p{L}\p{N}][\p{L}\p{N}_-]{0,29}$/u)
    .withMessage("كود المنتج مطلوب: حروف وأرقام و - فقط، حتى 30 خانة"),
  body("categories").optional().isArray({ min: 1, max: 5 }).withMessage("اختر من فئة إلى 5 فئات"),
  body("categories.*").isMongoId().withMessage("اختر فئة صحيحة"),
  body("category").optional().isMongoId().withMessage("اختر فئة صحيحة"),
  body("categories").custom((value, { req }) => {
    if ((Array.isArray(value) && value.length > 0) || req.body.category) return true;
    throw new Error("اختر فئة واحدة على الأقل");
  }),
  body("description").optional({ values: "null" }).isString().trim().isLength({ max: 3000 }),
  body("price").optional({ values: "null" }).isFloat({ min: 0, max: 10000000 }).withMessage("السعر غير صالح").toFloat(),
  body("material").optional({ values: "null" }).isString().trim().isLength({ max: 200 }),
  body("dimensions").optional({ values: "null" }).isString().trim().isLength({ max: 1000 }),
  body("details").optional({ values: "null" }).isArray({ max: 50 }),
  body("details.*").isString().trim().isLength({ max: 300 }),
  body("hidden").optional().isBoolean().toBoolean(),
  body("bestSeller").optional().isBoolean().toBoolean(),
  handleValidation
];

exports.reorderValidation = [
  body("ids").isArray({ min: 1, max: 1000 }),
  body("ids.*").isMongoId(),
  handleValidation
];

exports.reviewValidation = [
  body("rating").isInt({ min: 1, max: 5 }).withMessage("التقييم يجب أن يكون من 1 إلى 5").toInt(),
  body("text").isString().trim().isLength({ min: 3, max: 1000 }).withMessage("التعليق يجب أن يكون بين 3 و1000 حرف"),
  handleValidation
];

exports.interactionValidation = [
  body("rating").optional({ values: "null" }).isInt({ min: 1, max: 5 }).toInt(),
  body("favorite").optional({ values: "null" }).isBoolean().toBoolean(),
  handleValidation
];

exports.chatValidation = [
  body("messages").isArray({ min: 1, max: 30 }).withMessage("المحادثة غير صالحة"),
  body("messages.*.role").isIn(["user", "model"]),
  body("messages.*.text").isString().trim().isLength({ min: 1, max: 2000 }).withMessage("الرسالة طويلة جداً"),
  handleValidation
];

exports.quoteValidation = [
  body("name").isString().trim().isLength({ min: 2, max: 80 }).withMessage("الاسم مطلوب"),
  body("phone").isString().trim().isLength({ min: 5, max: 30 }).withMessage("رقم الهاتف غير صالح"),
  body("email").optional({ values: "falsy" }).isEmail().withMessage("البريد الإلكتروني غير صالح").normalizeEmail(),
  body("message").optional({ values: "falsy" }).isString().trim().isLength({ max: 2000 }),
  body("product").optional({ values: "falsy" }).isMongoId(),
  handleValidation
];

exports.quoteStatusValidation = [
  body("status").isIn(["new", "in_progress", "done", "rejected"]).withMessage("حالة غير صالحة"),
  body("adminNote").optional({ values: "null" }).isString().trim().isLength({ max: 1000 }),
  handleValidation
];
