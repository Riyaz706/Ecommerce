const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

// Protect routes for customers
const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const customer = await Customer.findById(decoded.id).select('-password');

            if (!customer || !customer.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Customer not found or inactive'
                });
            }

            req.customer = customer;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

// Optional protect - doesn't fail if no token
const optionalProtect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const customer = await Customer.findById(decoded.id).select('-password');

                if (customer && customer.isActive) {
                    req.customer = customer;
                }
            } catch (error) {
                // Token invalid, but we don't fail - just continue without customer
            }
        }

        next();
    } catch (error) {
        next();
    }
};

module.exports = { protect, optionalProtect };
