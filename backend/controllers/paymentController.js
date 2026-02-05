const Stripe = require('stripe');
// TODO: Replace with your actual secret key from Stripe Dashboard
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency = 'inr' } = req.body;

        // Verify amount is valid
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({
            success: false,
            message: 'Payment initiation failed',
            error: error.message
        });
    }
};

module.exports = {
    createPaymentIntent
};
