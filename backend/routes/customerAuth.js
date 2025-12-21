const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const { protect } = require('../middleware/customerAuth');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @route   POST /api/customer/register
// @desc    Register a new customer
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Validation
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if customer already exists
        const customerExists = await Customer.findOne({ email });
        if (customerExists) {
            return res.status(400).json({
                success: false,
                message: 'Customer with this email already exists'
            });
        }

        // Create customer
        const customer = await Customer.create({
            name,
            email,
            phone,
            password
        });

        // Generate token
        const token = generateToken(customer._id);

        res.status(201).json({
            success: true,
            message: 'Customer registered successfully',
            customer: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone
            },
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/customer/login
// @desc    Login customer
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find customer
        const customer = await Customer.findOne({ email });
        if (!customer || !customer.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await customer.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(customer._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            customer: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone
            },
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/customer/me
// @desc    Get customer profile
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const customer = await Customer.findById(req.customer._id).populate('orders');

        res.status(200).json({
            success: true,
            customer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/customer/profile
// @desc    Update customer profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, phone } = req.body;

        const customer = await Customer.findById(req.customer._id);

        if (name) customer.name = name;
        if (phone) customer.phone = phone;

        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            customer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/customer/address
// @desc    Add new address
// @access  Private
router.post('/address', protect, async (req, res) => {
    try {
        const { name, phone, street, city, state, pinCode, isDefault } = req.body;

        const customer = await Customer.findById(req.customer._id);

        // If this is default, unset other defaults
        if (isDefault) {
            customer.addresses.forEach(addr => addr.isDefault = false);
        }

        customer.addresses.push({
            name,
            phone,
            street,
            city,
            state,
            pinCode,
            isDefault: isDefault || customer.addresses.length === 0
        });

        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Address added successfully',
            addresses: customer.addresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/customer/address/:id
// @desc    Update address
// @access  Private
router.put('/address/:id', protect, async (req, res) => {
    try {
        const customer = await Customer.findById(req.customer._id);
        const address = customer.addresses.id(req.params.id);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        Object.assign(address, req.body);

        // If setting as default, unset others
        if (req.body.isDefault) {
            customer.addresses.forEach(addr => {
                if (addr._id.toString() !== req.params.id) {
                    addr.isDefault = false;
                }
            });
        }

        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            addresses: customer.addresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/customer/address/:id
// @desc    Delete address
// @access  Private
router.delete('/address/:id', protect, async (req, res) => {
    try {
        const customer = await Customer.findById(req.customer._id);
        customer.addresses.pull(req.params.id);
        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Address deleted successfully',
            addresses: customer.addresses
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
