const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  read: { type: Boolean, default: false },
  accepted: { type: Boolean, default: false },
  lastNotifiedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// ✅ TTL Index: Delete notifications 5 days after creation
// notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1296000 }); // 15 * 24 * 60 * 60
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 432000 }); // 15 * 24 * 60 * 60


module.exports = mongoose.model('Notification', notificationSchema);
