// // const mongoose = require('mongoose');

// // const userSchema = new mongoose.Schema({
// //   username: {
// //     type: String,
// //     required: true,
// //     unique: true,
// //   },

// //   email: {
// //     type: String,
// //     required: true,
// //     unique: true,
// //   },

// //   phone: {
// //     type: String,
// //     required: true,
// //     unique: true,
// //   },

// //   password: {
// //     type: String,
// //     required: true,
// //   },

// //   refreshToken: {
// //     type: String,
// //   },

// //   approved: {
// //     type: Boolean,
// //     default: null, 
// //   },

// //   blocked: {
// //     type: Boolean,
// //     default: false,
// //   },

// //   role: {
// //     type: String,
// //     enum: ['admin', 'editor', 'viewer'],
// //     default: 'viewer',
// //   },

// // }, { timestamps: true });

// // module.exports = mongoose.model('User', userSchema);


// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//   },

//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },

//   phone: {
//     type: String,
//     required: true,
//     unique: true,
//   },

//   password: {
//     type: String,
//     required: true,
//   },

//   refreshToken: {
//     type: String,
//   },

//   approved: {
//     type: Boolean,
//     default: null, 
//   },

//   blocked: {
//     type: Boolean,
//     default: false,
//   },

//   role: {
//     type: String,
//     enum: ['admin', 'editor', 'viewer'],
//     default: 'viewer',
//   },

//   image: {
//     type: String,
//     default: '',
//   },

//   imageName: {
//     type: String,
//     default: '',
//   }

// }, { timestamps: true });

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    sparse: true,
  },

  username: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  phone: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  refreshToken: {
    type: String,
  },

  approved: {
    type: Boolean,
    default: null, 
  },

  blocked: {
    type: Boolean,
    default: false,
  },

  role: {
    type: String,
    enum: ['admin', 'editor', 'viewer'],
    default: 'viewer',
  },

  image: {
    type: String,
    default: '',
  },

  imageName: {
    type: String,
    default: '',
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
