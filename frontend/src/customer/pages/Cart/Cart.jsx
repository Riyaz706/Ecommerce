import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { TrashIcon } from '@heroicons/react/24/outline';

const Cart = () => {
    const navigate = useNavigate();
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        getSubtotal,
        getDeliveryCharges,
        getTotal,
    } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h2 className="mt-6 text-2xl font-bold text-gray-900">Your cart is empty</h2>
                        <p className="mt-2 text-gray-600">Add some products to get started!</p>
                        <Link to="/home" className="mt-6 inline-block bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {cartItems.map((item, index) => (
                                <div key={`${item.productId}-${item.size}-${item.color}-${index}`} className="p-6 border-b last:border-b-0">
                                    <div className="flex gap-4">
                                        {/* Product Image */}
                                        <img
                                            src={item.image || 'https://via.placeholder.com/100'}
                                            alt={item.name}
                                            className="h-24 w-24 object-cover rounded-lg"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/100'}
                                        />

                                        {/* Product Details */}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {item.brand && `${item.brand} • `}
                                                {item.category}
                                            </p>
                                            {(item.size || item.color) && (
                                                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                                    {item.size && <span>Size: {item.size}</span>}
                                                    {item.color && <span>Color: {item.color}</span>}
                                                </div>
                                            )}

                                            {/* Price */}
                                            <div className="mt-2">
                                                <span className="text-lg font-bold text-gray-900">
                                                    ₹{item.discountedPrice.toLocaleString()}
                                                </span>
                                                {item.price !== item.discountedPrice && (
                                                    <span className="ml-2 text-sm text-gray-500 line-through">
                                                        ₹{item.price.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quantity & Remove */}
                                        <div className="flex flex-col items-end justify-between">
                                            <button
                                                onClick={() => removeFromCart(item.productId, item.size, item.color)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size, item.color)}
                                                    className="w-8 h-8 border rounded hover:bg-gray-100"
                                                >
                                                    -
                                                </button>
                                                <span className="w-12 text-center font-semibold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                                                    className="w-8 h-8 border rounded hover:bg-gray-100"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Clear Cart */}
                            <div className="p-4 bg-gray-50">
                                <button
                                    onClick={clearCart}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="mt-8 lg:mt-0">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold">₹{getSubtotal().toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Delivery Charges</span>
                                    <span className="font-semibold">
                                        {getDeliveryCharges() === 0 ? (
                                            <span className="text-green-600">FREE</span>
                                        ) : (
                                            `₹${getDeliveryCharges()}`
                                        )}
                                    </span>
                                </div>

                                {getSubtotal() < 500 && (
                                    <p className="text-xs text-gray-500">
                                        Add ₹{(500 - getSubtotal()).toLocaleString()} more for free delivery
                                    </p>
                                )}

                                <div className="border-t pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-bold">Total</span>
                                        <span className="text-lg font-bold text-purple-600">
                                            ₹{getTotal().toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition mb-3"
                            >
                                Proceed to Checkout
                            </button>

                            <Link to="/home" className="block text-center text-purple-600 hover:text-purple-700 font-medium">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
