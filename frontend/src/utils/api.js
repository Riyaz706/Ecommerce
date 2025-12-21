import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    // Check for admin token first (for admin routes)
    const adminToken = localStorage.getItem('adminToken');
    const customerToken = localStorage.getItem('customerToken');

    // Use admin token for admin routes, customer token for others
    if (config.url.startsWith('/admin') && adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (customerToken) {
        config.headers.Authorization = `Bearer ${customerToken}`;
    }

    return config;
});

// Admin Auth APIs
export const adminAuth = {
    login: (credentials) => api.post('/admin/auth/login', credentials),
    getProfile: () => api.get('/admin/auth/me'),
};

// Admin Product APIs
export const adminProducts = {
    getAll: (params) => api.get('/admin/products', { params }),
    getOne: (id) => api.get(`/admin/products/${id}`),
    create: (formData) => api.post('/admin/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, formData) => api.put(`/admin/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    delete: (id) => api.delete(`/admin/products/${id}`),
    deleteImage: (id, imageId) => api.delete(`/admin/products/${id}/images/${imageId}`),
};

// Admin Carousel APIs
export const adminCarousels = {
    getAll: () => api.get('/admin/carousels'),
    create: (formData) => api.post('/admin/carousels', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, formData) => api.put(`/admin/carousels/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    delete: (id) => api.delete(`/admin/carousels/${id}`),
    reorder: (carousels) => api.put('/admin/carousels/reorder', { carousels }),
};

// Admin Order APIs
export const adminOrders = {
    getAll: (params) => api.get('/admin/orders', { params }),
    getOne: (id) => api.get(`/admin/orders/${id}`),
    updateStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
    getStats: () => api.get('/admin/orders/dashboard/stats'),
};

// Customer Product APIs
export const products = {
    getAll: (params) => api.get('/products', { params }),
    getOne: (id) => api.get(`/products/${id}`),
    getByCategory: (category, params) => api.get(`/products/category/${category}`, { params }),
};

// Customer Carousel APIs
export const carousels = {
    getAll: () => api.get('/carousels'),
};

// Customer Order APIs
export const orders = {
    create: (data) => api.post('/orders', data),
    getByNumber: (orderNumber) => api.get(`/orders/${orderNumber}`),
};

// Categories API
export const categories = {
    getAll: () => api.get('/categories'),
};

// Customer Authentication APIs
export const customerAuth = {
    register: (data) => api.post('/customer/register', data),
    login: (data) => api.post('/customer/login', data),
    getProfile: () => api.get('/customer/me'),
    updateProfile: (data) => api.put('/customer/profile', data),
    addAddress: (data) => api.post('/customer/address', data),
    updateAddress: (id, data) => api.put(`/customer/address/${id}`, data),
    deleteAddress: (id) => api.delete(`/customer/address/${id}`),
};

// Customer Orders API
export const customerOrders = {
    getMyOrders: () => api.get('/orders/customer/my-orders'),
};

export default api;
