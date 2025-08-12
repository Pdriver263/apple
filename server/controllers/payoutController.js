const Payout = require('../models/Payout');
const Booking = require('../models/Booking');

// হোস্ট পেয়াউট রিকুয়েস্ট তৈরি
exports.requestPayout = async (req, res) => {
  try {
    const { paymentMethod, paymentDetails } = req.body;
    
    // হোস্টের অনিয়ন্ত্রিত বুকিং থেকে প্রাপ্ত অর্থের যোগফল
    const unpaidBookings = await Booking.find({
      host: req.user.id,
      paymentStatus: 'completed',
      payoutStatus: 'unpaid'
    });

    const totalAmount = unpaidBookings.reduce((sum, booking) => sum + booking.hostPayout, 0);

    if (totalAmount <= 0) {
      return res.status(400).json({ message: 'No funds available for payout' });
    }

    // নতুন পেয়াউট রিকুয়েস্ট তৈরি
    const newPayout = new Payout({
      host: req.user.id,
      amount: totalAmount,
      paymentMethod,
      paymentDetails
    });

    await newPayout.save();

    // বুকিংগুলোকে 'processing' হিসেবে মার্ক করুন
    await Booking.updateMany(
      { _id: { $in: unpaidBookings.map(b => b._id) } },
      { payoutStatus: 'processing' }
    );

    res.status(201).json(newPayout);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// অ্যাডমিনের জন্য পেয়াউট প্রসেস
exports.processPayout = async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id);
    
    if (!payout) {
      return res.status(404).json({ message: 'Payout not found' });
    }

    // এখানে প্রকৃত পেমেন্ট প্রসেসিং লজিক যোগ করুন (bKash/ব্যাংক API কল)
    // সিমুলেটেড পেমেন্ট:
    payout.status = 'processed';
    payout.processedAt = new Date();
    await payout.save();

    // সংশ্লিষ্ট বুকিংগুলোকে 'paid' হিসেবে আপডেট করুন
    await Booking.updateMany(
      { host: payout.host, payoutStatus: 'processing' },
      { payoutStatus: 'paid' }
    );

    res.json({ message: 'Payout processed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};