require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const verifyAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected...');

        const email = 'admin@ecommerce.com';
        const password = 'Admin@123';

        const admin = await Admin.findOne({ email });

        if (admin) {
            console.log(`✅ Admin user found: ${admin.email}`);
            // Optional: Reset password to be sure?
            // console.log('Resetting password to match known credentials...');
            // admin.password = password;
            // await admin.save();
            // console.log('✅ Password reset/verified.');
        } else {
            console.log(`⚠️ Admin user not found. Creating...`);
            await Admin.create({
                name: 'System Admin',
                email,
                password,
                role: 'super-admin',
                isActive: true
            });
            console.log(`✅ Admin user created: ${email} / ${password}`);
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Error verifying admin:', error);
        process.exit(1);
    }
};

verifyAdmin();
