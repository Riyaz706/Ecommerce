const express = require('express');
const router = express.Router();
const Carousel = require('../models/Carousel');
const { protect } = require('../middleware/auth');
const { upload, uploadToCloudinary, deleteFromCloudinary, isCloudinaryConfigured } = require('../utils/cloudinary');

// @route   GET /api/admin/carousels
// @desc    Get all carousel images
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const carousels = await Carousel.find().sort({ order: 1 });

        res.status(200).json({
            success: true,
            carousels
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/admin/carousels
// @desc    Create carousel
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image'
            });
        }

        const carouselData = {
            title: req.body.title,
            link: req.body.link,
            order: req.body.order || 0,
            isActive: req.body.isActive !== 'false',
            image: {}
        };

        // Handle image upload
        if (isCloudinaryConfigured()) {
            carouselData.image = {
                url: req.file.path,
                public_id: req.file.filename
            };
        } else {
            carouselData.image = {
                url: `/uploads/${req.file.filename}`,
                public_id: req.file.filename
            };
        }

        const carousel = await Carousel.create(carouselData);

        res.status(201).json({
            success: true,
            message: 'Carousel created successfully',
            carousel
        });
    } catch (error) {
        console.error('Error in create carousel:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/carousels/:id
// @desc    Update carousel
// @access  Private
router.put('/:id', protect, upload.single('image'), async (req, res) => {
    try {
        let carousel = await Carousel.findById(req.params.id);

        if (!carousel) {
            return res.status(404).json({
                success: false,
                message: 'Carousel not found'
            });
        }

        const updateData = {
            title: req.body.title,
            link: req.body.link,
            order: req.body.order,
            isActive: req.body.isActive !== 'false'
        };

        // If new image is uploaded, delete old one and upload new
        if (req.file) {
            // Delete old image
            if (carousel.image?.public_id) {
                await deleteFromCloudinary(carousel.image.public_id);
            }

            // Upload new image
            if (isCloudinaryConfigured()) {
                updateData.image = {
                    url: req.file.path,
                    public_id: req.file.filename
                };
            } else {
                updateData.image = {
                    url: `/uploads/${req.file.filename}`,
                    public_id: req.file.filename
                };
            }
        }

        carousel = await Carousel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Carousel updated successfully',
            carousel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/admin/carousels/:id
// @desc    Delete carousel
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const carousel = await Carousel.findById(req.params.id);

        if (!carousel) {
            return res.status(404).json({
                success: false,
                message: 'Carousel not found'
            });
        }

        // Delete image from Cloudinary
        if (carousel.image?.public_id) {
            await deleteFromCloudinary(carousel.image.public_id);
        }

        await Carousel.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Carousel deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/admin/carousels/reorder
// @desc    Reorder carousels
// @access  Private
router.put('/reorder', protect, async (req, res) => {
    try {
        const { carousels } = req.body; // Array of { id, order }

        if (!Array.isArray(carousels)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format'
            });
        }

        // Update order for each carousel
        const updatePromises = carousels.map(({ id, order }) =>
            Carousel.findByIdAndUpdate(id, { order })
        );

        await Promise.all(updatePromises);

        const updatedCarousels = await Carousel.find().sort({ order: 1 });

        res.status(200).json({
            success: true,
            message: 'Carousels reordered successfully',
            carousels: updatedCarousels
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
