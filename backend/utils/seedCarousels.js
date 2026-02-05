require('dotenv').config();
const mongoose = require('mongoose');
const Carousel = require('../models/Carousel');

const carousels = [
    {
        title: "Summer Collection 2024",
        image: {
            url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
            public_id: "seed-fashion-summer"
        },
        link: "/products/Fashion",
        order: 1,
        isActive: true
    },
    {
        title: "Latest in Electronics",
        image: {
            url: "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?q=80&w=2070&auto=format&fit=crop",
            public_id: "seed-electronics-latest"
        },
        link: "/products/Electronics",
        order: 2,
        isActive: true
    },
    {
        title: "Beauty & Personal Care",
        image: {
            url: "https://images.unsplash.com/photo-1596462502278-27bfdd403cc2?w=1920&q=80",
            public_id: "seed-beauty"
        },
        link: "/products/Beauty",
        order: 3,
        isActive: true
    },
    {
        title: "Home & Living",
        image: {
            url: "https://images.unsplash.com/photo-1484154218962-a1c00207099b?w=1920&q=80",
            public_id: "seed-home"
        },
        link: "/products/Home",
        order: 4,
        isActive: true
    },
    {
        title: "Sports & Outdoors",
        image: {
            url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1920&q=80",
            public_id: "seed-sports"
        },
        link: "/products/Sports",
        order: 5,
        isActive: true
    }
];

const seedCarousels = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected...');

        // Check if carousels exist
        // Check if carousels exist
        const count = await Carousel.countDocuments();
        if (count > 0) {
            console.log(`Database already has ${count} carousels. Clearing and re-seeding.`);
            await Carousel.deleteMany({});
        }

        // Insert new carousels
        await Carousel.insertMany(carousels);
        console.log('Fake offer banners added successfully!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding carousels:', error);
        process.exit(1);
    }
};

seedCarousels();
