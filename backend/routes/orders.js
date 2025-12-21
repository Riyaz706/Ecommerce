const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { optionalProtect } = require('../middleware/customerAuth');

// @route   POST /api/orders
// @desc    Create new order
// @access  Public (but links customer if logged in)
// @route   POST /api/orders
// @desc    Create new order
// @access  Public (but links customer if logged in)
router.post('/', optionalProtect, async (req, res) => {
    try {
        const { items, customer, shippingAddress, paymentType } = req.body;

        // Validate required fields
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item'
            });
        }

        if (!customer || !shippingAddress || !paymentType) {
            return res.status(400).json({
                success: false,
                message: 'Please provide customer details, shipping address, and payment type'
            });
        }

        // Fetch products to calculate real price and ensure validity
        const orderItems = [];
        let totalAmount = 0;

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`
                });
            }

            const price = product.discountedPrice || product.price;
            totalAmount += price * item.quantity;

            orderItems.push({
                product: product._id,
                name: product.name,
                image: product.images?.[0]?.url || '',
                price: product.price,
                discountedPrice: product.discountedPrice,
                quantity: item.quantity,
                size: item.size,
                color: item.color
            });
        }

        // Calculate delivery charges (free above ₹500, else ₹50)
        const deliveryCharges = totalAmount >= 500 ? 0 : 50;
        const finalAmount = totalAmount + deliveryCharges;

        // Construct order data
        const orderData = {
            items: orderItems,
            customer,
            shippingAddress,
            paymentType,
            totalAmount,
            deliveryCharges,
            finalAmount,
            orderStatus: 'Pending',
            paymentStatus: paymentType === 'COD' ? 'Pending' : 'Pending',
            statusHistory: [{
                status: 'Pending',
                note: 'Order placed'
            }]
        };

        // Add customer ID if logged in
        if (req.customer) {
            orderData.customerId = req.customer._id;
        }

        // Create order
        const order = await Order.create(orderData);

        // If customer is logged in, add order to their orders array
        if (req.customer) {
            await Customer.findByIdAndUpdate(req.customer._id, {
                $push: { orders: order._id }
            });
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/orders/:orderNumber
// @desc    Get order by order number
// @access  Public
router.get('/:orderNumber', async (req, res) => {
    try {
        const order = await Order.findOne({ orderNumber: req.params.orderNumber })
            .populate('items.product', 'name images');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/orders/customer/my-orders
// @desc    Get logged in customer's orders
// @access  Private
const { protect } = require('../middleware/customerAuth');
router.get('/customer/my-orders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.customer._id })
            .populate('items.product', 'name images')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            orders
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
