import React, { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { useCart } from '../../context/CartContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { ShoppingBagIcon, UserIcon } from '@heroicons/react/24/outline';

const NavigationBar = () => {
    const navigate = useNavigate();
    const { getCartCount } = useCart();
    const { isAuthenticated, customer, logout } = useCustomerAuth();
    const cartCount = getCartCount();

    const categories = [
        { name: 'Fashion', path: '/products/Fashion' },
        { name: 'Electronics', path: '/products/Electronics' },
        { name: 'Home', path: '/products/Home' },
        { name: 'Beauty', path: '/products/Beauty' },
        { name: 'Grocery', path: '/products/Grocery' },
        { name: 'Sports', path: '/products/Sports' },
        { name: 'Pets', path: '/products/Pets' },
        { name: 'Baby', path: '/products/Baby' },
        { name: 'Hobbies', path: '/products/Hobbies' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/home" className="flex items-center">
                        <span className="text-2xl font-bold text-purple-600">E-Shop</span>
                    </Link>

                    {/* Category Links */}
                    <div className="hidden md:flex space-x-8">
                        {categories.map((category) => (
                            <Link
                                key={category.name}
                                to={category.path}
                                className="text-gray-700 hover:text-purple-600 font-medium transition"
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* Cart Icon */}
                        <Link to="/cart" className="relative text-gray-700 hover:text-purple-600">
                            <ShoppingBagIcon className="h-6 w-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Menu or Login */}
                        {isAuthenticated ? (
                            <Menu as="div" className="relative">
                                <Menu.Button className="flex items-center text-gray-700 hover:text-purple-600 focus:outline-none">
                                    <UserIcon className="h-6 w-6" />
                                    <span className="ml-2 text-sm font-medium hidden sm:block">
                                        {customer?.name?.split(' ')[0]}
                                    </span>
                                </Menu.Button>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <div className="py-1">
                                            <div className="px-4 py-2 border-b">
                                                <p className="text-sm text-gray-900 font-medium">{customer?.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{customer?.email}</p>
                                            </div>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        to="/my-orders"
                                                        className={`${active ? 'bg-gray-100' : ''
                                                            } block px-4 py-2 text-sm text-gray-700`}
                                                    >
                                                        My Orders
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={handleLogout}
                                                        className={`${active ? 'bg-gray-100' : ''
                                                            } block w-full text-left px-4 py-2 text-sm text-red-600`}
                                                    >
                                                        Logout
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NavigationBar;
