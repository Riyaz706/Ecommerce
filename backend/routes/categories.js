const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @route   GET /api/categories
// @desc    Get all unique categories with product counts
// @access  Public
router.get('/', async (req, res) => {
    try {
        const categories = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    products: { $push: { _id: '$_id', name: '$name', images: '$images' } }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: '$_id',
                    count: 1,
                    sampleProducts: { $slice: ['$products', 3] }
                }
            },
            { $sort: { category: 1 } }
        ]);

        res.status(200).json({
            success: true,
            categories
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
