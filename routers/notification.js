const express = require('express');
const Notification = require('../models/notifications/notification');
const auth = require('../middlewares/auth/authmiddleware');
const roleCheck = require('../middlewares/Role/roleCheck');

const router = express.Router();

// ✅ Get ALL notifications (admin only)
router.get('/', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('userId', 'userId username email approved createdAt phone')
      .sort({ createdAt: -1 });

    const filtered = notifications.filter(n => n.userId !== null);
    res.json(filtered);
  } catch (err) {
    console.error('Fetch all notifications failed:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// ✅ Get UNREAD notifications only
router.get('/unread', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const unread = await Notification.find({ read: false })
      .populate('userId', 'userId username email approved createdAt')
      .sort({ createdAt: -1 });

    const filtered = unread.filter(n => n.userId !== null);
    res.json(filtered);
  } catch (err) {
    console.error('Fetch unread notifications failed:', err);
    res.status(500).json({ error: 'Failed to fetch unread notifications' });
  }
});

// ✅ Mark one notification as READ
router.put('/read/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true, lastNotifiedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    console.error('Mark as read failed:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// ✅ Mark ALL unread notifications as READ
router.patch('/read-all', auth, roleCheck(['admin']), async (req, res) => {
  try {
    await Notification.updateMany(
      { read: false },
      { $set: { read: true, lastNotifiedAt: new Date() } }
    );
    res.json({ message: 'All unread notifications marked as read' });
  } catch (err) {
    console.error('Read-all failed:', err);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// ✅ Mark notification as ACCEPTED
router.put('/accept/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { accepted: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Marked as accepted' });
  } catch (err) {
    console.error('Accept failed:', err);
    res.status(500).json({ error: 'Failed to mark as accepted' });
  }
});

// ✅ DELETE a notification
router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const deleted = await Notification.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('Delete failed:', err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

module.exports = router;
