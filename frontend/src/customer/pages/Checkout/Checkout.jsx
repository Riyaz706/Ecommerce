import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { orders, customerAuth } from '../../../utils/api';
import { toast } from 'react-toastify';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, getSubtotal, getDeliveryCharges, getTotal, clearCart } = useCart();
    const { customer, isAuthenticated } = useCustomerAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [shippingAddress, setShippingAddress] = useState({
        name: customer?.name || '',
        phone: customer?.phone || '',
        street: '',
        city: '',
        state: '',
        pinCode: '',
    });

    const [paymentMethod, setPaymentMethod] = useState('');

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/checkout' } } });
        }
    }, [isAuthenticated, navigate]);

    const handleAddressChange = (e) => {
        setShippingAddress({
            ...shippingAddress,
            [e.target.name]: e.target.value,
        });
    };

    const validateAddress = () => {
        const { name, phone, street, city, state, pinCode } = shippingAddress;
        if (!name || !phone || !street || !city || !state || !pinCode) {
            toast.error('Please fill in all address fields');
            return false;
        }
        if (pinCode.length !== 6) {
            toast.error('Pin Code must be 6 digits');
            return false;
        }
        return true;
    };

    const handleContinueToPayment = () => {
        if (validateAddress()) {
            setCurrentStep(2);
        }
    };

    const handlePlaceOrder = async () => {
        if (!paymentMethod) {
            toast.error('Please select a payment method');
            return;
        }

        setLoading(true);

        try {
            const orderData = {
                items: cartItems.map(item => ({
                    product: item.productId,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                })),
                customer: {
                    name: shippingAddress.name,
                    email: customer.email,
                    phone: shippingAddress.phone,
                },
                shippingAddress: {
                    street: shippingAddress.street,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    pinCode: shippingAddress.pinCode,
                },
                paymentType: paymentMethod,
                totalAmount: getSubtotal(),
                deliveryCharges: getDeliveryCharges(),
                finalAmount: getTotal(),
            };

            const response = await orders.create(orderData);

            clearCart();
            toast.success('Order placed successfully!');
            navigate(`/order-confirmation/${response.data.order.orderNumber}`);
        } catch (error) {
            console.error('Order error:', error);
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { number: 1, name: 'Shipping Address', icon: '📍' },
        { number: 2, name: 'Payment Method', icon: '💳' },
    ];

    const paymentOptions = [
        { id: 'COD', name: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
        { id: 'UPI', name: 'UPI', icon: '📱', desc: 'PhonePe, Google Pay, Paytm' },
        { id: 'Card', name: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
        { id: 'Net Banking', name: 'Net Banking', icon: '🏦', desc: 'All major banks' },
        { id: 'Wallet', name: 'Wallets', icon: '👛', desc: 'Paytm, Amazon Pay' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Steps Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-center">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.number}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${currentStep >= step.number
                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-110'
                                                : 'bg-gray-200 text-gray-500'
                                            }`}
                                    >
                                        {currentStep > step.number ? (
                                            <CheckCircleIcon className="w-7 h-7" />
                                        ) : (
                                            step.icon
                                        )}
                                    </div>
                                    <span className={`mt-2 text-sm font-medium ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {step.name}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-24 h-1 mx-4 rounded transition-all duration-300 ${currentStep > step.number ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-200'
                                        }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Step 1: Shipping Address */}
                        {currentStep === 1 && (
                            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Address</h2>

                                <form className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={shippingAddress.name}
                                                onChange={handleAddressChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={shippingAddress.phone}
                                                onChange={handleAddressChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Street Address *
                                        </label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={shippingAddress.street}
                                            onChange={handleAddressChange}
                                            placeholder="House No., Building Name, Street"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                City *
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={shippingAddress.city}
                                                onChange={handleAddressChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                State *
                                            </label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={shippingAddress.state}
                                                onChange={handleAddressChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Pin Code *
                                            </label>
                                            <input
                                                type="text"
                                                name="pinCode"
                                                value={shippingAddress.pinCode}
                                                onChange={handleAddressChange}
                                                maxLength="6"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                                placeholder="123456"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleContinueToPayment}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition duration-200 transform hover:scale-[1.02] shadow-lg"
                                    >
                                        Continue to Payment →
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Step 2: Payment Method */}
                        {currentStep === 2 && (
                            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                                    >
                                        ← Edit Address
                                    </button>
                                </div>

                                <div className="space-y-4 mb-8">
                                    {paymentOptions.map((option) => (
                                        <div
                                            key={option.id}
                                            onClick={() => setPaymentMethod(option.id)}
                                            className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${paymentMethod === option.id
                                                    ? 'border-purple-600 bg-purple-50 shadow-md scale-[1.02]'
                                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-3xl">{option.icon}</div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">{option.name}</h3>
                                                        <p className="text-sm text-gray-600">{option.desc}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === option.id
                                                            ? 'border-purple-600 bg-purple-600'
                                                            : 'border-gray-300'
                                                        }`}>
                                                        {paymentMethod === option.id && (
                                                            <div className="w-3 h-3 bg-white rounded-full"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={loading || !paymentMethod}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition duration-200 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </div>
                                    ) : (
                                        `Place Order • ₹${getTotal().toLocaleString()}`
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="mt-8 lg:mt-0">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>

                            {/* Items */}
                            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="flex gap-3">
                                        <img
                                            src={item.image || 'https://via.placeholder.com/60'}
                                            alt={item.name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</h4>
                                            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                            <p className="text-sm font-bold text-gray-900">₹{item.discountedPrice.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 py-4 border-t border-gray-200">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span className="font-semibold">₹{getSubtotal().toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery</span>
                                    <span className={getDeliveryCharges() === 0 ? 'text-green-600 font-semibold' : 'font-semibold'}>
                                        {getDeliveryCharges() === 0 ? 'FREE' : `₹${getDeliveryCharges()}`}
                                    </span>
                                </div>
                                {getSubtotal() < 500 && (
                                    <p className="text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                                        Add ₹{(500 - getSubtotal()).toLocaleString()} more for FREE delivery!
                                    </p>
                                )}
                            </div>

                            {/* Total */}
                            <div className="pt-4 border-t-2 border-gray-300">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">Total</span>
                                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        ₹{getTotal().toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Trust Badge */}
                            <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                                <div className="flex items-center space-x-2 text-sm text-gray-700">
                                    <span className="text-2xl">🔒</span>
                                    <div>
                                        <p className="font-semibold">100% Secure Payments</p>
                                        <p className="text-xs text-gray-600">Your data is safe with us</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
