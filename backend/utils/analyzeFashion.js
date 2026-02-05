
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const analyzeFashion = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        const products = await Product.find({ category: 'Fashion' });
        console.log(`Found ${products.length} products in 'Fashion' category.`);

        const descriptiveNames = [];
        const generatedNames = []; // "Brand Adjective Type"

        products.forEach(p => {
            // Generated names usually follow "Brand Adjective Wear/Style/..." pattern.
            // Descriptive names from 'women fashion' were like "Anarkali suit..."

            // Heuristic: Generated names are short (3-4 words) and contain specific keywords?
            // Or better: `fixProductNames` logic was `name` has digits or 'check'.
            // 'women fashion' names did NOT have digits.
            // So they should be UNCHANGED.
            // Let's print a sample of both kinds.

            if (p.name.split(' ').length > 6 || p.description.includes('Elegant')) {
                descriptiveNames.push(p.name);
            } else {
                generatedNames.push(p.name);
            }
        });

        console.log(`\nPotential 'Women Fashion' (Descriptive): ${descriptiveNames.length}`);
        console.log('Sample:', descriptiveNames.slice(0, 5));

        console.log(`\nPotential 'CLOTHING...' (Generated): ${generatedNames.length}`);
        console.log('Sample:', generatedNames.slice(0, 5));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

analyzeFashion();
