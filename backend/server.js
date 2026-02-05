require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { onRequest } = require('firebase-functions/v2/https');

const path = require('path');

const app = express();

// Middleware
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'https://ecommerce-riyaz-app.web.app',
        'https://ecommerce-riyaz-app.firebaseapp.com'
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static(path.join(__dirname, '../ECOMMERCE_PRODUCT_IMAGES')));

// Routes
app.use('/api/admin/auth', require('./routes/adminAuth'));
app.use('/api/admin/products', require('./routes/adminProducts'));
app.use('/api/admin/carousels', require('./routes/adminCarousels'));
app.use('/api/admin/orders', require('./routes/adminOrders'));
app.use('/api/products', require('./routes/products'));
app.use('/api/carousels', require('./routes/carousels'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/customer', require('./routes/customerAuth'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Database connection helper
const connectDB = async () => {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
        return; // Already connected
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        throw err;
    }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// For local development
if (process.env.NODE_ENV !== 'production' && !process.env.FIREBASE_CONFIG) {
    connectDB()
        .then(() => {
            const PORT = process.env.PORT || 5000;
            app.listen(PORT, () => {
                console.log(`✅ Server running on port ${PORT}`);
            });
        })
        .catch((err) => {
            console.error('❌ Failed to start server:', err);
            process.exit(1);
        });
}

// Export the Cloud Function
exports.api = onRequest({
    memory: '256MiB',
    region: 'us-central1', // Change if needed
    cors: true,
}, async (req, res) => {
    await connectDB();
    return app(req, res);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
});

// module.exports = app; // Removed to avoid overwriting exports.api
// Force restart to load env
