const mongoose = require('mongoose');

// User schema definition
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'doctor', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true // Auto create createdAt and updatedAt fields
});

const User = mongoose.model('User', userSchema);
module.exports = User;
