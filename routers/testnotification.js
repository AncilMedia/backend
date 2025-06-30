// POST /api/test-notification
router.post('/test-notification', async (req, res) => {
  const { token } = req.body;
  const sendPushNotification = require('../utils/sendPushNotification');

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  try {
    await sendPushNotification(
      [token],
      '🚀 Manual Test',
      'Push sent using manually entered FCM token'
    );
    res.status(200).json({ success: true, message: 'Notification sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send notification', error: err.message });
  }
});
