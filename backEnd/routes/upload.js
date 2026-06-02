index-BAFcG2Bq.js:185  GET https://khaled-fathe.onrender.com/categories 404 (Not Found)const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// التأكد من وجود مجلد uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// إعداد التخزين للصور
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // إنشاء اسم فريد
    }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'الرجاء اختيار صورة' });
    }
    // إعادة مسار الصورة ليتم حفظه في الداتا بيز
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

module.exports = router;
