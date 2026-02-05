require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const { uploadToCloudinary, isCloudinaryConfigured } = require('./cloudinary');

// Map folder names to Display Categories
const categoryMap = {
    'BABY_PRODUCTS': 'Baby',
    'BEAUTY_HEALTH': 'Beauty',
    'ELECTRONICS': 'Electronics',
    'GROCERY': 'Grocery',
    'HOBBY_ARTS_STATIONERY': 'Hobbies',
    'HOME_KITCHEN_TOOLS': 'Home',
    'PET_SUPPLIES': 'Pets',
    'SPORTS_OUTDOOR': 'Sports',
    'CLOTHING_ACCESSORIES_JEWELLERY': 'Fashion'
};

// Brands per category
const brandMap = {
    'Electronics': ['Samsung', 'Apple', 'Sony', 'LG', 'Dell', 'HP'],
    'Fashion': ['Zara', 'H&M', 'Vero Moda', 'Forever 21', 'Prada'],
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

// Helper function to upload image
const uploadImageFile = async (filePath) => {
    try {
        // Try Cloudinary first if configured
        if (isCloudinaryConfigured()) {
            try {
                const result = await uploadToCloudinary(filePath);
                return {
                    url: result.url,
                    public_id: result.public_id
                };
            } catch (cloudinaryError) {
                // If Cloudinary fails, silently fall back to local storage
                // Don't log every failure to avoid spam
            }
        }
        
        // Fall back to local storage
        const fileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(filePath);
        const destPath = path.join(__dirname, '../uploads', fileName);
        
        // Ensure uploads directory exists
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        fs.copyFileSync(filePath, destPath);
        return {
            url: `/uploads/${fileName}`,
            public_id: fileName
        };
    } catch (error) {
        console.error(`Error uploading image ${filePath}:`, error.message);
        return null;
    }
};

// Process images from ECOMMERCE_PRODUCT_IMAGES directory
const processEcommerceImages = async (baseDir) => {
    const products = [];
    const subDirs = ['check', 'train', 'val']; // Process all subdirectories
    
    for (const subDir of subDirs) {
        const subDirPath = path.join(baseDir, subDir);
        if (!fs.existsSync(subDirPath)) {
            console.log(`Skipping ${subDir} - directory not found`);
            continue;
        }
        
        const categoryFolders = fs.readdirSync(subDirPath).filter(item => {
            const itemPath = path.join(subDirPath, item);
            return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
        });
        
        console.log(`\nProcessing ${subDir} directory...`);
        
        for (const folder of categoryFolders) {
            const folderPath = path.join(subDirPath, folder);
            
            // Skip if directory doesn't exist or is not a directory
            if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
                console.log(`    Skipping ${folder} - not a valid directory`);
                continue;
            }
            
            const categoryName = categoryMap[folder] || folder;
            const categoryBrands = brandMap[categoryName] || brandMap['Fashion'] || ['Generic'];
            
            let images;
            try {
                images = fs.readdirSync(folderPath)
                    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
            } catch (error) {
                console.log(`    Error reading ${folder}: ${error.message}`);
                continue;
            }
            
            console.log(`  Processing ${folder} (${images.length} images)...`);
            
            for (let i = 0; i < images.length; i++) {
                const imageFile = images[i];
                const imagePath = path.join(folderPath, imageFile);
                
                try {
                    // Upload image
                    const imageData = await uploadImageFile(imagePath);
                    if (!imageData) continue;
                    
                    // Generate product data
                    const brand = categoryBrands[Math.floor(Math.random() * categoryBrands.length)];
                    const price = Math.floor(Math.random() * (10000 - 100 + 1)) + 100;
                    const discountPercent = Math.floor(Math.random() * 50);
                    const discountedPrice = Math.floor(price - (price * discountPercent / 100));
                    
                    const rawName = imageFile.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
                    const name = `${brand} ${rawName}`.substring(0, 100);
                    
                    products.push({
                        name,
                        description: `High quality ${rawName.toLowerCase()} from ${brand} in the ${categoryName} category.`,
                        price,
                        discountPercent,
                        discountedPrice,
                        quantity: Math.floor(Math.random() * 100) + 10,
                        brand,
                        category: categoryName,
                        images: [imageData],
                        sizes: [],
                        colors: [],
                        isActive: true
                    });
                    
                    // Log progress every 50 images
                    if ((i + 1) % 50 === 0) {
                        console.log(`    Uploaded ${i + 1}/${images.length} images...`);
                    }
                } catch (error) {
                    console.error(`    Error processing ${imageFile}:`, error.message);
                }
            }
        }
    }
    
    return products;
};

