import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from '../../components/Payment/PaymentForm';

// TODO: Replace with your actual publishable key
const stripePromise = loadStripe('pk_test_51Sh0WLGRDLiIRHOAP3SSblVCSIErN506esMF2oIUmuaO2zR9nzj879YQiTAwt90TNWWceIGr7WjNyG7TLDSlrJKX00YikJ9MvU');

const PaymentPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="w-full max-w-lg space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>
                    <p className="mt-2 text-sm text-gray-600">Complete your purchase securely.</p>
                </div>

                <Elements stripe={stripePromise}>
                    <PaymentForm />
                </Elements>
            </div>
        </div>
    );
};

export default PaymentPage;
