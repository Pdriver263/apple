const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { 
  processStripePayment, 
  processBkashPayment 
} = require('../controllers/paymentController');

// স্ট্রাইপ পেমেন্ট রাউট
router.post('/stripe', verifyToken, processStripePayment);

// বিকাশ পেমেন্ট রাউট
router.post('/bkash', verifyToken, processBkashPayment);

module.exports = router;