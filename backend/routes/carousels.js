const express = require('express');
const router = express.Router();
const Carousel = require('../models/Carousel');

// @route   GET /api/carousels
// @desc    Get active carousel images (customer facing)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const carousels = await Carousel.find({ isActive: true })
            .sort({ order: 1 })
            .select('-__v');

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

module.exports = router;
