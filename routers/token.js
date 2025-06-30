const express = require('express');
const router = express.Router();
const FcmToken = require('../models/fcmtoken');
const sendPushNotification = require('../sendFirebaseNotification'); // ✅ Adjust this path as needed

// 🔐 POST /api/register-token
router.post('/', async (req, res) => {
  const { token, platform = 'unknown' } = req.body;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ success: false, message: 'Token is required and must be a string' });
  }

  try {
    const existing = await FcmToken.findOne({ token });

    if (!existing) {
      await new FcmToken({ token, platform }).save();
      console.log('✅ New FCM token saved:', token);
    } else {
      await FcmToken.updateOne({ token }, { $set: { platform, updatedAt: new Date() } });
      console.log('ℹ️ Token already exists, info updated:', token);
    }

    res.status(200).json({ success: true, message: 'Token registered or updated' });
  } catch (err) {
    console.error('❌ Error saving FCM token:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 🚀 POST /api/register-token/test-notification
router.post('/test-notification', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  try {
    await sendPushNotification(
      [token], // ✅ You’re already using it correctly here
      '🚀 Manual Test',
      'Push sent using manually entered FCM token'
    );

    res.status(200).json({ success: true, message: 'Notification sent' });
  } catch (err) {
    console.error('❌ Failed to send notification:', err);
    res.status(500).json({ success: false, message: 'Failed to send notification', error: err.message });
  }
});



module.exports = router;
