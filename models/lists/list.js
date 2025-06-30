const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('List', listSchema);
