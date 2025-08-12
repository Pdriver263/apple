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

// প্রোপার্টি সার্চ করার API
router.get('/', async (req, res) => {
  try {
    const { location, minPrice, maxPrice } = req.query;
    
    let query = {};
    if (location) query['location.city'] = new RegExp(location, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    const listings = await Listing.find(query).populate('host', 'name email phone');
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;