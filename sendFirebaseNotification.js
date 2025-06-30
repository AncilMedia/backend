const admin = require('./firebaseAdmin'); // make sure this points to your initialized admin

const sendPushNotification = async (tokens, title, body) => {
  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    throw new Error('No valid FCM tokens provided');
  }

  const message = {
    notification: {
      title,
      body,
      // image: imageUrl || undefined

    },
    tokens, // ✅ used with sendEachForMulticast
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log('✅ Notification sent:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to send notification:', error);
    throw error;
  }
};

module.exports = sendPushNotification;



// const admin = require('firebase-admin');
// const serviceAccount = require('./serviceAccountKey.json');

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

// async function sendPushNotification(tokens, title, body, imageUrl) {
//   const message = {
//     notification: {
//       title,
//       body,
//       image: imageUrl || undefined
//     },
//     tokens,
//   };

//   try {
//     const response = await admin.messaging().sendMulticast(message);
//     console.log('✅ Notifications sent:', response.successCount);
//     return response;
//   } catch (error) {
//     console.error('❌ Notification send error:', error);
//     throw error;
//   }
// }

// module.exports = sendPushNotification;
