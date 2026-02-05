import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { customerOrders } from '../../../utils/api';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useCart } from '../../context/CartContext';

const MyOrders = () => {
    const { isAuthenticated } = useCustomerAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            loadOrders();
        }
    }, [isAuthenticated]);

    const loadOrders = async () => {
        try {
            const response = await customerOrders.getMyOrders();
            setOrders(response.data.orders);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReorder = (order) => {
        order.items.forEach(item => {
            if (!item.product) return; // Skip if product no longer exists

            const productData = {
                _id: item.product._id,
                name: item.name,
                price: item.price,
                discountedPrice: item.discountedPrice,
                images: [{ url: item.image }]
            };

            addToCart(productData, item.quantity, item.size, item.color);
        });
        navigate('/cart');
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Confirmed': 'bg-blue-100 text-blue-800',
            'Processing': 'bg-purple-100 text-purple-800',
            'Shipped': 'bg-indigo-100 text-indigo-800',
            'Out for Delivery': 'bg-orange-100 text-orange-800',
            'Delivered': 'bg-green-100 text-green-800',
            'Cancelled': 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center bg-white p-12 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
                    <p className="text-gray-600 mb-6">You need to be logged in to view your orders</p>
                    <Link
                        to="/login"
                        className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition"
                    >
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                    <p className="mt-2 text-gray-600">{orders.length} orders found</p>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
                        <p className="text-gray-600 mb-6">Start shopping and your orders will appear here!</p>
                        <Link
                            to="/home"
                            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition">
                                {/* Order Header */}
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Order Number</p>
                                            <p className="text-lg font-bold text-gray-900">{order.orderNumber}</p>
                                        </div>
                                        <div className="mt-2 md:mt-0 flex items-center gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Order Date</p>
                                                <p className="font-semibold text-gray-900">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                                                </p>
                                            </div>
                                            <div>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus)}`}>
                                                    {order.orderStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6">
                                    <div className="space-y-4 mb-4">
                                        {order.items.slice(0, 3).map((item, index) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <img
                                                    src={item.image || 'https://via.placeholder.com/60'}
                                                    alt={item.name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">₹{item.discountedPrice.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <p className="text-sm text-gray-600">+ {order.items.length - 3} more items</p>
                                        )}
                                    </div>

                                    {/* Order Footer */}
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-4 border-t">
                                        <div>
                                            <p className="text-sm text-gray-600">Total Amount</p>
                                            <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                ₹{order.finalAmount.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="mt-4 md:mt-0 flex gap-3">
                                            <Link
                                                to={`/order-confirmation/${order.orderNumber}`}
                                                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                                            >
                                                View Details
                                            </Link>
                                            {order.orderStatus === 'Delivered' && (
                                                <button
                                                    onClick={() => handleReorder(order)}
                                                    className="px-6 py-2 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
                                                >
                                                    Reorder
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
