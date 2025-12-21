const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true
    },
    image: {
        url: {
            type: String,
            required: [true, 'Please provide image URL']
        },
        public_id: String // For Cloudinary
    },
    link: {
        type: String,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Sort by order by default
carouselSchema.index({ order: 1 });

const Carousel = mongoose.model('Carousel', carouselSchema);

module.exports = Carousel;
