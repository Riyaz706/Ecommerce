import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, ShieldCheckIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row">

                {/* Left Side - Welcome */}
                <div className="md:w-1/2 p-10 flex flex-col justify-center bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <ShoppingBagIcon className="h-10 w-10 text-purple-600" />
                        <h1 className="text-4xl font-bold text-gray-800">E-Shop</h1>
                    </div>
                    <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                        Welcome to your premium shopping destination. Choose your portal to get started.
                    </p>
                    <div className="hidden md:block">
                        <img
                            src="https://img.freepik.com/free-vector/online-shopping-concept-illustration_114360-1084.jpg?w=1000"
                            alt="Shopping Illustration"
                            className="w-full opacity-80"
                        />
                    </div>
                </div>

                {/* Right Side - Selection */}
                <div className="md:w-1/2 p-10 flex flex-col justify-center space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Select Login Type</h2>

                    {/* Customer Login Card */}
                    <Link
                        to="/login"
                        className="group flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-300"
                    >
                        <div className="bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors">
                            <UserIcon className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-700">Customer</h3>
                            <p className="text-sm text-gray-500">Shop products, track orders, and more.</p>
                        </div>
                    </Link>

                    {/* Admin Login Card */}
                    <Link
                        to="/admin/login"
                        className="group flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300"
                    >
                        <div className="bg-indigo-100 p-3 rounded-full group-hover:bg-indigo-200 transition-colors">
                            <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-700">Admin Portal</h3>
                            <p className="text-sm text-gray-500">Manage products, orders, and settings.</p>
                        </div>
                    </Link>

                    <div className="mt-8 text-center">
                        <Link to="/home" className="text-gray-500 hover:text-purple-600 text-sm font-medium transition">
                            Continue as Guest &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
