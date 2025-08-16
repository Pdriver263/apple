const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Title is required'] },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true },
        address: String,
        city: String,
        country: String
    },
    amenities: {
        wifi: { type: Boolean, default: false },
        ac: { type: Boolean, default: false },
        kitchen: { type: Boolean, default: false },
        parking: { type: Boolean, default: false },
        tv: { type: Boolean, default: false }
    },
    images: [String],
    maxGuests: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    beds: { type: Number, required: true },
    isFeatured: { type: Boolean, default: false }, // ফিচার্ড ফিল্ড যোগ করা হয়েছে
    createdAt: { type: Date, default: Date.now }
});

// জিওস্পেশিয়াল ইনডেক্সিং
listingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Listing', listingSchema);