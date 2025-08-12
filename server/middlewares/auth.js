const jwt = require('jsonwebtoken');

// সাধারণ টোকেন ভেরিফিকেশন মিডলওয়্যার
const verifyToken = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // ডিকোডেড ইউজার ডেটা রিকুয়েস্টে সংযুক্ত করুন
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// শুধুমাত্র হোস্টদের জন্য অ্যাক্সেস
const verifyHost = (req, res, next) => {
  if (!req.user || req.user.role !== 'host') {
    return res.status(403).json({ message: 'Host privileges required' });
  }
  next();
};

// শুধুমাত্র অ্যাডমিনদের জন্য অ্যাক্সেস
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  next();
};

module.exports = { 
  verifyToken, 
  verifyHost, 
  verifyAdmin 
};