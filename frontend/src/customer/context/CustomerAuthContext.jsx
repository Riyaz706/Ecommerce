import React, { createContext, useContext, useState, useEffect } from 'react';
import { customerAuth } from '../../utils/api';

const CustomerAuthContext = createContext();

export const useCustomerAuth = () => {
    const context = useContext(CustomerAuthContext);
    if (!context) {
        throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
    }
    return context;
};

export const CustomerAuthProvider = ({ children }) => {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('customerToken'));

    useEffect(() => {
        if (token) {
            loadCustomer();
        } else {
            setLoading(false);
        }
    }, [token]);

    const loadCustomer = async () => {
        try {
            const response = await customerAuth.getProfile();
            setCustomer(response.data.customer);
        } catch (error) {
            console.error('Error loading customer:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await customerAuth.login({ email, password });
        const { token: newToken, customer } = response.data;

        localStorage.setItem('customerToken', newToken);
        setToken(newToken);
        setCustomer(customer);

        return response.data;
    };

    const register = async (data) => {
        const response = await customerAuth.register(data);
        const { token: newToken, customer } = response.data;

        localStorage.setItem('customerToken', newToken);
        setToken(newToken);
        setCustomer(customer);

        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('customerToken');
        setToken(null);
        setCustomer(null);
    };

    const updateProfile = async (data) => {
        const response = await customerAuth.updateProfile(data);
        setCustomer(response.data.customer);
        return response.data;
    };

    const value = {
        customer,
        loading,
        isAuthenticated: !!customer,
        login,
        register,
        logout,
        updateProfile,
    };

    return (
        <CustomerAuthContext.Provider value={value}>
            {children}
        </CustomerAuthContext.Provider>
    );
};
