const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Readable } = require('stream');
const cloudinary = require('../../cloudinary');
const Item = require('../../models/Item/additem');
const FcmToken = require('../../models/fcmtoken');
const sendPushNotification = require('../../sendFirebaseNotification'); // ✅ Your push utility

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Convert buffer to stream for Cloudinary
function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

// Helper for timeout
function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('⏱ Timeout')), ms))
  ]);
}

// ✅ Reorder Items
router.put('/reorder', async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ error: 'Invalid order array' });
  }

  const bulkOps = order.map((item, idx) => ({
    updateOne: {
      filter: { _id: item._id },
      update: { $set: { index: idx } }
    }
  }));

  try {
    await Item.bulkWrite(bulkOps);
    res.json({ message: 'Order updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item order' });
  }
});

// ✅ Get all items
router.get('/', async (req, res) => {
  try {
    const items = await withTimeout(Item.find().sort({ index: 1 }), 8000);
    res.json(items);
  } catch (err) {
    console.error('❌ Fetch error:', err);
    res.status(500).json({ error: 'Timeout or fetch failed' });
  }
});

// ✅ Create item + Cloudinary + FCM
router.post('/', upload.single('imageFile'), async (req, res) => {
  const { title, subtitle, url, image: imageUrl, index } = req.body;
  let image = imageUrl || '';
  let imageName = '';

  // Upload image to Cloudinary if not provided via URL
  if (!image && req.file) {
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'items' },
          (error, result) => error ? reject(error) : resolve(result)
        );
        bufferToStream(req.file.buffer).pipe(stream);
      });
      image = result.secure_url;
      imageName = result.public_id;
    } catch (err) {
      console.error('❌ Cloudinary upload error:', err);
      return res.status(500).json({ error: 'Failed to upload image' });
    }
  }

  // Save to DB
  try {
    const newItem = new Item({ title, subtitle, url, image, imageName, index });
    const savedItem = await newItem.save();

    // Send Push Notification
try {
  const tokens = await FcmToken.find().distinct('token');
  if (tokens.length > 0) {
    console.log(`📲 Sending notification to ${tokens.length} devices`);
    await sendPushNotification(
      tokens,
      'You Have a Notification',
      title,      // Use the title as body or replace it
      image       // Optional image
    );
  } else {
    console.log('ℹ️ No tokens found for push notification');
  }
} catch (pushErr) {
  console.warn('⚠️ Failed to send push notification:', pushErr.message);
}


    res.status(201).json(savedItem);
  } catch (err) {
    console.error('❌ DB save error:', err);
    res.status(400).json({ error: 'Failed to create item' });
  }
});

// ✅ Update item
router.put('/:id', upload.single('imageFile'), async (req, res) => {
  const { title, subtitle, url, image: imageUrl, index } = req.body;
  const updateData = { title, subtitle, url, index };

  if (imageUrl) {
    updateData.image = imageUrl;
    updateData.imageName = '';
  } else if (req.file) {
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'items' },
          (error, result) => error ? reject(error) : resolve(result)
        );
        bufferToStream(req.file.buffer).pipe(stream);
      });
      updateData.image = result.secure_url;
      updateData.imageName = result.public_id;
    } catch (err) {
      console.error('❌ Upload error:', err);
      return res.status(500).json({ error: 'Failed to upload image' });
    }
  }

  try {
    const updated = await Item.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'Item not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update item' });
  }
});

// ✅ Get item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// ✅ Delete item
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;
