
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const verifyProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        const categories = await Product.distinct('category');
        console.log(`Found ${categories.length} categories:`, categories);

        for (const category of categories) {
            console.log(`\n--- Category: ${category} ---`);
            const products = await Product.find({ category }).limit(3);
            products.forEach(p => {
                console.log(`Name: ${p.name}`);
                console.log(`Image: ${p.images[0]?.url}`);
                console.log(`Brand: ${p.brand}`);
                console.log('---');
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyProducts();
