const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const { uploadToCloudinary, isCloudinaryConfigured, deleteFromCloudinary } = require('./cloudinary');

const testCloudinary = async () => {
    console.log('Testing Cloudinary Configuration...');

    const configured = isCloudinaryConfigured();
    console.log(`Cloudinary Configured: ${configured ? 'YES' : 'NO'}`);

    if (!configured) {
        console.error('❌ Cloudinary is NOT configured. Please check your .env file.');
        return;
    }

    try {
        // Find a file to upload
        const uploadsDir = path.join(__dirname, '../uploads');
        const files = fs.readdirSync(uploadsDir);
        const imageFile = files.find(file => /\.(jpg|jpeg|png)$/i.test(file));

        if (!imageFile) {
            console.error('❌ No image found in uploads directory to test with.');
            return;
        }

        const filePath = path.join(uploadsDir, imageFile);
        console.log(`Attempting to upload: ${filePath}`);

        const result = await uploadToCloudinary(filePath, 'test_ecommerce');
        console.log('✅ Upload Successful!');
        console.log('Result:', result);

        if (result.public_id) {
            console.log('Attempting to delete uploaded image...');
            await deleteFromCloudinary(result.public_id);
            console.log('✅ Deletion Successful!');
        }

    } catch (error) {
        console.error('❌ Cloudinary Test Failed:', error);
    }
};

testCloudinary();
