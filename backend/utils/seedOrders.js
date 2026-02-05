
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

const seedOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        // Check current orders
        const count = await Order.countDocuments();
        if (count > 0) {
            console.log(`Database already has ${count} orders.`);
            // Optional: db.orders.drop() manually if you want a fresh start
        }

        // Fetch some products to put in orders
        const products = await Product.find().limit(50);
        if (products.length === 0) {
            console.log('❌ No products found! Cannot seed orders.');
            process.exit(1);
        }

        const orders = [];
        const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

        // Generate 50 random orders over last 30 days
        for (let i = 0; i < 50; i++) {
            const numItems = Math.floor(Math.random() * 3) + 1;
            const orderItems = [];
            let totalAmount = 0;

            for (let j = 0; j < numItems; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 2) + 1;
                const price = product.price;
                const discountedPrice = product.discountedPrice || price; // Use discounted price if available

                orderItems.push({
                    product: product._id,
                    name: product.name,
                    image: product.images[0]?.url,
                    price: price,
                    discountedPrice: discountedPrice,
                    quantity: quantity,
                    size: product.sizes && product.sizes.length ? product.sizes[0].name : 'M',
                    color: product.colors && product.colors.length ? product.colors[0] : 'Black'
                });

                totalAmount += discountedPrice * quantity;
            }

            const deliveryCharges = totalAmount > 500 ? 0 : 50;
            const finalAmount = totalAmount + deliveryCharges;

            // Random date in last 30 days
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));

            // Random status weighted towards 'Delivered' for older dates
            let status = statuses[Math.floor(Math.random() * statuses.length)];

            const order = {
                orderNumber: `ORD${Date.now()}${i}`,
                customer: {
                    name: `Customer ${Math.floor(Math.random() * 1000)}`,
                    email: `customer${i}@example.com`,
                    phone: `98765432${i % 10}${i % 10}`
                },
                shippingAddress: {
                    street: `${Math.floor(Math.random() * 100)} Main St`,
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pinCode: '400001',
                    country: 'India'
                },
                items: orderItems,
                paymentType: ['COD', 'UPI', 'Card'][Math.floor(Math.random() * 3)],
                paymentStatus: 'Paid',
                orderStatus: status,
                totalAmount: totalAmount,
                deliveryCharges: deliveryCharges,
                finalAmount: finalAmount,
                createdAt: date,
                updatedAt: date
            };

            orders.push(order);
        }

        await Order.insertMany(orders);
        console.log(`✅ Successfully seeded ${orders.length} orders!`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding orders:', error);
        process.exit(1);
    }
};

seedOrders();
