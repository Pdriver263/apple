const stripe = require('stripe')(process.env.STRIPE_KEY);
const Booking = require('../models/Booking');

// কমিশন ক্যালকুলেশনের জন্য হেল্পার ফাংশন
const calculateCommission = (amount) => {
  const commission = amount * 0.02;
  const hostPayout = amount - commission;
  return { commission, hostPayout };
};

// Stripe পেমেন্ট প্রসেসিং
exports.processStripePayment = async (req, res) => {
  try {
    const { listingId, checkInDate, checkOutDate, totalAmount, token } = req.body;
    
    // Stripe চার্জ তৈরি
    const charge = await stripe.charges.create({
      amount: Math.round(totalAmount * 100), // সেন্টে রূপান্তর
      currency: 'usd',
      source: token.id,
      description: `Booking for listing ${listingId}`
    });

    // কমিশন ক্যালকুলেশন
    const { commission, hostPayout } = calculateCommission(totalAmount);

    // বুকিং ডাটাবেসে সেভ করুন
    const newBooking = new Booking({
      listing: listingId,
      guest: req.user.id,
      checkInDate,
      checkOutDate,
      totalAmount,
      commission,
      hostPayout,
      paymentStatus: 'completed',
      paymentMethod: 'stripe',
      stripeChargeId: charge.id // রেফারেন্সের জন্য সংরক্ষণ
    });

    await newBooking.save();

    res.status(200).json({ 
      success: true,
      message: 'Payment processed successfully',
      bookingId: newBooking._id
    });
  } catch (err) {
    console.error('Stripe payment error:', err);
    res.status(500).json({ 
      error: 'Payment processing failed',
      details: err.message 
    });
  }
};

// bKash পেমেন্ট হ্যান্ডলার
exports.processBkashPayment = async (req, res) => {
  try {
    const { listingId, checkInDate, checkOutDate, totalAmount, phone } = req.body;
    
    // কমিশন ক্যালকুলেশন
    const { commission, hostPayout } = calculateCommission(totalAmount);

    // বুকিং ডাটাবেসে সেভ করুন
    const newBooking = new Booking({
      listing: listingId,
      guest: req.user.id,
      checkInDate,
      checkOutDate,
      totalAmount,
      commission,
      hostPayout,
      paymentStatus: 'completed',
      paymentMethod: 'bKash',
      bKashPhone: phone
    });

    await newBooking.save();

    // এখানে আপনি bKash API কল করতে পারেন
    // উদাহরণ: const bKashResponse = await bKashApi.createPayment(...);
    
    res.status(200).json({ 
      success: true,
      message: 'bKash payment processed successfully',
      bookingId: newBooking._id
    });
  } catch (err) {
    console.error('bKash payment error:', err);
    res.status(500).json({ 
      error: 'Payment processing failed',
      details: err.message 
    });
  }
};