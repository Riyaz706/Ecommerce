const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide product description']
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        min: 0
    },
    discountedPrice: {
        type: Number,
        min: 0
    },
    discountPercent: {
        type: Number,
        min: 0,
        max: 100
    },
    category: {
        type: String,
        required: [true, 'Please provide product category']
    },
    subcategory: {
        type: String
    },
    brand: {
        type: String
    },
    images: [{
        url: String,
        public_id: String // For Cloudinary
    }],
    sizes: [{
        name: String, // S, M, L, XL, etc.
        quantity: Number
    }],
    colors: [String],
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    ratings: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster searches
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
