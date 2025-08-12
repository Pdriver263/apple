const jwt = require('jsonwebtoken');
const User = require('../models/User');

// রেজিস্ট্রেশন
exports.register = async (req, res) => {
  try {
    const { email, password, role, name, phone } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = await User.create({
      email,
      password,
      role,
      profile: { name, phone }
    });

    // JWT টোকেন জেনারেট
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// লগইন
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ১. চেক করুন ইউজার exists কিনা
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({ error: 'Incorrect email or password' });
    }

    // ২. টোকেন জেনারেট করুন
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // ৩. পাসওয়ার্ড হাইড করুন রেস্পন্স থেকে
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      user
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};