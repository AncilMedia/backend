const sendPushNotification = require('./sendPushNotification'); // adjust path if needed

const testToken = 'ffzKBQXbS6yC_hGgvAh3av:APA91bF-fm0pcEWN0P6...'; // replace with real token

sendPushNotification(
  [testToken],
  '🚀 Manual Test Notification',
  'This is a test notification sent manually!',
  'https://via.placeholder.com/512'
).then(() => {
  console.log('✅ Test notification sent');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error sending test notification:', err);
  process.exit(1);
});
