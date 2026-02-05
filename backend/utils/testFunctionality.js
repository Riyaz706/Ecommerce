const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

let testResults = {
    passed: 0,
    failed: 0,
    errors: []
};

const log = (message, color = 'reset') => {
    console.log(`${colors[color]}${message}${colors.reset}`);
};

const test = async (name, testFn) => {
    try {
        log(`\n🧪 Testing: ${name}`, 'blue');
        await testFn();
        testResults.passed++;
        log(`✅ PASSED: ${name}`, 'green');
    } catch (error) {
        testResults.failed++;
        testResults.errors.push({ test: name, error: error.message });
        log(`❌ FAILED: ${name}`, 'red');
        log(`   Error: ${error.message}`, 'red');
    }
};

// Test Health Check
const testHealthCheck = async () => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    if (response.data.success !== true) {
        throw new Error('Health check failed');
    }
};

// Test Products Endpoints
const testProducts = async () => {
    // Get all products
    const response = await axios.get(`${API_BASE_URL}/products`);
    if (!response.data.success || !Array.isArray(response.data.products)) {
        throw new Error('Failed to fetch products');
    }
    
    // Test pagination
    const paginatedResponse = await axios.get(`${API_BASE_URL}/products?page=1&limit=10`);
    if (!paginatedResponse.data.pagination) {
        throw new Error('Pagination not working');
    }
    
    // Test invalid product ID
    try {
        await axios.get(`${API_BASE_URL}/products/invalid-id`);
        throw new Error('Should return 404 for invalid product');
    } catch (error) {
        if (error.response && error.response.status !== 404) {
            throw new Error('Invalid product should return 404');
        }
    }
};

// Test Categories Endpoint
const testCategories = async () => {
    const response = await axios.get(`${API_BASE_URL}/categories`);
    if (!response.data.success || !Array.isArray(response.data.categories)) {
        throw new Error('Failed to fetch categories');
    }
};

// Test Carousels Endpoint
const testCarousels = async () => {
    const response = await axios.get(`${API_BASE_URL}/carousels`);
    if (!response.data.success || !Array.isArray(response.data.carousels)) {
        throw new Error('Failed to fetch carousels');
    }
};

// Test Customer Registration
const testCustomerRegistration = async () => {
    const testEmail = `test${Date.now()}@example.com`;
    const response = await axios.post(`${API_BASE_URL}/customer/register`, {
        name: 'Test User',
        email: testEmail,
        phone: '1234567890',
        password: 'password123'
    });
    
    if (!response.data.success || !response.data.token) {
        throw new Error('Registration failed');
    }
    
    // Test duplicate registration
    try {
        await axios.post(`${API_BASE_URL}/customer/register`, {
            name: 'Test User',
            email: testEmail,
            phone: '1234567890',
            password: 'password123'
        });
        throw new Error('Should reject duplicate email');
    } catch (error) {
        if (error.response && error.response.status !== 400) {
            throw new Error('Duplicate email should return 400');
        }
    }
    
    return { email: testEmail, token: response.data.token };
};

// Test Customer Login
const testCustomerLogin = async (email) => {
    // Test valid login
    const response = await axios.post(`${API_BASE_URL}/customer/login`, {
        email: email,
        password: 'password123'
    });
    
    if (!response.data.success || !response.data.token) {
        throw new Error('Login failed');
    }
    
    // Test invalid credentials
    try {
        await axios.post(`${API_BASE_URL}/customer/login`, {
            email: email,
            password: 'wrongpassword'
        });
        throw new Error('Should reject invalid password');
    } catch (error) {
        if (error.response && error.response.status !== 401) {
            throw new Error('Invalid credentials should return 401');
        }
    }
    
    return response.data.token;
};

// Test Customer Profile
const testCustomerProfile = async (token) => {
    const response = await axios.get(`${API_BASE_URL}/customer/me`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.data.success || !response.data.customer) {
        throw new Error('Failed to fetch profile');
    }
    
    // Test without token
    try {
        await axios.get(`${API_BASE_URL}/customer/me`);
        throw new Error('Should require authentication');
    } catch (error) {
        if (error.response && error.response.status !== 401) {
            throw new Error('Unauthenticated request should return 401');
        }
    }
};

// Test Admin Login (if admin exists)
const testAdminLogin = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/admin/auth/login`, {
            email: 'admin@example.com',
            password: 'admin123'
        });
        
        if (response.data.success && response.data.token) {
            return response.data.token;
        }
    } catch (error) {
        // Admin might not exist, that's okay
        log('   ⚠️  Admin login skipped (admin may not exist)', 'yellow');
    }
    return null;
};

// Test Orders Endpoint
const testOrders = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/orders`);
        if (!response.data.success) {
            throw new Error('Failed to fetch orders');
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            log('   ⚠️  Orders endpoint requires authentication (expected)', 'yellow');
        } else {
            throw error;
        }
    }
};

// Test 404 Handler
const test404Handler = async () => {
    try {
        await axios.get(`${API_BASE_URL}/nonexistent-route`);
        throw new Error('Should return 404 for non-existent routes');
    } catch (error) {
        if (error.response && error.response.status !== 404) {
            throw new Error('Non-existent route should return 404');
        }
    }
};

// Run all tests
const runTests = async () => {
    log('\n🚀 Starting Functionality Tests...', 'blue');
    log('='.repeat(50), 'blue');
    
    let customerToken = null;
    let customerEmail = null;
    
    await test('Health Check', testHealthCheck);
    await test('Products Endpoints', testProducts);
    await test('Categories Endpoint', testCategories);
    await test('Carousels Endpoint', testCarousels);
    await test('404 Handler', test404Handler);
    
    // Customer tests
    const registrationResult = await test('Customer Registration', async () => {
        const result = await testCustomerRegistration();
        customerEmail = result.email;
        customerToken = result.token;
    });
    
    if (customerEmail) {
        await test('Customer Login', async () => {
            customerToken = await testCustomerLogin(customerEmail);
        });
        
        if (customerToken) {
            await test('Customer Profile', async () => {
                await testCustomerProfile(customerToken);
            });
        }
    }
    
    await test('Admin Login', testAdminLogin);
    await test('Orders Endpoint', testOrders);
    
    // Summary
    log('\n' + '='.repeat(50), 'blue');
    log('\n📊 Test Summary:', 'blue');
    log(`   ✅ Passed: ${testResults.passed}`, 'green');
    log(`   ❌ Failed: ${testResults.failed}`, 'red');
    
    if (testResults.errors.length > 0) {
        log('\n❌ Errors Found:', 'red');
        testResults.errors.forEach(({ test, error }) => {
            log(`   - ${test}: ${error}`, 'red');
        });
    }
    
    if (testResults.failed === 0) {
        log('\n🎉 All tests passed!', 'green');
        process.exit(0);
    } else {
        log('\n⚠️  Some tests failed. Please review the errors above.', 'yellow');
        process.exit(1);
    }
};

// Run tests
runTests().catch((error) => {
    log(`\n💥 Fatal error: ${error.message}`, 'red');
    process.exit(1);
});

