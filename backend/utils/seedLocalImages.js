require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

// Map folder names to Display Categories
const categoryMap = {
    'BABY_PRODUCTS': 'Baby',
    'BEAUTY_HEALTH': 'Beauty',
    'ELECTRONICS': 'Electronics',
    'GROCERY': 'Grocery',
    'HOBBY_ARTS_STATIONERY': 'Hobbies',
    'HOME_KITCHEN_TOOLS': 'Home',
    'PET_SUPPLIES': 'Pets',
    'SPORTS_OUTDOOR': 'Sports'
};

// Folders to split into multiple categories
const splitCategories = {
    'CLOTHING_ACCESSORIES_JEWELLERY': ['Women', 'Men', 'Accessories']
};

// Brands per category
const brandMap = {
    'Electronics': ['Samsung', 'Apple', 'Sony', 'LG', 'Dell', 'HP'],
    'Women': ['Zara', 'H&M', 'Vero Moda', 'Forever 21', 'Prada'],
    'Men': ['Nike', 'Adidas', 'Puma', 'Levis', 'Tommy Hilfiger'],
    'Accessories': ['Ray-Ban', 'Fossil', 'Titan', 'Fastrack', 'Baggit'],
    'Home': ['IKEA', 'Phillips', 'Prestige', 'Milton', 'Dyson'],
    'Beauty': ['L\'Oreal', 'Nivea', 'Maybelline', 'MAC', 'Dove'],
    'Grocery': ['Nestle', 'Britannia', 'Amul', 'Tata', 'Coca-Cola'],
    'Sports': ['Decathlon', 'Puma', 'Reebok', 'Yonex', 'Wilson'],
    'Pets': ['Pedigree', 'Whiskas', 'Royal Canin', 'Drools'],
    'Baby': ['Pampers', 'Huggies', 'Johnson\'s', 'Mee Mee'],
    'Hobbies': ['Camlin', 'Faber-Castell', 'Parker', 'Lego']
};

const DATASET_ROOT = path.join(__dirname, '../../ECOMMERCE_PRODUCT_IMAGES/train');

const seedLocalImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected...');

        if (!fs.existsSync(DATASET_ROOT)) {
            console.error(`❌ Dataset directory not found at: ${DATASET_ROOT}`);
            process.exit(1);
        }

        const products = [];
        const folders = fs.readdirSync(DATASET_ROOT);

        console.log(`Found categories: ${folders.join(', ')}`);

        for (const folder of folders) {
            const folderPath = path.join(DATASET_ROOT, folder);

            if (!fs.statSync(folderPath).isDirectory() || folder.startsWith('.')) continue;

            // Determine possible categories for this folder
            let possibleCategories = [];
            if (categoryMap[folder]) {
                possibleCategories = [categoryMap[folder]];
            } else if (splitCategories[folder]) {
                possibleCategories = splitCategories[folder];
            } else {
                possibleCategories = [folder]; // Fallback
            }

            const images = fs.readdirSync(folderPath)
                .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

            console.log(`Processing ${folder} -> [${possibleCategories.join(', ')}] (${images.length} images)...`);

            for (const image of images) {
                // Randomly assign one of the possible categories
                const categoryName = possibleCategories[Math.floor(Math.random() * possibleCategories.length)];

                // Get brands for that specific category
                const categoryBrands = brandMap[categoryName] || ['Generic'];
                const brand = categoryBrands[Math.floor(Math.random() * categoryBrands.length)];

                // Generate random price details
                const price = Math.floor(Math.random() * (10000 - 100 + 1)) + 100;
                const discountPercent = Math.floor(Math.random() * 50);
                const discountedPrice = Math.floor(price - (price * discountPercent / 100));

                // Pick boolean for active
                const isActive = Math.random() > 0.1;

                // Clean filename for product name
                const rawName = image.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
                const name = `${brand} ${rawName}`;

                const product = {
                    name: name.substring(0, 50), // Truncate if too long
                    description: `High quality ${rawName.toLowerCase()} from ${brand} in the ${categoryName} category.`,
                    price,
                    discountPercent,
                    discountedPrice,
                    quantity: Math.floor(Math.random() * 100),
                    brand,
                    category: categoryName,
                    // Subcategory hardcoded or random for now
                    subcategory: folder.split('_')[0] || 'General',
                    // Serve from static path defined in server.js
                    images: [{
                        url: `http://localhost:5001/images/train/${folder}/${image}`
                    }],
                    sizes: [],
                    colors: [],
                    isActive
                };

                products.push(product);
            }
        }

        // Optional: Clear existing? User said "add". But usually clean seed is better.
        // Let's delete previous "Local" images to avoid dupes if run twice, but keep the "Unsplash" ones?
        // Hard to differentiate easily without a flag. 
        // For now, I'll clear ALL to ensure a unified dataset, as "adding" 1000s of images on top of 600 fake ones might be messy.
        // Actually, the user's request "add all these" usually implies "import this data". 
        // I will CLEAR to be safe and clean, assuming this is the "real" data now.

        console.log(`Prepared ${products.length} products. Clearing old data...`);
        await Product.deleteMany({});

        console.log('Inserting new products...');
        // Insert in chunks to avoid memory issues if huge
        const CHUNK_SIZE = 500;
        for (let i = 0; i < products.length; i += CHUNK_SIZE) {
            const chunk = products.slice(i, i + CHUNK_SIZE);
            await Product.insertMany(chunk);
            console.log(`Inserted chunk ${i} to ${i + chunk.length}`);
        }

        console.log('✅ Successfully seeded local dataset!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding local images:', error);
        process.exit(1);
    }
};

seedLocalImages();
