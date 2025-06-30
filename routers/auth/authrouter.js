// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../../models/user/users');
// const generateUserId = require('../../utils/generateUserId');
// const Notification = require('../../models/notifications/notification');

// const router = express.Router();

// // ========== Token Generators ==========
// const generateAccessToken = (user) => {
//   return jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
// };

// const generateRefreshToken = (user) => {
//   return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
// };

// // ========== Register ==========
// router.post('/register', async (req, res) => {
//   try {
//     const { username, email, phone, password } = req.body;

//     if (!username || !email || !phone || !password || password.length < 6) {
//       return res.status(400).json({
//         error: 'All fields are required and password must be at least 6 characters.'
//       });
//     }

//     const trimmedUsername = username.trim();
//     const trimmedEmail = email.trim().toLowerCase();
//     const trimmedPhone = phone.trim();

//     const existingUser = await User.findOne({
//       $or: [
//         { username: trimmedUsername },
//         { email: trimmedEmail },
//         { phone: trimmedPhone }
//       ]
//     });

//     if (existingUser) {
//       return res.status(409).json({ error: 'User already exists. Try logging in.' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const userId = await generateUserId();

//     const newUser = await User.create({
//       userId,
//       username: trimmedUsername,
//       email: trimmedEmail,
//       phone: trimmedPhone,
//       password: hashedPassword,
//     });

//     const notification = await Notification.create({
//       title: 'New User Signup',
//       message: `User ${newUser.username} registered and is pending approval.`,
//       userId: newUser._id,
//       user: {
//         username: newUser.username,
//         userId: newUser.userId,
//         email: newUser.email,
//         approved: newUser.approved,
//         createdAt: newUser.createdAt,
//       },
//     });

//     const io = req.app.get('io');
//     if (io) {
//       io.emit('new_notification', {
//         id: notification._id,
//         title: notification.title,
//         message: notification.message,
//         createdAt: notification.createdAt,
//         userId: newUser._id,
//         read: false,
//         accepted: false,
//         user: notification.user,
//       });
//     }

//     res.status(201).json({
//       message: 'User registered successfully',
//       user: {
//         userId: newUser.userId,
//         username: newUser.username,
//         email: newUser.email,
//         phone: newUser.phone,
//         approved: newUser.approved,
//         role: newUser.role,
//         createdAt: newUser.createdAt,
//       }
//     });
//   } catch (err) {
//     console.error('Register Error:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // ========== Login ==========
// router.post('/login', async (req, res) => {
//   const { identifier, password } = req.body;

//   try {
//     if (!identifier || !password) {
//       return res.status(400).json({ error: 'Identifier and password are required' });
//     }

//     const trimmed = identifier.trim();

//     const user = await User.findOne({
//       $or: [
//         { email: trimmed.includes('@') ? trimmed.toLowerCase() : null },
//         { phone: trimmed.includes('@') ? null : trimmed }
//       ].filter(Boolean)
//     });

//     if (!user || !await bcrypt.compare(password, user.password)) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     if (!user.approved) {
//       return res.status(403).json({ error: 'Your account is not approved yet by admin.' });
//     }

//     if (user.blocked) {
//       return res.status(403).json({ error: 'Your account has been blocked by admin.' });
//     }

//     const accessToken = generateAccessToken(user);
//     const refreshToken = generateRefreshToken(user);
//     user.refreshToken = refreshToken;
//     await user.save();

//     res.json({
//       accessToken,
//       refreshToken,
//       user: {
//         userId: user.userId,
//         username: user.username,
//         email: user.email,
//         phone: user.phone,
//         role: user.role,
//         approved: user.approved,
//         createdAt: user.createdAt,
//       }
//     });
//   } catch (err) {
//     console.error('Login Error:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // ========== Refresh Token ==========
// router.post('/refresh-token', async (req, res) => {
//   const { token } = req.body;
//   if (!token) return res.sendStatus(401);

//   try {
//     const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
//     const user = await User.findById(payload.id);

//     if (!user || token !== user.refreshToken) return res.sendStatus(403);

//     const newAccessToken = generateAccessToken(user);
//     const newRefreshToken = generateRefreshToken(user);
//     user.refreshToken = newRefreshToken;
//     await user.save();

//     res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
//   } catch (err) {
//     console.error('Refresh Token Error:', err);
//     res.sendStatus(403);
//   }
// });

// // ========== Logout ==========
// router.post('/logout', async (req, res) => {
//   const { token } = req.body;

//   try {
//     const user = await User.findOne({ refreshToken: token });
//     if (user) {
//       user.refreshToken = null;
//       await user.save();
//     }

//     res.sendStatus(204);
//   } catch (err) {
//     console.error('Logout Error:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// module.exports = router;


const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // ✅ For external event emission
const User = require('../../models/user/users');
const generateUserId = require('../../utils/generateUserId');
const Notification = require('../../models/notifications/notification');

const router = express.Router();

// ========== Token Generators ==========
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

// ========== Register ==========
router.post('/register', async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    if (!username || !email || !phone || !password || password.length < 6) {
      return res.status(400).json({
        error: 'All fields are required and password must be at least 6 characters.'
      });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    const existingUser = await User.findOne({
      $or: [
        { username: trimmedUsername },
        { email: trimmedEmail },
        { phone: trimmedPhone }
      ]
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists. Try logging in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await generateUserId();

    const newUser = await User.create({
      userId,
      username: trimmedUsername,
      email: trimmedEmail,
      phone: trimmedPhone,
      password: hashedPassword,
    });

    const notification = await Notification.create({
      title: 'New User Signup',
      message: `User ${newUser.username} registered and is pending approval.`,
      userId: newUser._id,
      user: {
        username: newUser.username,
        userId: newUser.userId,
        email: newUser.email,
        approved: newUser.approved,
        createdAt: newUser.createdAt,
      },
    });

    // ✅ Send real-time event to external Socket.IO server
    try {
      await axios.post(`${process.env.SOCKET_SERVER_URL}/emit`, {
        event: 'new_notification',
        data: {
          id: notification._id,
          title: notification.title,
          message: notification.message,
          createdAt: notification.createdAt,
          userId: newUser._id,
          read: false,
          accepted: false,
          user: notification.user,
        }
      });
    } catch (socketError) {
      console.error('Socket emit failed:', socketError.message);
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        approved: newUser.approved,
        role: newUser.role,
        createdAt: newUser.createdAt,
      }
    });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== Login ==========
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier and password are required' });
    }

    const trimmed = identifier.trim();

    const user = await User.findOne({
      $or: [
        { email: trimmed.includes('@') ? trimmed.toLowerCase() : null },
        { phone: trimmed.includes('@') ? null : trimmed }
      ].filter(Boolean)
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.approved) {
      return res.status(403).json({ error: 'Your account is not approved yet by admin.' });
    }

    if (user.blocked) {
      return res.status(403).json({ error: 'Your account has been blocked by admin.' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        approved: user.approved,
        createdAt: user.createdAt,
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== Refresh Token ==========
router.post('/refresh-token', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401);

  try {
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.id);

    if (!user || token !== user.refreshToken) return res.sendStatus(403);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error('Refresh Token Error:', err);
    res.sendStatus(403);
  }
});

// ========== Logout ==========
router.post('/logout', async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ refreshToken: token });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.sendStatus(204);
  } catch (err) {
    console.error('Logout Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
