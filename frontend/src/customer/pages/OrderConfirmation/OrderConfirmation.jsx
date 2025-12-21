import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orders } from '../../../utils/api';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const OrderConfirmation = () => {
    const { orderNumber } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrder();
    }, [orderNumber]);

    const loadOrder = async () => {
        try {
            const response = await orders.getByNumber(orderNumber);
            setOrder(response.data.order);
        } catch (error) {
            console.error('Error loading order:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
                    <Link to="/home" className="mt-4 inline-block text-purple-600 hover:text-purple-700">
                        Go to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Success Animation */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-2xl mb-6 animate-bounce">
                        <CheckCircleIcon className="w-16 h-16 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                        Order Placed Successfully! 🎉
                    </h1>
                    <p className="text-xl text-gray-600">
                        Thank you for shopping with us!
                    </p>
                </div>

                {/* Order Details Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 mb-6">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 text-white">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm opacity-90">Order Number</p>
                                <p className="text-2xl font-bold">{order.orderNumber}</p>
                            </div>
                            <div className="mt-4 md:mt-0 text-right">
                                <p className="text-sm opacity-90">Order Date</p>
                                <p className="text-lg font-semibold">
                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {/* Status */}
                        <div className="mb-8">
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800">
                                <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></span>
                                <span className="font-semibold">{order.orderStatus}</span>
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-2">📍</span>
                                    Delivery Address
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="font-semibold text-gray-900">{order.customer.name}</p>
                                    <p className="text-gray-600">{order.shippingAddress.street}</p>
                                    <p className="text-gray-600">
                                        {order.shippingAddress.city}, {order.shippingAddress.state}
                                    </p>
                                    <p className="text-gray-600">Pin Code: {order.shippingAddress.pinCode}</p>
                                    <p className="text-gray-600 mt-2">{order.customer.phone}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-2">💳</span>
                                    Payment Method
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="font-semibold text-gray-900">{order.paymentType}</p>
                                    <p className="text-sm text-gray-600">Status: {order.paymentStatus}</p>
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <span className="text-2xl mr-2">📦</span>
                                Order Items
                            </h3>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                        <img
                                            src={item.image || 'https://via.placeholder.com/80'}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                            {(item.size || item.color) && (
                                                <p className="text-sm text-gray-600">
                                                    {item.size && `Size: ${item.size}`}
                                                    {item.size && item.color && ' • '}
                                                    {item.color && `Color: ${item.color}`}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">₹{item.discountedPrice.toLocaleString()}</p>
                                            {item.price !== item.discountedPrice && (
                                                <p className="text-sm text-gray-500 line-through">₹{item.price.toLocaleString()}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Delivery Charges</span>
                                    <span className="font-semibold">
                                        {order.deliveryCharges === 0 ? (
                                            <span className="text-green-600">FREE</span>
                                        ) : (
                                            `₹${order.deliveryCharges.toLocaleString()}`
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t-2 border-purple-200">
                                    <span>Total Amount</span>
                                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        ₹{order.finalAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delivery Timeline */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <span className="text-2xl mr-2">🚚</span>
                        Estimated Delivery
                    </h3>
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl text-center">
                        <p className="text-3xl font-bold text-gray-900 mb-2">
                            {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                        <p className="text-gray-600">Expected delivery in 3-5 business days</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid md:grid-cols-2 gap-4">
                    <Link
                        to="/my-orders"
                        className="block text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition duration-200 transform hover:scale-[1.02] shadow-lg"
                    >
                        View My Orders
                    </Link>
                    <Link
                        to="/home"
                        className="block text-center bg-white border-2 border-purple-600 text-purple-600 py-4 px-6 rounded-xl font-semibold hover:bg-purple-50 transition duration-200"
                    >
                        Continue Shopping
                    </Link>
                </div>

                {/* Help Section */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600 mb-2">Need help with your order?</p>
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-semibold">
                        Contact Customer Support
                    </a>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
