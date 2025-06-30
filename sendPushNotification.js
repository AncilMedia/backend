const axios = require('axios');

const sendPushNotification = async (fcmTokens, title, body, imageUrl = '') => {
  const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;

  const message = {
    registration_ids: fcmTokens,
    notification: {
      title,
      body,
      image: imageUrl,
    },
    priority: "high",
  };

  try {
    const res = await axios.post('https://fcm.googleapis.com/fcm/send', message, {
      headers: {
        Authorization: `key=${FCM_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    console.log('✅ Notification sent:', res.data);
  } catch (err) {
    console.error('❌ Error sending notification:', err.response?.data || err.message);
  }
};

module.exports = sendPushNotification;
