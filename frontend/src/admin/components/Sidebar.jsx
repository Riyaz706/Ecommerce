import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
    HomeIcon,
    ShoppingBagIcon,
    PhotoIcon,
    ShoppingCartIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
    const { logout } = useAdminAuth();

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: HomeIcon },
        { name: 'Products', path: '/admin/products', icon: ShoppingBagIcon },
        { name: 'Carousels', path: '/admin/carousels', icon: PhotoIcon },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingCartIcon },
    ];

    return (
        <div className="w-64 bg-gradient-to-b from-purple-800 to-purple-900 text-white flex flex-col">
            <div className="p-6">
                <h2 className="text-2xl font-bold">E-commerce</h2>
                <p className="text-purple-300 text-sm">Admin Panel</p>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-white text-purple-900 shadow-lg transform scale-105'
                                : 'text-purple-100 hover:bg-purple-700 hover:transform hover:translate-x-1'
                            }`
                        }
                    >
                        <item.icon className="h-6 w-6" />
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-purple-700">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-purple-100 hover:bg-purple-700 transition-all duration-200 hover:transform hover:translate-x-1"
                >
                    <ArrowRightOnRectangleIcon className="h-6 w-6" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
