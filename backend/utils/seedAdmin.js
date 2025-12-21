require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected...');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: 'admin@ecommerce.com' });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            process.exit(0);
        }

        // Create admin user
        const admin = await Admin.create({
            name: 'Admin',
            email: 'admin@ecommerce.com',
            password: 'Admin@123',
            role: 'super-admin'
        });

        console.log('Admin user created successfully!');
        console.log('Email: admin@ecommerce.com');
        console.log('Password: Admin@123');
        console.log('\nPlease change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
