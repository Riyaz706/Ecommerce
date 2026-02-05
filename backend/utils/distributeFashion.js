
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const distributeFashion = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        const products = await Product.find({ category: 'Fashion' });
        console.log(`Found ${products.length} products in 'Fashion' category.`);

        let womenCount = 0;
        let menCount = 0;
        let accCount = 0;

        for (const product of products) {
            // Heuristic for "Descriptive" names (from Women Fashion folder)
            // They tend to be longer sentences or contain specific words
            const isDescriptive = product.name.split(' ').length > 6 ||
                product.description.includes('Elegant') ||
                product.name.toLowerCase().includes('dress') ||
                product.name.toLowerCase().includes('suit') ||
                product.name.toLowerCase().includes('gown');

            if (isDescriptive) {
                product.category = 'Women';
                womenCount++;
            } else {
                // Split others between Men and Accessories
                if (Math.random() > 0.5) {
                    product.category = 'Men';
                    // Optional: Update name to be more masculine if needed, 
                    // but "Brand Style Wear" is neutral enough.
                    menCount++;
                } else {
                    product.category = 'Accessories';
                    accCount++;
                }
            }
            await product.save();
        }

        console.log(`\nDistribution Complete:`);
        console.log(`- Women: ${womenCount}`);
        console.log(`- Men: ${menCount}`);
        console.log(`- Accessories: ${accCount}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

distributeFashion();
