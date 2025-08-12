const stripe = require('stripe')(process.env.STRIPE_KEY);

// বুকিং ক্যানসেল ও রিফান্ড
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('listing');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // ক্যানসেলেশন পলিসি অনুযায়ী রিফান্ড ক্যালকুলেট
    const refundAmount = calculateRefund(booking);
    
    // স্ট্রাইপ রিফান্ড প্রসেস (যদি স্ট্রাইপ দিয়ে পেমেন্ট হয়ে থাকে)
    if (booking.paymentMethod === 'stripe') {
      await stripe.refunds.create({
        charge: booking.stripeChargeId,
        amount: Math.round(refundAmount * 100)
      });
    }

    // বুকিং স্ট্যাটাস আপডেট
    booking.paymentStatus = 'refunded';
    booking.refundAmount = refundAmount;
    booking.cancellationDate = new Date();
    booking.cancellationReason = req.body.reason;
    await booking.save();

    res.json({ 
      message: 'Booking cancelled successfully',
      refundAmount 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Cancellation failed' });
  }
};

function calculateRefund(booking) {
  const now = new Date();
  const checkInDate = new Date(booking.checkInDate);
  const daysLeft = Math.floor((checkInDate - now) / (1000 * 60 * 60 * 24));
  let refundPercentage = 0;

  switch (booking.listing.cancellationPolicy) {
    case 'flexible':
      refundPercentage = daysLeft > 1 ? 1 : 0.5;
      break;
    case 'moderate':
      refundPercentage = daysLeft > 7 ? 1 : daysLeft > 3 ? 0.5 : 0;
      break;
    case 'strict':
      refundPercentage = daysLeft > 14 ? 0.5 : 0;
      break;
  }

  return booking.totalAmount * refundPercentage;
}