// models/Item/additem.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  url: String,
  image: String,
  imageName: String,
  index: Number, 
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
 