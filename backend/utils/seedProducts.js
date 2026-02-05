require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const products = [
    // WOMEN'S CLOTHING
    {
        name: "Floral Summer Dress",
        description: "Beautiful floral print summer dress, perfect for casual outings. Made with breathable cotton fabric.",
        price: 2999,
        discountPercent: 10,
        discountedPrice: 2699,
        category: "Women",
        subcategory: "Dresses",
        brand: "FabIndia",
        images: [{ url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80" }],
        sizes: [
            { name: "S", quantity: 10 },
            { name: "M", quantity: 15 },
            { name: "L", quantity: 8 }
        ],
        colors: [
            { name: "Pink", quantity: 15 },
            { name: "White", quantity: 18 }
        ],
        quantity: 33,
        isActive: true
    },
    {
        name: "Classic Denim Jacket",
        description: "Timeless denim jacket with a comfortable fit. A versatile addition to any wardrobe.",
        price: 3499,
        discountPercent: 0,
        discountedPrice: 3499,
        category: "Women",
        subcategory: "Outerwear",
        brand: "Levis",
        images: [{ url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80" }],
        sizes: [
            { name: "M", quantity: 20 },
            { name: "L", quantity: 10 }
        ],
        colors: [{ name: "Blue", quantity: 30 }],
        quantity: 30,
        isActive: true
    },
    {
        name: "Elegant Evening Gown",
        description: "Stunning red evening gown for special occasions. Features a sleek silhouette and premium fabric.",
        price: 8999,
        discountPercent: 15,
        discountedPrice: 7649,
        category: "Women",
        subcategory: "Dresses",
        brand: "Zara",
        images: [{ url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80" }],
        sizes: [
            { name: "S", quantity: 5 },
            { name: "M", quantity: 5 }
        ],
        colors: [{ name: "Red", quantity: 10 }],
        quantity: 10,
        isActive: true
    },

    // MEN'S CLOTHING
    {
        name: "Casual Cotton Shirt",
        description: "Premium cotton shirt for a smart casual look. Soft texture and durable stitching.",
        price: 1899,
        discountPercent: 20,
        discountedPrice: 1519,
        category: "Men",
        subcategory: "Shirts",
        brand: "H&M",
        images: [{ url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80" }],
        sizes: [
            { name: "M", quantity: 20 },
            { name: "L", quantity: 25 },
            { name: "XL", quantity: 15 }
        ],
        colors: [
            { name: "White", quantity: 30 },
            { name: "Blue", quantity: 30 }
        ],
        quantity: 60,
        isActive: true
    },
    {
        name: "Slim Fit Chinos",
        description: "Comfortable slim fit chinos suitable for office and casual wear. Stretchable fabric.",
        price: 2299,
        discountPercent: 5,
        discountedPrice: 2184,
        category: "Men",
        subcategory: "Pants",
        brand: "Allen Solly",
        images: [{ url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80" }],
        sizes: [
            { name: "30", quantity: 10 },
            { name: "32", quantity: 15 },
            { name: "34", quantity: 10 }
        ],
        colors: [
            { name: "Beige", quantity: 20 },
            { name: "Navy", quantity: 15 }
        ],
        quantity: 35,
        isActive: true
    },
    {
        name: "Leather Biker Jacket",
        description: "Genuine leather jacket with a rugged look. Perfect for riding and winter styling.",
        price: 12999,
        discountPercent: 10,
        discountedPrice: 11699,
        category: "Men",
        subcategory: "Outerwear",
        brand: "Roadster",
        images: [{ url: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80" }],
        sizes: [
            { name: "L", quantity: 5 },
            { name: "XL", quantity: 5 }
        ],
        colors: [{ name: "Black", quantity: 10 }],
        quantity: 10,
        isActive: true
    },

    // ACCESSORIES
    {
        name: "Classic Leather Watch",
        description: "Minimalist analog watch with a genuine leather strap. Water-resistant up to 50m.",
        price: 4500,
        discountPercent: 0,
        discountedPrice: 4500,
        category: "Accessories",
        subcategory: "Watches",
        brand: "Fossil",
        images: [{ url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80" }],
        sizes: [],
        colors: [
            { name: "Black", quantity: 10 },
            { name: "Brown", quantity: 10 }
        ],
        quantity: 20,
        isActive: true
    },
    {
        name: "Canvas Backpack",
        description: "Durable canvas backpack with laptop compartment. Stylish and practical for daily commute.",
        price: 1599,
        discountPercent: 25,
        discountedPrice: 1199,
        category: "Accessories",
        subcategory: "Bags",
        brand: "Wildcraft",
        images: [{ url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80" }],
        sizes: [],
        colors: [
            { name: "Grey", quantity: 20 },
            { name: "Black", quantity: 20 }
        ],
        quantity: 40,
        isActive: true
    },
    {
        name: "Aviator Sunglasses",
        description: "UV protected classic aviator sunglasses. enhancing visual clarity and reducing eye strain.",
        price: 2499,
        discountPercent: 30,
        discountedPrice: 1749,
        category: "Accessories",
        subcategory: "Eyewear",
        brand: "Ray-Ban",
        images: [{ url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80" }],
        sizes: [],
        colors: [
            { name: "Gold", quantity: 25 },
            { name: "Silver", quantity: 25 }
        ],
        quantity: 50,
        isActive: true
    }
];

const seedProducts = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected...');

        // Delete existing products (optional)
        // await Product.deleteMany({});
        // console.log('Existing products removed');

        // Check if products exist to avoid duplicate seeding if run multiple times without clear
        const count = await Product.countDocuments();
        if (count > 0) {
            console.log(`Database already has ${count} products. Skipping seed.`);
            // Uncomment the line below to force seed anyway
            // await Product.deleteMany({});
            process.exit(0);
        }

        // Insert new products
        await Product.insertMany(products);
        console.log('Fake products added successfully!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts();
