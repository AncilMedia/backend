const cron = require('node-cron');
const Notification = require('./models/notifications/notification'); // Adjust path as needed

// Runs every hour on the hour
cron.schedule('0 * * * *', async () => {
  try {
    const reminders = await Notification.find({
      read: true,
      accepted: false,
      lastNotifiedAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) }, // older than 1 hour
    });

    for (const notif of reminders) {
      console.log(`[🔁 Reminder] Unacknowledged: ${notif.message}`);
      notif.lastNotifiedAt = new Date();
      await notif.save();

      // TODO: Add socket or FCM push here
    }
  } catch (err) {
    console.error('[❌ Cron Job Error]', err);
  }
});
