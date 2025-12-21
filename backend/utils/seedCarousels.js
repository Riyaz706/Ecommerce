require('dotenv').config();
const mongoose = require('mongoose');
const Carousel = require('../models/Carousel');

const carousels = [
    {
        title: "Summer Collection 2024",
        image: {
            url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80",
            public_id: "seed-summer-collection"
        },
        link: "/products/Women",
        order: 1,
        isActive: true
    },
    {
        title: "Men's Premium Wear",
        image: {
            url: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1920&q=80",
            public_id: "seed-mens-premium"
        },
        link: "/products/Men",
        order: 2,
        isActive: true
    },
    {
        title: "Exclusive Accessories Sale",
        image: {
            url: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&q=80",
            public_id: "seed-accessories-sale"
        },
        link: "/products/Accessories",
        order: 3,
        isActive: true
    },
    {
        title: "New Arrivals",
        image: {
            url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80",
            public_id: "seed-new-arrivals"
        },
        link: "/products",
        order: 4,
        isActive: true
    }
];

const seedCarousels = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected...');

        // Check if carousels exist
        const count = await Carousel.countDocuments();
        if (count > 0) {
            console.log(`Database already has ${count} carousels. Skipping seed.`);
            // Uncomment below to force re-seed
            // await Carousel.deleteMany({});
            process.exit(0);
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
