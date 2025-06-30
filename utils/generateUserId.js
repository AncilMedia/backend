const User = require('../models/user/users');

function padNumber(num, size) {
  return String(num).padStart(size, '0');
}

async function generateUserId() {
  const now = new Date();
  const month = padNumber(now.getMonth() + 1, 2); 
  const day = padNumber(now.getDate(), 2);

  // Count users created today
  const start = new Date(now.setHours(0, 0, 0, 0));
  const end = new Date(now.setHours(23, 59, 59, 999));

  const countToday = await User.countDocuments({
    createdAt: { $gte: start, $lte: end },
  });

  const idNumber = padNumber(countToday + 1, 3); 
  return `U${month}${day}${idNumber}`; 
}

module.exports = generateUserId;
