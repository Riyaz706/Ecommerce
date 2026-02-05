const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const BACKEND_URL = 'http://localhost:5001/api';

async function verifyCarouselDelete() {
    try {
        console.log('1. Logging in as Admin...');
        const loginRes = await axios.post(`${BACKEND_URL}/admin/auth/login`, {
            email: 'admin@ecommerce.com',
            password: 'Admin@123'
        });

        const token = loginRes.data.token;
        console.log('Login successful.');

        console.log('2. Creating Test Carousel...');
        const formData = new FormData();
        formData.append('title', 'Test Delete Me');
        formData.append('link', '/test');
        formData.append('order', 999);
        // Use a real image
        const imagePath = path.join(__dirname, '../../ECOMMERCE_PRODUCT_IMAGES/train/BABY_PRODUCTS/10_BABY_P_train.jpeg');
        if (!fs.existsSync(imagePath)) {
            console.error('Image file not found:', imagePath);
            return;
        }
        formData.append('image', fs.createReadStream(imagePath));

        const createRes = await axios.post(`${BACKEND_URL}/admin/carousels`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        const carouselId = createRes.data.carousel._id;
        console.log(`Carousel created: ${carouselId}`);

        // Clean up temp file
        // fs.unlinkSync(dummyPath);

        console.log('3. Deleting Carousel...');
        const deleteRes = await axios.delete(`${BACKEND_URL}/admin/carousels/${carouselId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Delete Response:', deleteRes.data);

        if (deleteRes.data.success) {
            console.log('✅ Carousel deletion verified successfully!');
        } else {
            console.error('❌ Carousel deletion failed (API returned false success).');
        }

    } catch (error) {
        console.error('❌ Verification Failed:', error.response ? error.response.data : error.message);
    }
}

verifyCarouselDelete();
