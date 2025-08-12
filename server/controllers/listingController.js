const Listing = require('../models/Listing');
const geocoder = require('../utils/geocoder');

// নতুন লিস্টিং তৈরি
exports.createListing = async (req, res) => {
    try {
        // জিওকোডিং - এড্রেস থেকে ল্যাট, লং
        const loc = await geocoder.geocode(req.body.address);
        const location = {
            type: 'Point',
            coordinates: [loc[0].longitude, loc[0].latitude],
            address: loc[0].formattedAddress,
            city: loc[0].city,
            country: loc[0].countryCode
        };

        // ইমেজ আপলোড হ্যান্ডলিং (multer middleware এর মাধ্যমে)
        const images = req.files.map(file => file.path);

        const listing = await Listing.create({
            ...req.body,
            location,
            images,
            host: req.user.id
        });

        res.status(201).json(listing);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// লিস্টিং সার্চ
exports.searchListings = async (req, res) => {
    try {
        const { location, startDate, endDate, guests, minPrice, maxPrice } = req.query;

        // বেসিক কোয়েরি
        let query = {
            maxGuests: { $gte: parseInt(guests) || 1 },
            price: { 
                $gte: parseInt(minPrice) || 0,
                $lte: parseInt(maxPrice) || 1000000
            }
        };

        // লোকেশন কোয়েরি (রেডিয়াস সার্চ)
        if (location) {
            const loc = await geocoder.geocode(location);
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [loc[0].longitude, loc[0].latitude]
                    },
                    $maxDistance: 50000 // 50km radius
                }
            };
        }

        // বুকিং ডেট চেক
        if (startDate && endDate) {
            query.$and = [
                { 
                    bookedDates: { 
                        $not: { 
                            $elemMatch: { 
                                $gte: new Date(startDate), 
                                $lte: new Date(endDate) 
                            } 
                        } 
                    } 
                }
            ];
        }

        const listings = await Listing.find(query)
            .populate('host', 'profile.name profile.phone');

        res.status(200).json(listings);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Existing advancedSearch function
const { searchListings: advancedSearchListings } = require('../services/searchService');

// এডভান্সড সার্চ API
exports.advancedSearch = async (req, res) => {
    try {
        const listingIds = await advancedSearchListings(req.query);
        const listings = await Listing.find({ _id: { $in: listingIds } })
            .populate('host', 'name');
            
        res.json(listings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Search failed' });
    }
};