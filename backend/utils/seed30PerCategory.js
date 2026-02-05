require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// All categories
const categories = [
    'Baby',
    'Beauty',
    'Electronics',
    'Grocery',
    'Hobbies',
    'Home',
    'Pets',
    'Sports',
    'Women',
    'Men',
    'Accessories'
];

// Brands per category
const brandMap = {
    'Electronics': ['Samsung', 'Apple', 'Sony', 'LG', 'Dell', 'HP', 'Lenovo', 'Asus'],
    'Women': ['Zara', 'H&M', 'Vero Moda', 'Forever 21', 'Prada', 'Mango', 'Bershka', 'Pull&Bear'],
    'Men': ['Nike', 'Adidas', 'Puma', 'Levis', 'Tommy Hilfiger', 'Calvin Klein', 'Arrow', 'Van Heusen'],
    'Accessories': ['Ray-Ban', 'Fossil', 'Titan', 'Fastrack', 'Baggit', 'Skybags', 'Wildcraft', 'American Tourister'],
    'Home': ['IKEA', 'Phillips', 'Prestige', 'Milton', 'Dyson', 'Bajaj', 'Havells', 'Orient'],
    'Beauty': ['L\'Oreal', 'Nivea', 'Maybelline', 'MAC', 'Dove', 'Lakme', 'Ponds', 'Garnier'],
    'Grocery': ['Nestle', 'Britannia', 'Amul', 'Tata', 'Coca-Cola', 'Pepsi', 'Cadbury', 'Parle'],
    'Sports': ['Decathlon', 'Puma', 'Reebok', 'Yonex', 'Wilson', 'Nike', 'Adidas', 'Under Armour'],
    'Pets': ['Pedigree', 'Whiskas', 'Royal Canin', 'Drools', 'Purina', 'Hill\'s', 'Iams', 'Wellness'],
    'Baby': ['Pampers', 'Huggies', 'Johnson\'s', 'Mee Mee', 'Chicco', 'Fisher-Price', 'Gerber', 'Babyhug'],
    'Hobbies': ['Camlin', 'Faber-Castell', 'Parker', 'Lego', 'Hasbro', 'Mattel', 'Crayola', 'Staedtler']
};

// Subcategories per category
const subcategoryMap = {
    'Electronics': ['Smartphones', 'Laptops', 'Tablets', 'Headphones', 'Speakers', 'Smartwatches', 'Cameras', 'Gaming'],
    'Women': ['Dresses', 'Tops', 'Jeans', 'Shirts', 'Jackets', 'Skirts', 'Shoes', 'Bags'],
    'Men': ['Shirts', 'T-Shirts', 'Jeans', 'Pants', 'Jackets', 'Shoes', 'Watches', 'Wallets'],
    'Accessories': ['Watches', 'Bags', 'Sunglasses', 'Jewelry', 'Belts', 'Wallets', 'Hats', 'Scarves'],
    'Home': ['Furniture', 'Kitchen Appliances', 'Home Decor', 'Lighting', 'Storage', 'Bedding', 'Bath', 'Garden'],
    'Beauty': ['Skincare', 'Makeup', 'Haircare', 'Fragrances', 'Body Care', 'Face Care', 'Lip Care', 'Nail Care'],
    'Grocery': ['Snacks', 'Beverages', 'Dairy', 'Bakery', 'Frozen', 'Cereals', 'Spices', 'Condiments'],
    'Sports': ['Fitness', 'Outdoor', 'Team Sports', 'Water Sports', 'Winter Sports', 'Yoga', 'Running', 'Cycling'],
    'Pets': ['Food', 'Toys', 'Accessories', 'Grooming', 'Health', 'Beds', 'Collars', 'Treats'],
    'Baby': ['Diapers', 'Clothing', 'Toys', 'Feeding', 'Care', 'Strollers', 'Car Seats', 'Nursery'],
    'Hobbies': ['Art Supplies', 'Stationery', 'Toys', 'Games', 'Books', 'Musical Instruments', 'Crafts', 'Collectibles']
};

// Colors
const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Pink', 'Purple', 'Grey', 'Brown', 'Orange', 'Navy', 'Beige', 'Maroon'];

