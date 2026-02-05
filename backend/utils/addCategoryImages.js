require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const { uploadToCloudinary, isCloudinaryConfigured } = require('./cloudinary');

// Reverse mapping: Database category -> Folder name
const categoryToFolderMap = {
    'Baby': 'BABY_PRODUCTS',
    'Beauty': 'BEAUTY_HEALTH',
    'Electronics': 'ELECTRONICS',
    'Grocery': 'GROCERY',
    'Hobbies': 'HOBBY_ARTS_STATIONERY',
    'Home': 'HOME_KITCHEN_TOOLS',
    'Pets': 'PET_SUPPLIES',
    'Sports': 'SPORTS_OUTDOOR',
    'Fashion': 'CLOTHING_ACCESSORIES_JEWELLERY',
    'Women': 'CLOTHING_ACCESSORIES_JEWELLERY',
    'Men': 'CLOTHING_ACCESSORIES_JEWELLERY',
    'Accessories': 'CLOTHING_ACCESSORIES_JEWELLERY'
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
                // If Cloudinary fails, fall back to local storage
                console.log(`  Cloudinary upload failed, using local storage...`);
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
        console.error(`  Error uploading image ${filePath}:`, error.message);
        return null;
    }
};

// Get images for a category from ECOMMERCE_PRODUCT_IMAGES
const getCategoryImages = (category, baseDir) => {
    const folderName = categoryToFolderMap[category];
    if (!folderName) {
        return [];
    }

    const images = [];
    const subDirs = ['train', 'val', 'check']; // Priority order
    
    for (const subDir of subDirs) {
        const categoryPath = path.join(baseDir, subDir, folderName);
        if (fs.existsSync(categoryPath)) {
            const files = fs.readdirSync(categoryPath)
                .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
                .map(file => path.join(categoryPath, file));
            images.push(...files);
        }
    }
    
    return images;
};

// Update products with category-specific images
const addCategoryImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected...\n');

        const baseDir = path.join(__dirname, '../../ECOMMERCE_PRODUCT_IMAGES');
        
        if (!fs.existsSync(baseDir)) {
            console.error(`❌ ECOMMERCE_PRODUCT_IMAGES directory not found: ${baseDir}`);
            process.exit(1);
        }

        // Get all products grouped by category
        const products = await Product.find({});
        console.log(`📦 Found ${products.length} products to update...\n`);

        // Group products by category
        const productsByCategory = {};
        products.forEach(product => {
            if (!productsByCategory[product.category]) {
                productsByCategory[product.category] = [];
            }
            productsByCategory[product.category].push(product);
        });

        let totalUpdated = 0;
        let totalErrors = 0;

        // Process each category
        for (const [category, categoryProducts] of Object.entries(productsByCategory)) {
            console.log(`\n📁 Processing category: ${category} (${categoryProducts.length} products)`);
            
            const folderName = categoryToFolderMap[category];
            if (!folderName) {
                console.log(`  ⚠️  No folder mapping found for category: ${category}`);
                continue;
            }

            // Get all images for this category
            const imagePaths = getCategoryImages(category, baseDir);
            
            if (imagePaths.length === 0) {
                console.log(`  ⚠️  No images found for category: ${category} (folder: ${folderName})`);
                continue;
            }

            console.log(`  📸 Found ${imagePaths.length} images in ${folderName}`);

            // Limit to 20 products per category
            const maxProducts = 20;
            const productsToProcess = categoryProducts.slice(0, maxProducts);
            console.log(`  🔢 Processing ${productsToProcess.length} products (limited to ${maxProducts} per category)`);

            // Update each product in this category (limited to 20)
            for (let i = 0; i < productsToProcess.length; i++) {
                const product = productsToProcess[i];
                
                try {
                    // Select image(s) for this product (use modulo to cycle through images)
                    const imageIndex = i % imagePaths.length;
                    const selectedImagePath = imagePaths[imageIndex];
                    
                    // Upload the image
                    const imageData = await uploadImageFile(selectedImagePath);
                    
                    if (!imageData) {
                        console.log(`  ⚠️  Failed to upload image for product: ${product.name}`);
                        totalErrors++;
                        continue;
                    }

                    // Update product with new image (replace existing images)
                    product.images = [imageData];
                    await product.save();
                    
                    totalUpdated++;

                    // Log progress every 5 products
                    if ((i + 1) % 5 === 0) {
                        console.log(`    Updated ${i + 1}/${productsToProcess.length} products...`);
                    }
                } catch (error) {
                    console.error(`  ❌ Error updating product ${product.name}:`, error.message);
                    totalErrors++;
                }
            }

            console.log(`  ✅ Updated ${productsToProcess.length} products in ${category}`);
        }

        console.log(`\n\n✅ Successfully updated ${totalUpdated} products with category images!`);
        if (totalErrors > 0) {
            console.log(`⚠️  ${totalErrors} products had errors`);
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
        console.error('❌ Error adding category images:', error);
        process.exit(1);
    }
};

addCategoryImages();

