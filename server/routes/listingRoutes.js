const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const { verifyHost } = require('../middlewares/auth');

// নতুন প্রোপার্টি লিস্ট করার API
router.post('/', verifyHost, async (req, res) => {
  try {
    const { title, description, price, location, amenities } = req.body;
    
    const newListing = new Listing({
      title,
      description,
      price,
      host: req.user.id,
      location,
      amenities
    });

    const savedListing = await newListing.save();
    res.status(201).json(savedListing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ফিচার্ড লিস্টিং পাওয়ার API
// // Changed to '/api/listings/featured' will now be '/api/featured'
router.get('/featured', async (req, res) => {
  try {
    const featuredListings = await Listing.find({ isFeatured: true })
      .populate('host', 'name email phone')
      .limit(10); // শীর্ষ ১০টি ফিচার্ড লিস্টিং
    
    res.json(featuredListings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// প্রোপার্টি সার্চ করার API
router.get('/', async (req, res) => {
  try {
    const { location, minPrice, maxPrice, featured } = req.query;
    
    let query = {};
    if (location) query['location.city'] = new RegExp(location, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    if (featured === 'true') query.isFeatured = true;

    const listings = await Listing.find(query)
      .populate('host', 'name email phone')
      .sort({ createdAt: -1 }); // নতুনতম লিস্টিং প্রথমে
    
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// একটি নির্দিষ্ট লিস্টিং এর বিস্তারিত তথ্য
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('host', 'name email phone');
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// লিস্টিং আপডেট করার API (শুধু হোস্ট)
router.put('/:id', verifyHost, async (req, res) => {
  try {
    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.id, host: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found or unauthorized' });
    }
    
    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// লিস্টিং ডিলিট করার API (শুধু হোস্ট)
router.delete('/:id', verifyHost, async (req, res) => {
  try {
    const listing = await Listing.findOneAndDelete({
      _id: req.params.id,
      host: req.user.id
    });
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found or unauthorized' });
    }
    
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;