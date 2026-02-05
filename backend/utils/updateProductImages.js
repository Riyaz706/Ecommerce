require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Category-specific images using reliable image services
const getCategoryImages = (category, subcategory, index) => {
    // Use Picsum Photos with category-specific random numbers for variety
    // Each category gets a different number range to ensure different images
    const categoryRanges = {
        'Electronics': { min: 1, max: 100 },
        'Women': { min: 101, max: 200 },
        'Men': { min: 201, max: 300 },
        'Accessories': { min: 301, max: 400 },
        'Home': { min: 401, max: 500 },
        'Beauty': { min: 501, max: 600 },
        'Grocery': { min: 601, max: 700 },
        'Sports': { min: 701, max: 800 },
        'Pets': { min: 801, max: 900 },
        'Baby': { min: 901, max: 1000 },
        'Hobbies': { min: 1001, max: 1100 },
        'Kids': { min: 1101, max: 1200 },
        'Fashion': { min: 1201, max: 1300 }
    };

    const range = categoryRanges[category] || categoryRanges['Electronics'];
    const randomNum = range.min + (index % (range.max - range.min + 1));
    
    // Use Picsum Photos - reliable and fast
    // Format: https://picsum.photos/id/{id}/800/800
    return `https://picsum.photos/id/${randomNum}/800/800`;
};

const updateProductImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected...\n');

        // Get all products
        const products = await Product.find({});
        console.log(`📦 Found ${products.length} products to update...\n`);

        let updated = 0;
        let errors = 0;

        // Update each product with new images
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            try {
                const imageUrl = getCategoryImages(product.category, product.subcategory, i);
                
                // Update product with new image (keep existing structure)
                product.images = [{
                    url: imageUrl,
                    public_id: null // No Cloudinary public_id for placeholder images
                }];

                await product.save();
                updated++;

                if ((i + 1) % 50 === 0) {
                    console.log(`   Updated ${i + 1}/${products.length} products...`);
                }
            } catch (error) {
                console.error(`   Error updating product ${product._id}:`, error.message);
                errors++;
            }
        }

        console.log(`\n✅ Successfully updated ${updated} products with new images!`);
        if (errors > 0) {
            console.log(`⚠️  ${errors} products had errors`);
        }

        // Show summary by category
        console.log('\n📊 Products by category:');
        const categories = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        
        categories.forEach(({ _id, count }) => {
            console.log(`   ${_id}: ${count} products`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating product images:', error);
        process.exit(1);
    }
};

updateProductImages();