// Image URLs (using Unsplash for variety)
const getImageUrl = (category, index) => {
    const imageMap = {
        'Electronics': [
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
            'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
        ],
        'Women': [
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
            'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80',
            'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
            'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80'
        ],
        'Men': [
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
            'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80',
            'https://images.unsplash.com/photo-1550246140-511998777320?w=800&q=80'
        ],
        'Accessories': [
            'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
            'https://images.unsplash.com/photo-1553062407-98e64c6a62?w=800&q=80',
            'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80'
        ],
        'Home': [
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
            'https://images.unsplash.com/photo-1556911220-e15b29be4c55?w=800&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
            'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80'
        ],
        'Beauty': [
            'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
            'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80',
            'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=80'
        ],
        'Grocery': [
            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
            'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
            'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80'
        ],
        'Sports': [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
            'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80',
            'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80',
            'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80'
        ],
        'Pets': [
            'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80',
            'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80',
            'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80',
            'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80'
        ],
        'Baby': [
            'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80',
            'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80',
            'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80',
            'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80'
        ],
        'Hobbies': [
            'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80',
            'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80',
            'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80',
            'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80'
        ]
    };
    
    const images = imageMap[category] || imageMap['Electronics'];
    return images[index % images.length];
};

// Generate product name
const generateProductName = (category, subcategory, brand, index) => {
    const color = colors[Math.floor(Math.random() * colors.length)];
    return `${brand} ${color} ${subcategory} ${index + 1}`;
};

// Generate sizes based on category
const generateSizes = (category) => {
    if (['Electronics', 'Beauty', 'Grocery', 'Pets', 'Baby', 'Hobbies'].includes(category)) {
        return [{ name: 'One Size', quantity: Math.floor(Math.random() * 50) + 20 }];
    } else if (['Women', 'Men'].includes(category)) {
        return [
            { name: 'S', quantity: Math.floor(Math.random() * 20) + 10 },
            { name: 'M', quantity: Math.floor(Math.random() * 30) + 15 },
            { name: 'L', quantity: Math.floor(Math.random() * 20) + 10 },
            { name: 'XL', quantity: Math.floor(Math.random() * 15) + 5 }
        ];
    } else {
        return [{ name: 'One Size', quantity: Math.floor(Math.random() * 40) + 15 }];
    }
};

// Create a product
const createProduct = (category, index) => {
    const brands = brandMap[category] || ['Generic'];
    const subcategories = subcategoryMap[category] || ['General'];
    
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const subcategory = subcategories[Math.floor(Math.random() * subcategories.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const basePrice = category === 'Electronics' ? 5000 : 
                     category === 'Grocery' ? 100 : 
                     category === 'Beauty' ? 500 :
                     category === 'Home' ? 2000 : 1500;
    
    const price = Math.floor(Math.random() * (basePrice * 2)) + basePrice;
    const discountPercent = Math.floor(Math.random() * 50); // 0 to 50%
    const discountedPrice = Math.floor(price - (price * discountPercent / 100));
    
    const sizes = generateSizes(category);
    const totalQuantity = sizes.reduce((sum, size) => sum + size.quantity, 0);
    
    return {
        name: generateProductName(category, subcategory, brand, index),
        description: `High quality ${subcategory.toLowerCase()} from ${brand}. Perfect for ${category.toLowerCase()} category. Premium quality and great value for money.`,
        price,
        discountPercent: discountPercent > 0 ? discountPercent : undefined,
        discountedPrice: discountPercent > 0 ? discountedPrice : undefined,
        category,
        subcategory,
        brand,
        images: [{ url: getImageUrl(category, index) }],
        sizes,
        colors: [color],
        quantity: totalQuantity,
        isActive: true
    };
};

// Seed products
const seed30PerCategory = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected...\n');

        const allProducts = [];
        
        // Generate 30 products for each category
        for (const category of categories) {
            console.log(`📦 Generating 30 products for ${category}...`);
            for (let i = 0; i < 30; i++) {
                allProducts.push(createProduct(category, i));
            }
        }

        // Insert all products
        await Product.insertMany(allProducts);
        
        console.log(`\n✅ Successfully added ${allProducts.length} products!`);
        console.log(`   (30 products × ${categories.length} categories = ${allProducts.length} total)\n`);
        
        // Show summary by category
        console.log('📊 Products by category:');
        for (const category of categories) {
            const count = await Product.countDocuments({ category });
            console.log(`   ${category}: ${count} products`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
};

seed30PerCategory();

