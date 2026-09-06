const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const { GridFSBucket, ObjectId } = mongoose.mongo;
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        cb(null, file.mimetype.startsWith('image/'));
    },
});

const getBucket = () => new GridFSBucket(mongoose.connection.db, { bucketName: 'images' });

router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'الرجاء اختيار صورة' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
        {
            folder: 'khaled-designs',
            resource_type: 'image',
            use_filename: true,
            unique_filename: true,
        },
        (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                return res.status(500).json({ message: 'فشل حفظ الصورة' });
            }

            res.status(201).json({ url: result.secure_url });
        },
    );

    uploadStream.end(req.file.buffer);
});

router.get('/:id', async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'معرّف الصورة غير صالح' });
    }

    try {
        const fileId = new ObjectId(req.params.id);
        const file = await getBucket().find({ _id: fileId }).next();
        if (!file) return res.status(404).json({ message: 'الصورة غير موجودة' });

        res.set('Content-Type', file.contentType || 'application/octet-stream');
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
        getBucket().openDownloadStream(fileId).pipe(res);
    } catch (error) {
        console.error('GridFS read error:', error);
        res.status(500).json({ message: 'فشل قراءة الصورة' });
    }
});

module.exports = router;
