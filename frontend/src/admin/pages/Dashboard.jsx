import React, { useEffect, useState } from 'react';
import { adminOrders } from '../../utils/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await adminOrders.getStats();
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Products', value: stats?.totalProducts || 0, color: 'bg-blue-500', icon: '📦' },
        { title: 'Total Orders', value: stats?.totalOrders || 0, color: 'bg-green-500', icon: '🛒' },
        { title: 'Pending Orders', value: stats?.pendingOrders || 0, color: 'bg-yellow-500', icon: '⏳' },
        { title: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, color: 'bg-purple-500', icon: '💰' },
    ];

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <div key={index} className={`${stat.color} rounded-xl shadow-lg p-6 text-white transform transition-transform hover:scale-105`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                                <p className="text-3xl font-bold mt-2">{stat.value}</p>
                            </div>
                            <span className="text-5xl">{stat.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
                    <Link to="/admin/orders" className="text-purple-600 hover:text-purple-700 font-medium">
                        View All →
                    </Link>
                </div>

                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="py-3 px-4 font-semibold text-gray-700">Order #</th>
                                    <th className="py-3 px-4 font-semibold text-gray-700">Customer</th>
                                    <th className="py-3 px-4 font-semibold text-gray-700">Amount</th>
                                    <th className="py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="py-3 px-4 font-semibold text-gray-700">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map((order) => (
                                    <tr key={order._id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4">{order.orderNumber}</td>
                                        <td className="py-3 px-4">{order.customer.name}</td>
                                        <td className="py-3 px-4">₹{order.finalAmount.toLocaleString()}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                    order.orderStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">No orders yet</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
