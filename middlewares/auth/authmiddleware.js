const jwt = require('jsonwebtoken');
const User = require('../../models/user/users');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user) return res.status(401).json({ error: 'User not found' });

    if (user.blocked) return res.status(403).json({ error: 'User is blocked by admin' });
    if (!user.approved) return res.status(403).json({ error: 'User is not approved by admin' });

    req.user = user;
    next();
  } catch (err) {
    console.error('[AUTH ERROR]', err);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken;
