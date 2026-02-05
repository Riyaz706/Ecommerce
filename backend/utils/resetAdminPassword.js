require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const resetAdminPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected...');

        const email = 'admin@ecommerce.com';
        const newPassword = 'Admin@123';

        const admin = await Admin.findOne({ email });

        if (!admin) {
            console.log('❌ Admin user not found. Creating new one...');
            await Admin.create({
                name: 'System Admin',
                email,
                password: newPassword,
                role: 'super-admin',
                isActive: true
            });
            console.log('✅ Created new admin user.');
        } else {
            console.log(`Found admin user: ${admin.email}`);
            // Force update password
            admin.password = newPassword;
            admin.isActive = true; // Ensure active
            await admin.save();
            console.log('✅ Password successfully reset to: Admin@123');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting password:', error);
        process.exit(1);
    }
};

resetAdminPassword();
