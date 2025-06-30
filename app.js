const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectDB = require('./db');
const router = require('./routers');

const app = express();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// ✅ QUICK EXIT for favicon requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// ✅ Create uploads directory (used only locally)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// ✅ Serve static files from /uploads
app.use('/uploads', express.static('uploads'));

// ✅ Database connection per request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ DB connection error:', err);
    res.status(500).send('Database connection error');
  }
});

// ✅ Mount all API routers (auth + item + token + others)
app.use('/api', router);

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('Welcome to Admin Panel');
});

// ✅ Start cron jobs (locally or on non-serverless environments)
if (process.env.ENABLE_CRON === 'true') {
  console.log('[⏰] Starting cron jobs...');
  require('./cornJobs');  // Make sure this file exists
}

// ✅ Export for Vercel (serverless)
module.exports = app;
module.exports.handler = serverless(app);