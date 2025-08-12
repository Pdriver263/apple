const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    listing: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Listing',
        required: true 
    },
    guest: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    commission: { type: Number, required: true },
    hostPayout: { type: Number, required: true },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['stripe', 'bKash', 'nagad', 'cash'],
        required: true
    },
    cancellationPolicy: {
        type: String,
        enum: ['flexible', 'moderate', 'strict'],
        default: 'moderate'
    },
    cancellationDate: { type: Date },
    refundAmount: { type: Number },
    cancellationReason: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);