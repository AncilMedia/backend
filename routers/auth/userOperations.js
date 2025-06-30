const express = require('express');
const User = require('../../models/user/users');
const bcrypt = require('bcryptjs');
const auth = require('../../middlewares/auth/authmiddleware');
const roleCheck = require('../../middlewares/Role/roleCheck');

const router = express.Router();

// ✅ GET users with search, role, approved, and blocked filters
router.get('/', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { search, role, approved, blocked } = req.query;

    const query = {};
    if (search) query.username = { $regex: search, $options: 'i' };
    if (role) query.role = role;

    if (approved === 'true') query.approved = true;
    else if (approved === 'false') query.approved = false;
    else if (approved === 'null') query.approved = null;

    if (blocked === 'true') query.blocked = true;
    else if (blocked === 'false') query.blocked = false;

    const users = await User.find(query).select('-password -refreshToken');
    console.log(`[INFO] Admin ${req.user.username} fetched user list with query:`, query);
    res.json(users);
  } catch (err) {
    console.error(`[ERROR] Fetching users failed: ${err}`);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ✅ Admin creates a new user (auto-approved)
router.post('/create', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { username, email, password, role, phone } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await require('../../utils/generateUserId')(); // ✅ generate unique userId

    const newUser = new User({
      userId, // ✅ assign it here
      username,
      email,
      password: hashedPassword,
      role: role || 'viewer',
      phone,
      approved: true,
      blocked: false,
    });

    await newUser.save();
    console.log(`[INFO] Admin ${req.user.username} created user ${username}`);
    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: newUser._id,
        userId: newUser.userId, // ✅ include in response
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        approved: newUser.approved,
        blocked: newUser.blocked,
      },
    });
  } catch (err) {
    console.error(`[ERROR] Admin create user failed: ${err}`);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ✅ Update user info (username, email, phone)
router.put('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { username, email, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(username && { username }),
        ...(email && { email }),
        ...(phone && { phone }),
      },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) return res.status(404).json({ error: 'User not found' });

    console.log(`[INFO] Updated user ${user.username}`);
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error(`[ERROR] User update failed: ${err}`);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// ✅ Approve, reject or reset approval status
router.put('/approve/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { approve } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { approved: approve },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    const status = approve === true ? 'approved' : approve === false ? 'rejected' : 'reset to pending';
    console.log(`[INFO] User ${user.username} ${status}`);
    res.json({ message: `User ${status}`, user });
  } catch (err) {
    console.error(`[ERROR] Approval failed: ${err}`);
    res.status(500).json({ error: 'Failed to update approval status' });
  }
});

// ✅ Block or unblock user
router.put('/block/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { block } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { blocked: !!block },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    console.log(`[INFO] User ${user.username} ${block ? 'blocked' : 'unblocked'}`);
    res.json({ message: `User ${block ? 'blocked' : 'unblocked'}`, user });
  } catch (err) {
    console.error(`[ERROR] Block update failed: ${err}`);
    res.status(500).json({ error: 'Failed to update block status' });
  }
});

// ✅ Delete user
router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });

    console.log(`[INFO] Deleted user ${deleted.username}`);
    res.sendStatus(204);
  } catch (err) {
    console.error(`[ERROR] Delete failed: ${err}`);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ✅ Get all roles
router.get('/roles', auth, roleCheck(['admin']), (req, res) => {
  const roles = ['admin', 'editor', 'viewer'];
  console.log(`[INFO] Admin ${req.user.username} fetched roles`);
  res.json(roles);
});

// ✅ Update user role
router.put('/role/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { newRole } = req.body;

    if (!newRole) return res.status(400).json({ error: 'New role is required' });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: newRole },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    console.log(`[INFO] Updated role of user ${user.username} to ${newRole}`);
    res.json({ message: 'Role updated successfully', user });
  } catch (err) {
    console.error(`[ERROR] Updating role failed: ${err}`);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

module.exports = router;

