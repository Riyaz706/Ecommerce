const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Carousel = require('../models/Carousel');
const { deleteFromCloudinary, isCloudinaryConfigured } = require('./cloudinary');

const clearAllData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear Products (and delete Cloudinary images if configured)
        console.log('\n🗑️  Clearing Products...');
        const products = await Product.find({});
        let cloudinaryDeleted = 0;
        
        for (const product of products) {
            if (product.images && Array.isArray(product.images)) {
                for (const image of product.images) {
                    if (image.public_id && isCloudinaryConfigured()) {
                        try {
                            await deleteFromCloudinary(image.public_id);
                            cloudinaryDeleted++;
                        } catch (error) {
                            console.error(`Error deleting Cloudinary image ${image.public_id}:`, error.message);
                        }
                    }
                }
            }
        }
        
        const productCount = await Product.deleteMany({});
        console.log(`   Deleted ${productCount.deletedCount} products`);
        if (cloudinaryDeleted > 0) {
            console.log(`   Deleted ${cloudinaryDeleted} Cloudinary images`);
        }

        // Clear Orders
        console.log('\n🗑️  Clearing Orders...');
        const orderCount = await Order.deleteMany({});
        console.log(`   Deleted ${orderCount.deletedCount} orders`);

        // Clear Customers
        console.log('\n🗑️  Clearing Customers...');
        const customerCount = await Customer.deleteMany({});
        console.log(`   Deleted ${customerCount.deletedCount} customers`);

        // Clear Carousels (and delete Cloudinary images if configured)
        console.log('\n🗑️  Clearing Carousels...');
        const carousels = await Carousel.find({});
        cloudinaryDeleted = 0;
        
        for (const carousel of carousels) {
            if (carousel.image && carousel.image.public_id && isCloudinaryConfigured()) {
                try {
                    await deleteFromCloudinary(carousel.image.public_id);
                    cloudinaryDeleted++;
                } catch (error) {
                    console.error(`Error deleting Cloudinary image ${carousel.image.public_id}:`, error.message);
                }
            }
        }
        
        const carouselCount = await Carousel.deleteMany({});
        console.log(`   Deleted ${carouselCount.deletedCount} carousels`);
        if (cloudinaryDeleted > 0) {
            console.log(`   Deleted ${cloudinaryDeleted} Cloudinary images`);
        }

        // Delete all files in uploads directory
        console.log('\n🗑️  Clearing uploaded files...');
        const uploadsDir = path.join(__dirname, '../uploads');
        
        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            let deletedFiles = 0;
            
            for (const file of files) {
                const filePath = path.join(uploadsDir, file);
                try {
                    if (fs.statSync(filePath).isFile()) {
                        fs.unlinkSync(filePath);
                        deletedFiles++;
                    }
                } catch (error) {
                    console.error(`Error deleting file ${file}:`, error.message);
                }
            }
            
            console.log(`   Deleted ${deletedFiles} files from uploads directory`);
        } else {
            console.log('   Uploads directory does not exist');
        }

        console.log('\n✅ All uploaded data cleared successfully!');
        console.log('   Note: Admin accounts were preserved.');
        
    } catch (error) {
        console.error('❌ Error clearing data:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    }
};

// Run the script
if (require.main === module) {
    clearAllData()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('Failed to clear data:', error);
            process.exit(1);
        });
}

module.exports = clearAllData;

