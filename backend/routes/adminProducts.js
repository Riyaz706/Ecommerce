const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { upload, uploadToCloudinary, deleteFromCloudinary, isCloudinaryConfigured } = require('../utils/cloudinary');

// @route   GET /api/admin/products
// @desc    Get all products
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Build filter object
        const query = {};

        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { brand: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        if (req.query.category) {
            query.category = req.query.category;
        }

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            products,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/admin/products/:id
// @desc    Get single product
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/admin/products
// @desc    Create product
// @access  Private
router.post('/', protect, upload.array('images', 5), async (req, res) => {
    try {
        const productData = req.body;

        // Handle image uploads
        if (req.files && req.files.length > 0) {
            const imagePromises = req.files.map(async (file) => {
                if (isCloudinaryConfigured()) {
                    // File is already uploaded to Cloudinary by multer-storage-cloudinary
                    // file.path should contain the secure_url
                    // Use file.secure_url if available, otherwise use file.path
                    return {
                        url: file.secure_url || file.path || file.url,
                        public_id: file.filename || file.public_id
                    };
                } else {
                    // For local storage
                    return {
                        url: `/uploads/${file.filename}`,
                        public_id: file.filename
                    };
                }
            });

            productData.images = await Promise.all(imagePromises);
        }

        // Parse JSON fields if they're strings
        if (typeof productData.sizes === 'string') {
            productData.sizes = JSON.parse(productData.sizes);
        }
        if (typeof productData.colors === 'string') {
            productData.colors = JSON.parse(productData.colors);
        }

        // Calculate total quantity from sizes and colors if not provided
        if (!productData.quantity || productData.quantity === 0) {
            let totalSizeQty = 0;
            let totalColorQty = 0;
            
            if (productData.sizes && Array.isArray(productData.sizes)) {
                totalSizeQty = productData.sizes.reduce((sum, size) => sum + (parseInt(size.quantity) || 0), 0);
            }
            if (productData.colors && Array.isArray(productData.colors)) {
                totalColorQty = productData.colors.reduce((sum, color) => {
                    const qty = typeof color === 'object' ? (parseInt(color.quantity) || 0) : 0;
                    return sum + qty;
                }, 0);
            }
            
            productData.quantity = Math.max(totalSizeQty, totalColorQty);
        }

        // Calculate discounted price if discount percent is provided
        if (productData.discountPercent && productData.price) {
            productData.discountedPrice = productData.price - (productData.price * productData.discountPercent / 100);
        }

        const product = await Product.create(productData);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/products/:id
// @desc    Update product
// @access  Private
router.put('/:id', protect, upload.array('images', 5), async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const updateData = req.body;

        // Handle new image uploads
        if (req.files && req.files.length > 0) {
            const imagePromises = req.files.map(async (file) => {
                if (isCloudinaryConfigured()) {
                    // Use file.secure_url if available, otherwise use file.path
                    return {
                        url: file.secure_url || file.path || file.url,
                        public_id: file.filename || file.public_id
                    };
                } else {
                    return {
                        url: `/uploads/${file.filename}`,
                        public_id: file.filename
                    };
                }
            });

            const newImages = await Promise.all(imagePromises);

            // Append new images to existing ones
            updateData.images = [...(product.images || []), ...newImages];
        }

        // Parse JSON fields if they're strings
        if (typeof updateData.sizes === 'string') {
            updateData.sizes = JSON.parse(updateData.sizes);
        }
        if (typeof updateData.colors === 'string') {
            updateData.colors = JSON.parse(updateData.colors);
        }

        // Calculate total quantity from sizes and colors if sizes/colors are updated
        if (updateData.sizes || updateData.colors) {
            const sizesToUse = updateData.sizes || product.sizes || [];
            const colorsToUse = updateData.colors || product.colors || [];
            
            let totalSizeQty = 0;
            let totalColorQty = 0;
            
            if (Array.isArray(sizesToUse)) {
                totalSizeQty = sizesToUse.reduce((sum, size) => sum + (parseInt(size.quantity) || 0), 0);
            }
            if (Array.isArray(colorsToUse)) {
                totalColorQty = colorsToUse.reduce((sum, color) => {
                    const qty = typeof color === 'object' ? (parseInt(color.quantity) || 0) : 0;
                    return sum + qty;
                }, 0);
            }
            
            updateData.quantity = Math.max(totalSizeQty, totalColorQty);
        }

        // Recalculate discounted price if needed
        if (updateData.discountPercent && (updateData.price || product.price)) {
            const price = updateData.price || product.price;
            updateData.discountedPrice = price - (price * updateData.discountPercent / 100);
        }

        product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete product
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Delete images from Cloudinary
        if (product.images && product.images.length > 0) {
            for (const image of product.images) {
                if (image.public_id) {
                    await deleteFromCloudinary(image.public_id);
                }
            }
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/admin/products/:id/images/:imageId
// @desc    Delete specific image from product
// @access  Private
router.delete('/:id/images/:imageId', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const imageIndex = product.images.findIndex(
            img => img._id.toString() === req.params.imageId
        );

        if (imageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        const image = product.images[imageIndex];

        // Delete from Cloudinary
        if (image.public_id) {
            await deleteFromCloudinary(image.public_id);
        }

        // Remove image from array
        product.images.splice(imageIndex, 1);
        await product.save();

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
