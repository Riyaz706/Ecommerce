require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const categories = ['Women', 'Men', 'Accessories'];
const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Puma', 'Levis', 'Allen Solly', 'FabIndia', 'Roadster', 'Fossil'];
const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Pink', 'Purple', 'Grey', 'Brown'];
const sizes = [
    [{ name: 'S', quantity: 20 }, { name: 'M', quantity: 30 }, { name: 'L', quantity: 20 }],
    [{ name: '6', quantity: 10 }, { name: '7', quantity: 15 }, { name: '8', quantity: 10 }, { name: '9', quantity: 5 }],
    [{ name: 'One Size', quantity: 50 }]
];

const clothesImages = [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80",
    "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
    "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800&q=80",
    "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80",
    "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&q=80",
    "https://images.unsplash.com/photo-1518602164578-cd0074062767?w=800&q=80",
    "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80",
    "https://images.unsplash.com/photo-1550246140-511998777320?w=800&q=80",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?w=800&q=80",
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
    "https://images.unsplash.com/photo-1551028919-ac7675cfccc2?w=800&q=80",
    "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80",
    "https://images.unsplash.com/photo-1550614000-4b9519e09d6f?w=800&q=80",
    "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&q=80",
    "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&q=80",
    "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&q=80",
    "https://images.unsplash.com/photo-1516257984-b1b4d8c9230c?w=800&q=80"
];

const accessoryImages = [
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
    "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800&q=80",
    "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=80",
    "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=800&q=80",
    "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80",
    "https://images.unsplash.com/photo-1509941943102-10c232535736?w=800&q=80",
    "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?w=800&q=80",
    "https://images.unsplash.com/photo-1639686014498-8dba578338f7?w=800&q=80"
];

const generateProducts = () => {
    const products = [];

    // Generate ~200 products for Women
    for (let i = 0; i < 200; i++) {
        products.push(createRandomProduct('Women', clothesImages));
    }

    // Generate ~200 products for Men
    for (let i = 0; i < 200; i++) {
        products.push(createRandomProduct('Men', clothesImages));
    }

    // Generate ~200 products for Accessories
    for (let i = 0; i < 200; i++) {
        products.push(createRandomProduct('Accessories', accessoryImages));
    }

    return products;
};

const createRandomProduct = (category, imagePool) => {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const price = Math.floor(Math.random() * (5000 - 500 + 1)) + 500;
    const discountPercent = Math.floor(Math.random() * 60); // 0 to 60%
    const discountedPrice = Math.floor(price - (price * discountPercent / 100));
    const randomImage = imagePool[Math.floor(Math.random() * imagePool.length)];

    let subcategory;
    let sizeSet = sizes[0]; // Default clothes sizes

    if (category === 'Accessories') {
        const subs = ['Watches', 'Bags', 'Eyewear', 'Jewelry', 'Belts'];
        subcategory = subs[Math.floor(Math.random() * subs.length)];
        sizeSet = sizes[2]; // One Size
    } else {
        const subs = ['Shirts', 'Pants', 'Jackets', 'Dresses', 'T-Shirts', 'Jeans'];
        subcategory = subs[Math.floor(Math.random() * subs.length)];
    }

    return {
        name: `${brand} ${colors[Math.floor(Math.random() * colors.length)]} ${subcategory} ${Math.floor(Math.random() * 1000)}`,
        description: `High quality ${subcategory.toLowerCase()} from ${brand}. Perfect for daily use.`,
        price,
        discountPercent,
        discountedPrice,
        category,
        subcategory,
        brand,
        images: [{ url: randomImage }],
        sizes: sizeSet,
        colors: [colors[Math.floor(Math.random() * colors.length)]],
        quantity: Math.floor(Math.random() * 100) + 10,
        isActive: true
    };
};

const seedManyProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected...');

        const fakeProducts = generateProducts();

        // Clear existing products to ensure clean data
        await Product.deleteMany({});
        console.log('Existing products cleared to fix broken images...');

        await Product.insertMany(fakeProducts);
        console.log(`Successfully added ${fakeProducts.length} new random products!`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
};

seedManyProducts();
