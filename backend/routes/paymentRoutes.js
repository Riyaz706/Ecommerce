const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controllers/paymentController');

// @route   POST /api/payments/create-payment-intent
// @desc    Create a payment intent for Stripe
// @access  Public (or Protected if you add auth middleware)
router.post('/create-payment-intent', createPaymentIntent);

module.exports = router;
