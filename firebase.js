const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
  keyFilename: path.join(__dirname, './serviceAccountKey.json'), // ✅ your Firebase service account key
});

const bucket = storage.bucket('flashchat-f43cc.appspot.com'); // ✅ your actual Firebase Storage bucket name

module.exports = bucket;
