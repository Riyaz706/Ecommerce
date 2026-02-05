require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const checkProduct = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected...');

        const id = '6947ebbe435db72ed020f1ac';
        // Validate hex string just in case, though 24 chars is standard
        if (id.length !== 24) {
            console.log('❌ Invalid ID format');
            process.exit(0);
        }

        const product = await Product.findById(id);

        if (product) {
            console.log(`✅ Product FOUND: ${product.name} (Category: ${product.category})`);
        } else {
            console.log('❌ Product NOT FOUND in database.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error searching for product:', error);
        process.exit(1);
    }
};

checkProduct();
