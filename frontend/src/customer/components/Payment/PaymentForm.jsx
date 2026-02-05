import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@mui/material';
import { orders, payment } from '../../../utils/api';
import { useCart } from '../../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const { totalAmount, emptyCart, clearCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    // Get order data passed from checkout
    const orderData = location.state?.orderData;

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        if (!orderData) {
            setError("Missing order details. Please go back to checkout.");
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            // 1. Create Payment Intent on Backend
            // Amount must be in smallest currency unit (e.g., paise for INR)
            // Amount must be in smallest currency unit (e.g., paise for INR)
            const amountInSmallestUnit = Math.round(orderData.finalAmount * 100);

            const { data } = await payment.createPaymentIntent({
                amount: amountInSmallestUnit,
                currency: 'inr'
            });

            if (!data.success) {
                throw new Error(data.message || 'Failed to initiate payment');
            }

            const clientSecret = data.clientSecret;

            // 2. Confirm Card Payment
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: orderData.customer.name,
                    },
                },
            });

            if (result.error) {
                setError(result.error.message);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    console.log('Payment succeeded!');

                    // 3. Create Order in Backend with Payment Details
                    const finalOrderData = {
                        ...orderData,
                        paymentResult: {
                            id: result.paymentIntent.id,
                            status: result.paymentIntent.status,
                            email_address: orderData.customer.email
                        }
                    };

                    const orderResponse = await orders.create(finalOrderData);

                    // 4. Clear cart and redirect
                    clearCart();
                    navigate(`/order-confirmation/${orderResponse.data.order.orderNumber}`);
                }
            }

        } catch (err) {
            console.error('Payment error:', err);
            // Show specific server error if available (e.g., validation error)
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Something went wrong';
            setError(errorMessage);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Secure Payment</h2>

            <div className="mb-6 p-4 border border-gray-300 rounded-md">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
            </div>

            {error && <div className="text-red-500 mb-4 text-sm font-medium">{error}</div>}

            <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!stripe || processing}
                className="w-full py-3"
                sx={{ bgcolor: '#9155fd', '&:hover': { bgcolor: '#7e4cc9' } }}
            >
                {processing ? 'Processing...' : `Pay ₹${totalAmount}`}
            </Button>

            <p className="mt-4 text-xs text-center text-gray-500">
                Processed securely by Stripe. We do not store your card details.
            </p>
        </form>
    );
};

export default PaymentForm;
