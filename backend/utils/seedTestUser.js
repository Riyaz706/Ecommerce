require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Product = require('../models/Product');

const seedTestUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected...');

        // 1. Create Test Customer
        const customerData = {
            name: "Test User",
            email: "user@example.com",
            phone: "+91 9876543210",
            password: "User@123",
            addresses: [{
                name: "Test User",
                phone: "+91 9876543210",
                street: "123, Tech Park Road",
                city: "Bangalore",
                state: "Karnataka",
                pinCode: "560001",
                country: "India",
                isDefault: true
            }]
        };

        // Check if user exists
        let customer = await Customer.findOne({ email: customerData.email });
        if (customer) {
            console.log('Test user already exists.');
            // Only update password if needed, or just proceed to add orders if missing
        } else {
            customer = await Customer.create(customerData);
            console.log('Test user created: user@example.com');
        }

        // 2. Fetch some products
        const products = await Product.find().limit(3);
        if (products.length === 0) {
            console.log('No products found. Please run seed:products first.');
            process.exit(1);
        }

        // 3. Create Orders if none exist for this user
        const orderCount = await Order.countDocuments({ customerId: customer._id });
        if (orderCount > 0) {
            console.log(`User already has ${orderCount} orders via seed.`);
            process.exit(0);
        }

        const orders = [
            {
                orderNumber: `ORD${Date.now()}1`,
                customerId: customer._id,
                items: [
                    {
                        product: products[0]._id,
                        name: products[0].name,
                        image: products[0].images[0]?.url,
                        price: products[0].price,
                        discountedPrice: products[0].discountedPrice,
                        quantity: 1,
                        size: products[0].sizes[0]?.name || 'M',
                        color: products[0].colors[0] || 'Black'
                    }
                ],
                customer: {
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone
                },
                shippingAddress: customer.addresses[0],
                paymentType: 'Card',
                paymentStatus: 'Paid',
                orderStatus: 'Delivered',
                totalAmount: products[0].price,
                discount: products[0].price - products[0].discountedPrice,
                deliveryCharges: 0,
                finalAmount: products[0].discountedPrice,
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
            },
            {
                orderNumber: `ORD${Date.now()}2`,
                customerId: customer._id,
                items: [
                    {
                        product: products[1]._id,
                        name: products[1].name,
                        image: products[1].images[0]?.url,
                        price: products[1].price,
                        discountedPrice: products[1].discountedPrice,
                        quantity: 2,
                        size: products[1].sizes[0]?.name || 'L',
                        color: products[1].colors[0] || 'Blue'
                    }
                ],
                customer: {
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone
                },
                shippingAddress: customer.addresses[0],
                paymentType: 'COD',
                paymentStatus: 'Pending',
                orderStatus: 'Processing',
                totalAmount: products[1].price * 2,
                discount: (products[1].price - products[1].discountedPrice) * 2,
                deliveryCharges: 50,
                finalAmount: (products[1].discountedPrice * 2) + 50,
                createdAt: new Date() // Today
            }
        ];

        await Order.insertMany(orders);
        console.log('Test orders added for user@example.com');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding test user:', error);
        process.exit(1);
    }
};

seedTestUser();
