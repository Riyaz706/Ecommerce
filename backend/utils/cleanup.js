const axios = require('axios');
const BACKEND_URL = 'http://localhost:5001/api';

async function cleanup() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post(`${BACKEND_URL}/admin/auth/login`, {
            email: 'admin@ecommerce.com',
            password: 'Admin@123'
        });
        const token = loginRes.data.token;

        const idToDelete = '69484f96f7a0ccf71c589c26'; // The ID from failed run
        console.log(`Deleting dangling carousel: ${idToDelete}...`);

        try {
            await axios.delete(`${BACKEND_URL}/admin/carousels/${idToDelete}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ Cleanup successful.');
        } catch (err) {
            console.log('Could not delete (maybe already gone?):', err.message);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

cleanup();
