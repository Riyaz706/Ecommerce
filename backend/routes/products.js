const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @route   GET /api/products
// @desc    Get all products (customer facing)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, subcategory, minPrice, maxPrice, search, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        let query = { isActive: true };

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by subcategory
        if (subcategory) {
            query.subcategory = subcategory;
        }

        // Filter by price range (using discountedPrice)
        if (minPrice || maxPrice) {
            query.discountedPrice = {};
            if (minPrice) query.discountedPrice.$gte = parseFloat(minPrice);
            if (maxPrice) query.discountedPrice.$lte = parseFloat(maxPrice);
        }

        // Search by name or description
        if (search) {
            query.$text = { $search: search };
        }

        // Sort logic
        let sortOption = { createdAt: -1 };
        if (req.query.sort) {
            switch (req.query.sort) {
                case 'price_asc':
                    sortOption = { price: 1 };
                    break;
                case 'price_desc':
                    sortOption = { price: -1 };
                    break;
                case 'name_asc':
                    sortOption = { name: 1 };
                    break;
                case 'name_desc':
                    sortOption = { name: -1 };
                    break;
            }
        }

        const products = await Product.find(query)
            .select('-__v')
            .sort(sortOption)
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            products,
            pagination: {
                total,
                page: parseInt(page),
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

// @route   GET /api/products/:id
// @desc    Get single product (customer facing)
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, isActive: true });

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
        if (error.kind === 'ObjectId' || error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', async (req, res) => {
    try {
        const { minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        let query = {
            category: req.params.category,
            isActive: true
        };

        // Filter by price range (using discountedPrice as it's the selling price)
        if (minPrice || maxPrice) {
            query.discountedPrice = {};
            if (minPrice) query.discountedPrice.$gte = parseFloat(minPrice);
            if (maxPrice) query.discountedPrice.$lte = parseFloat(maxPrice);
        }

        // Sort logic
        let sortOption = { createdAt: -1 };
        if (sort) {
            switch (sort) {
                case 'price_asc':
                    sortOption = { price: 1 };
                    break;
                case 'price_desc':
                    sortOption = { price: -1 };
                    break;
                case 'name_asc':
                    sortOption = { name: 1 };
                    break;
                case 'name_desc':
                    sortOption = { name: -1 };
                    break;
            }
        }

        const products = await Product.find(query)
            .select('-__v')
            .sort(sortOption)
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            products,
            pagination: {
                total,
                page: parseInt(page),
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

module.exports = router;
