import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAuth } from '../../utils/api';
import { toast } from 'react-toastify';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return context;
};

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('adminToken'));

    useEffect(() => {
        if (token) {
            checkAuth();
        } else {
            setLoading(false);
        }
    }, [token]);

    const checkAuth = async () => {
        try {
            const response = await adminAuth.getProfile();
            setAdmin(response.data.admin);
        } catch (error) {
            localStorage.removeItem('adminToken');
            setToken(null);
            setAdmin(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await adminAuth.login(credentials);
            const { token, admin } = response.data;

            localStorage.setItem('adminToken', token);
            setToken(token);
            setAdmin(admin);

            toast.success('Login successful!');
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setToken(null);
        setAdmin(null);
        toast.info('Logged out successfully');
    };

    return (
        <AdminAuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated: !!admin }}>
            {children}
        </AdminAuthContext.Provider>
    );
};
