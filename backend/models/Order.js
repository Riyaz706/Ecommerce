const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        image: String,
        price: Number,
        discountedPrice: Number,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        size: String,
        color: String
    }],
    customer: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        }
    },
    shippingAddress: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pinCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            default: 'India'
        }
    },
    paymentType: {
        type: String,
        enum: ['COD', 'UPI', 'Card', 'Net Banking', 'Wallet'],
        required: true
    },
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String,
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    totalAmount: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    deliveryCharges: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        required: true
    },
    notes: String,
    statusHistory: [{
        status: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String
    }]
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `ORD${Date.now()}${count + 1}`;
    }
    next();
});

// Index for faster queries
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
