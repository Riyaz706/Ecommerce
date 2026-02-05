require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const { uploadToCloudinary, isCloudinaryConfigured } = require('./cloudinary');

const DATA_DIR = '/Users/mdriyaz/Downloads/data';
const CSV_FILE = path.join(DATA_DIR, 'fashion.csv');

// Helper function to upload image (Reused from uploadAllImages.js)
const uploadImageFile = async (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            // console.log(`    Image not found: ${filePath}`);
            return null;
        }

        // Try Cloudinary first if configured
        if (isCloudinaryConfigured()) {
            try {
                const result = await uploadToCloudinary(filePath);
                return {
                    url: result.url,
                    public_id: result.public_id
                };
            } catch (cloudinaryError) {
                console.log('Cloudinary error, falling back to local:', cloudinaryError.message);
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

const importKidsData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected...');

        if (!fs.existsSync(CSV_FILE)) {
            console.error(`❌ CSV file not found at ${CSV_FILE}`);
            process.exit(1);
        }

        const fileContent = fs.readFileSync(CSV_FILE, 'utf-8');
        const lines = fileContent.split('\n');

        // Headers: ProductId,Gender,Category,SubCategory,ProductType,Colour,Usage,ProductTitle,Image,ImageURL
        // Index:   0         1      2        3           4           5      6     7            8     9

        let count = 0;
        const productsToInsert = [];

        // Skip header (i=1)
        console.log(`Processing ${lines.length} rows...`);

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple split by comma (assuming no commas in fields for now based on inspection)
            const cols = line.split(',');
            if (cols.length < 9) continue;

            const gender = cols[1];
            const category = cols[2]; // Apparel, Footwear
            const subCategory = cols[3];
            const productType = cols[4];
            const colour = cols[5];
            const title = cols[7];
            const imageFile = cols[8];

            if (gender === 'Boys' || gender === 'Girls') {
                // Construct Image Path
                // Format: /Users/mdriyaz/Downloads/data/{Category}/{Gender}/Images/images_with_product_ids/{Image}
                const imagePath = path.join(DATA_DIR, category, gender, 'Images', 'images_with_product_ids', imageFile);

                const imageData = await uploadImageFile(imagePath);

                if (imageData) {
                    // Generate random price since CSV has none
                    const price = Math.floor(Math.random() * (1500 - 300 + 1)) + 300;
                    const discountPercent = Math.floor(Math.random() * 30);
                    const discountedPrice = Math.floor(price - (price * discountPercent / 100));

                    productsToInsert.push({
                        name: title,
                        description: `${title}. Perfect for ${gender}. Category: ${category} - ${subCategory}`,
                        price: price,
                        discountedPrice: discountedPrice,
                        discountPercent: discountPercent,
                        quantity: 50,
                        brand: title.split(' ')[0] || 'Generic', // Heuristic
                        category: 'Kids', // Main Category
                        // Store sub-categories in description or attributes if Model supported it, 
                        // but sticking to standard schema.
                        // We could potentially set a 2nd level category like 'Boys' or 'Girls' if schema allows, 
                        // but current schema mostly uses top level.
                        // Let's stick to 'Kids' top level.
                        images: [imageData],
                        sizes: [
                            { name: 'S', quantity: 20 },
                            { name: 'M', quantity: 20 },
                            { name: 'L', quantity: 10 }
                        ],
                        colors: [colour],
                        isActive: true
                    });

                    count++;
                    if (count % 10 === 0) process.stdout.write('.');

                    if (productsToInsert.length >= 200) {
                        break;
                    }
                }
            }
            if (productsToInsert.length >= 200) break;
        }

        console.log(`\nFound ${productsToInsert.length} Kids products.`);

        // Clean up existing Kids products to ensure exactly 200
        console.log('Cleaning up old Kids products...');
        await Product.deleteMany({ category: 'Kids' });

        if (productsToInsert.length > 0) {
            // Insert in chunks
            const CHUNK_SIZE = 50;
            let inserted = 0;
            for (let i = 0; i < productsToInsert.length; i += CHUNK_SIZE) {
                const chunk = productsToInsert.slice(i, i + CHUNK_SIZE);
                await Product.insertMany(chunk, { ordered: false });
                inserted += chunk.length;
                console.log(`\nInserted ${inserted} / ${productsToInsert.length}`);
            }
            console.log('✅ Import complete!');
        } else {
            console.log('No valid Kids products found or images missing.');
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Import failed:', error);
        process.exit(1);
    }
};

importKidsData();
