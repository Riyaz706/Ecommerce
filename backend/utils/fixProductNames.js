
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const adjectives = [
    'Premium', 'Classic', 'Modern', 'Stylish', 'Elegant',
    'Durable', 'High-Quality', 'Essential', 'Luxury', 'Versatile',
    'Comfortable', 'Trendy', 'Exclusive', 'Original', 'Limited Edition'
];

const types = {
    'Baby': ['Care Item', 'Essential', 'Accessory', 'Toy', 'Gear'],
    'Beauty': ['Kit', 'Product', 'Care', 'Collection', 'Set'],
    'Electronics': ['Gadget', 'Device', 'Accessory', 'Unit', 'System'],
    'Fashion': ['Wear', 'Outfit', 'Style', 'Collection', 'Piece'],
    'Grocery': ['Pack', 'Item', 'Selection', 'Choice', 'Bundle'],
    'Hobbies': ['Set', 'Kit', 'Collection', 'Item', 'Tool'],
    'Home': ['Essential', 'Decor', 'Item', 'Accessory', 'Unit'],
    'Pets': ['Care Item', 'Toy', 'Treat', 'Accessory', 'Essential'],
    'Sports': ['Gear', 'Equipment', 'Accessory', 'Item', 'Pro'],
    'Women': ['Fashion', 'Style', 'Wear', 'Collection', 'Look']
};

const fixNames = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        // Find products with Cloudinary images (uploaded by us)
        const products = await Product.find({ 'images.url': /cloudinary/ });
        console.log(`Found ${products.length} products to update...`);

        let updatedCount = 0;

        for (const product of products) {
            // Check if name looks like a raw filename (contains numbers and underscores/checks)
            if (product.name.includes('check') || /\d+/.test(product.name)) {
                const categoryTypes = types[product.category] || ['Item'];

                const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
                const type = categoryTypes[Math.floor(Math.random() * categoryTypes.length)];

                // Generate new name: Brand + Adjective + Type
                // Example: Forever 21 Stylish Wear
                // Add a random 3 digit string if you want uniqueness, but "Brand Adjective Type" might be repetitive
                // Let's add the last 4 chars of the ID to make it unique but clean? 
                // Or just keep it clean. Duplicate names are okay for this demo.

                const newName = `${product.brand} ${adj} ${type}`;

                // Only update if different
                if (product.name !== newName) {
                    product.name = newName;
                    await product.save();
                    updatedCount++;
                }
            }

            if (updatedCount % 100 === 0 && updatedCount > 0) {
                process.stdout.write(`Updated ${updatedCount} products...\r`);
            }
        }

        console.log(`\n✅ Successfully updated names for ${updatedCount} products.`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixNames();
