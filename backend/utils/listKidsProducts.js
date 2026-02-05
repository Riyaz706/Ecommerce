require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const listKidsProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected...');

        const products = await Product.find({ category: 'Kids' }).limit(5);

        console.log(`\nFound ${products.length} Kids products (showing first 5):`);
        products.forEach(p => {
            console.log(`- ID: ${p._id} | Name: ${p.name}`);
        });

        if (products.length === 0) {
            console.log('❌ No Kids products found! Import might have failed.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error listing products:', error);
        process.exit(1);
    }
};

listKidsProducts();
