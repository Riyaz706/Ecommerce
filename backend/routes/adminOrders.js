const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @route   GET /api/admin/orders
// @desc    Get all orders
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (status) {
            query.orderStatus = status;
        }

        const orders = await Order.find(query)
            .populate('items.product', 'name')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            orders,
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

// @route   GET /api/admin/orders/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard/stats', protect, async (req, res) => {
    try {
        const totalProducts = await require('../models/Product').countDocuments();
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
        const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

        // Calculate total revenue (from delivered orders)
        const revenueData = await Order.aggregate([
            { $match: { orderStatus: 'Delivered' } },
            { $group: { _id: null, total: { $sum: '$finalAmount' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('items.product', 'name');

        res.status(200).json({
            success: true,
            stats: {
                totalProducts,
                totalOrders,
                pendingOrders,
                deliveredOrders,
                totalRevenue,
                recentOrders
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

// @route   GET /api/admin/orders/:id
// @desc    Get order details
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product');

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

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { status, note } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Please provide order status'
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update status
        order.orderStatus = status;

        // Add to status history
        order.statusHistory.push({
            status,
            note: note || `Status updated to ${status}`,
            timestamp: new Date()
        });

        // Update payment status if order is delivered
        if (status === 'Delivered' && order.paymentType === 'COD') {
            order.paymentStatus = 'Paid';
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
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

// @route   GET /api/admin/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard/stats', protect, async (req, res) => {
    try {
        const totalProducts = await require('../models/Product').countDocuments();
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
        const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

        // Calculate total revenue (from delivered orders)
        const revenueData = await Order.aggregate([
            { $match: { orderStatus: 'Delivered' } },
            { $group: { _id: null, total: { $sum: '$finalAmount' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('items.product', 'name');

        res.status(200).json({
            success: true,
            stats: {
                totalProducts,
                totalOrders,
                pendingOrders,
                deliveredOrders,
                totalRevenue,
                recentOrders
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
