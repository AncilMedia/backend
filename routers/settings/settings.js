const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Readable } = require('stream');
const cloudinary = require('../../cloudinary');
const User = require('../../models/user/users');
const auth = require('../../middlewares/auth/authmiddleware');

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

// ✅ GET current user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      _id: user._id,           // ✅ MongoDB ObjectId
      userId: user.userId,     // ✅ Custom userId like "U0624012"
      username: user.username,
      email: user.email,
      phone: user.phone,
      image: user.image,
      role: user.role,
      approved: user.approved,
      blocked: user.blocked,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('[ERROR] Fetch profile failed:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});


// ✅ UPDATE profile info and image
router.put('/', auth, upload.single('imageFile'), async (req, res) => {
  const { username, email, phone } = req.body;
  const updates = {};

  if (username) updates.username = username;
  if (email) updates.email = email;
  if (phone) updates.phone = phone;

  try {
    // Image handling
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'profiles' },
          (error, result) => error ? reject(error) : resolve(result)
        );
        bufferToStream(req.file.buffer).pipe(stream);
      });
      updates.image = result.secure_url;
      updates.imageName = result.public_id;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password -refreshToken');
    if (!user) return res.status(404).json({ error: 'User not found' });

    console.log(`[INFO] Updated profile for user ${user.username}`);
    res.json({
      message: 'Profile updated successfully',
      user: {
        userId: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
        approved: user.approved,
        blocked: user.blocked,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('[ERROR] Profile update failed:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ✅ DELETE account
router.delete('/', auth, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.user.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });

    console.log(`[INFO] Deleted account for user ${deleted.username}`);
    res.json({
      message: 'Account deleted successfully',
      deletedUser: {
        userId: deleted._id,
        email: deleted.email,
        phone: deleted.phone,
        createdAt: deleted.createdAt,
      },
    });
  } catch (err) {
    console.error('[ERROR] Account deletion failed:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
