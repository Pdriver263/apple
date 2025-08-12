// server/middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // প্রতি IP 100 রিকুয়েস্ট
});

module.exports = apiLimiter;