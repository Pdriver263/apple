const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  host: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processed', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['bank', 'bKash', 'nagad'],
    required: true
  },
  paymentDetails: { type: Object },
  processedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payout', payoutSchema);