// Process images from women fashion directory
const processWomenFashionImages = async (fashionDir) => {
    const products = [];
    
    if (!fs.existsSync(fashionDir)) {
        console.log(`Women fashion directory not found: ${fashionDir}`);
        return products;
    }
    
    const images = fs.readdirSync(fashionDir)
        .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
    
    console.log(`\nProcessing women fashion directory (${images.length} images)...`);
    
    const categoryBrands = brandMap['Women'] || ['Zara', 'H&M', 'Vero Moda'];
    
    for (let i = 0; i < images.length; i++) {
        const imageFile = images[i];
        const imagePath = path.join(fashionDir, imageFile);
        
        try {
            // Upload image
            const imageData = await uploadImageFile(imagePath);
            if (!imageData) continue;
            
            // Generate product data
            const brand = categoryBrands[Math.floor(Math.random() * categoryBrands.length)];
            const price = Math.floor(Math.random() * (8000 - 500 + 1)) + 500;
            const discountPercent = Math.floor(Math.random() * 40);
            const discountedPrice = Math.floor(price - (price * discountPercent / 100));
            
            // Extract name from filename (remove extension and clean up)
            let rawName = imageFile.replace(/\.[^/.]+$/, "");
            // Clean up the name - remove common patterns
            rawName = rawName.replace(/[_-]/g, " ");
            // Capitalize first letter of each word
            rawName = rawName.split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');
            
            const name = `${brand} ${rawName}`.substring(0, 100);
            
            products.push({
                name,
                description: `Elegant ${rawName.toLowerCase()} from ${brand}. Perfect for any occasion.`,
                price,
                discountPercent,
                discountedPrice,
                quantity: Math.floor(Math.random() * 50) + 5,
                brand,
                category: 'Fashion',
                images: [imageData],
                sizes: [
                    { name: 'S', quantity: 10 },
                    { name: 'M', quantity: 15 },
                    { name: 'L', quantity: 10 },
                    { name: 'XL', quantity: 5 }
                ],
                colors: ['Red', 'Blue', 'Black', 'White', 'Pink'],
                isActive: true
            });
            
            // Log progress every 10 images
            if ((i + 1) % 10 === 0) {
                console.log(`  Uploaded ${i + 1}/${images.length} images...`);
            }
        } catch (error) {
            console.error(`  Error processing ${imageFile}:`, error.message);
        }
    }
    
    return products;
};

// Main function
const uploadAllImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected...');
        
        const ecommerceDir = path.join(__dirname, '../../ECOMMERCE_PRODUCT_IMAGES');
        const fashionDir = path.join(__dirname, '../../women fashion');
        
        let allProducts = [];
        
        // Process ECOMMERCE_PRODUCT_IMAGES
        if (fs.existsSync(ecommerceDir)) {
            console.log('\n📁 Processing ECOMMERCE_PRODUCT_IMAGES directory...');
            const ecommerceProducts = await processEcommerceImages(ecommerceDir);
            allProducts = allProducts.concat(ecommerceProducts);
            console.log(`✅ Processed ${ecommerceProducts.length} products from ECOMMERCE_PRODUCT_IMAGES`);
        } else {
            console.log(`⚠️  ECOMMERCE_PRODUCT_IMAGES directory not found: ${ecommerceDir}`);
        }
        
        // Process women fashion directory
        if (fs.existsSync(fashionDir)) {
            console.log('\n📁 Processing women fashion directory...');
            const fashionProducts = await processWomenFashionImages(fashionDir);
            allProducts = allProducts.concat(fashionProducts);
            console.log(`✅ Processed ${fashionProducts.length} products from women fashion`);
        } else {
            console.log(`⚠️  Women fashion directory not found: ${fashionDir}`);
        }
        
        if (allProducts.length === 0) {
            console.log('❌ No products to insert. Exiting...');
            process.exit(0);
        }
        
        console.log(`\n📦 Total products to insert: ${allProducts.length}`);
        console.log('Inserting products into database...');
        
        // Insert in chunks to avoid memory issues
        const CHUNK_SIZE = 100;
        let inserted = 0;
        
        for (let i = 0; i < allProducts.length; i += CHUNK_SIZE) {
            const chunk = allProducts.slice(i, i + CHUNK_SIZE);
            await Product.insertMany(chunk, { ordered: false });
            inserted += chunk.length;
            console.log(`  Inserted ${inserted}/${allProducts.length} products...`);
        }
        
        console.log(`\n✅ Successfully uploaded and created ${inserted} products!`);
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error uploading images:', error);
        process.exit(1);
    }
};

// Run the script
uploadAllImages();

