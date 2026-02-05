const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
    return process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET;
};

// Multer storage configuration
let storage;

if (isCloudinaryConfigured()) {
    // Use Cloudinary storage if configured
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'ecommerce',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            transformation: [{ width: 1920, crop: 'limit' }]
        }
    });
} else {
    // Use disk storage as fallback
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        }
    });
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload only images.'), false);
        }
    }
});

// Upload image to Cloudinary
const uploadToCloudinary = async (file, folder = 'ecommerce') => {
    if (!isCloudinaryConfigured()) {
        throw new Error('Cloudinary is not configured');
    }

    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: folder,
            transformation: [{ width: 1920, crop: 'limit' }]
        });

        return {
            url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        console.error('Cloudinary Upload Error Details:', error);
        throw new Error('Error uploading to Cloudinary: ' + (error.message || JSON.stringify(error)));
    }
};

// Delete image from Cloudinary
const deleteFromCloudinary = async (public_id) => {
    if (!isCloudinaryConfigured() || !public_id) {
        return;
    }

    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
    }
};

module.exports = {
    cloudinary,
    upload,
    uploadToCloudinary,
    deleteFromCloudinary,
    isCloudinaryConfigured
};
