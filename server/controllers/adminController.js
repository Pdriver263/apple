import User from '../models/User';
import Listing from '../models/Listing';
import Booking from '../models/Booking';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find().populate('host', 'email');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('guest', 'email')
      .populate('listing', 'title');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalListings, totalBookings, totalRevenue] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Booking.countDocuments(),
      Booking.aggregate([
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ]);
    
    res.json({
      totalUsers,
      totalListings,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};