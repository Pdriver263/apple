const { Client } = require('@elastic/elasticsearch');
const Listing = require('../models/Listing');

const client = new Client({ node: process.env.ELASTICSEARCH_URL });

// লিস্টিং ইনডেক্স করুন
exports.indexListing = async (listing) => {
  await client.index({
    index: 'listings',
    id: listing._id.toString(),
    body: {
      title: listing.title,
      description: listing.description,
      location: listing.location.city,
      price: listing.price,
      amenities: listing.amenities
    }
  });
};

// এডভান্সড সার্চ
exports.searchListings = async (query) => {
  const { keywords, location, minPrice, maxPrice, amenities } = query;

  const mustClauses = [];
  
  if (keywords) {
    mustClauses.push({
      multi_match: {
        query: keywords,
        fields: ['title^3', 'description']
      }
    });
  }

  if (location) {
    mustClauses.push({ match: { location } });
  }

  if (minPrice || maxPrice) {
    const range = {};
    if (minPrice) range.gte = minPrice;
    if (maxPrice) range.lte = maxPrice;
    mustClauses.push({ range: { price: range } });
  }

  if (amenities) {
    mustClauses.push({
      terms: { amenities: amenities.split(',') }
    });
  }

  const { body } = await client.search({
    index: 'listings',
    body: {
      query: {
        bool: { must: mustClauses }
      },
      sort: [
        { price: { order: 'asc' } }
      ]
    }
  });

  return body.hits.hits.map(hit => hit._id);
};