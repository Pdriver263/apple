const Notification = require('../models/Notification');

exports.createNotification = async (req, res, next) => {
  try {
    const { recipient, message, type, relatedEntity } = req.body;
    
    const notification = new Notification({
      recipient,
      message,
      type,
      relatedEntity,
      read: false
    });

    await notification.save();
    
    // রিয়েল-টাইম নোটিফিকেশন পাঠান
    const wss = req.app.get('wss');
    sendNotification(wss, recipient, {
      type: 'new_notification',
      data: notification
    });

    res.status(201).json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};