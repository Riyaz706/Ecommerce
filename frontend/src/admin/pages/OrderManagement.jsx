import React, { useEffect, useState } from 'react';
import { adminOrders } from '../../utils/api';
import { toast } from 'react-toastify';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        loadOrders();
    }, [filter]);

    const loadOrders = async () => {
        try {
            const params = filter ? { status: filter } : {};
            const response = await adminOrders.getAll(params);
            setOrders(response.data.orders);
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await adminOrders.updateStatus(orderId, { status: newStatus });
            toast.success('Order status updated');
            loadOrders();
            if (selectedOrder && selectedOrder._id === orderId) {
                const response = await adminOrders.getOne(orderId);
                setSelectedOrder(response.data.order);
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const viewOrderDetails = async (orderId) => {
        try {
            const response = await adminOrders.getOne(orderId);
            setSelectedOrder(response.data.order);
        } catch (error) {
            toast.error('Failed to load order details');
        }
    };

    const statusOptions = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    const statusColors = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Confirmed': 'bg-blue-100 text-blue-800',
        'Processing': 'bg-purple-100 text-purple-800',
        'Shipped': 'bg-indigo-100 text-indigo-800',
        'Out for Delivery': 'bg-cyan-100 text-cyan-800',
        'Delivered': 'bg-green-100 text-green-800',
        'Cancelled': 'bg-red-100 text-red-800',
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Orders</h2>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                    <option value="">All Orders</option>
                    {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700">Order #</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700">Customer</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700">Items</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700">Amount</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700">Payment</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700">Date</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">{order.orderNumber}</td>
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="font-medium">{order.customer.name}</p>
                                            <p className="text-xs text-gray-500">{order.customer.email}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">{order.items.length}</td>
                                    <td className="py-3 px-4">₹{order.finalAmount.toLocaleString()}</td>
                                    <td className="py-3 px-4">
                                        <span className="text-sm">{order.paymentType}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.orderStatus]}`}>
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4">
                                        <button
                                            onClick={() => viewOrderDetails(order._id)}
                                            className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {orders.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No orders found
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold">Order Details</h3>
                                    <p className="text-gray-600">Order # {selectedOrder.orderNumber}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Customer Info */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">Customer Information</h4>
                                    <p><strong>Name:</strong> {selectedOrder.customer.name}</p>
                                    <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                                    <p><strong>Phone:</strong> {selectedOrder.customer.phone}</p>
                                </div>

                                {/* Shipping Address */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">Shipping Address</h4>
                                    <p>{selectedOrder.shippingAddress.street}</p>
                                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                                    <p><strong>Pin Code:</strong> {selectedOrder.shippingAddress.pinCode}</p>
                                    <p>{selectedOrder.shippingAddress.country}</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="mt-6">
                                <h4 className="font-semibold mb-3">Order Items</h4>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                                            {item.image && (
                                                <img src={item.image} alt={item.name} className="h-16 w-16 object-cover rounded" />
                                            )}
                                            <div className="flex-1">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-600">
                                                    Quantity: {item.quantity} × ₹{item.discountedPrice || item.price}
                                                </p>
                                            </div>
                                            <p className="font-semibold">₹{((item.discountedPrice || item.price) * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>₹{selectedOrder.totalAmount.toLocaleString()}</span>
                                    </div>
                                    {selectedOrder.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount:</span>
                                            <span>-₹{selectedOrder.discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Delivery:</span>
                                        <span>₹{selectedOrder.deliveryCharges.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span>₹{selectedOrder.finalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment & Status */}
                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Payment Type</p>
                                    <p className="font-semibold">{selectedOrder.paymentType}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Update Order Status</p>
                                    <select
                                        value={selectedOrder.orderStatus}
                                        onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    >
                                        {statusOptions.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Status History */}
                            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-2">Status History</h4>
                                    <div className="space-y-2">
                                        {selectedOrder.statusHistory.map((history, index) => (
                                            <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                                                <span className="font-medium">{history.status}</span>
                                                <span className="text-gray-600 ml-2">
                                                    {new Date(history.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
