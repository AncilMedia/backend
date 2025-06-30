const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  url: { type: String },
  image: { type: String },      
  imageName: { type: String },  
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);
