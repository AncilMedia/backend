const serverless = require('serverless-http');
const app = require('../app'); // path to your app.js file

module.exports = serverless(app);