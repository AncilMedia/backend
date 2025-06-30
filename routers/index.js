const express = require('express');
const router = express.Router();

// Route: /api/item/*
router.use('/item', require('./Item/additemr'));

// Route: /api/itempopup/*
router.use('/itempopup', require('./Item/additempopupr'));

// Route: /api/register-token
router.use('/register-token', require('../routers/token'));

 // /api/auth/*
router.use('/auth', require('./auth/authrouter'));  

 // /api/users/*       
router.use('/users', require('./auth/userOperations'));  

 // /api/users/*       
router.use('/user', require('./auth/authrouter')); 

// ✅ Notification routes
router.use('/notifications', require('./notification'));


// User Settings (view/update/delete own profile)
router.use('/settings', require('./settings/settings')); 

// ✅ List management
router.use('/lists', require('./lists/lists'));

// Health check route
router.get('/test', (req, res) => {
  res.send('Router is working!');
});

module.exports = router;
