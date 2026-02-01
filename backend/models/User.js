const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    // This allows all these roles in the database
    enum: ['client', 'admin', 'mechanic', 'staff'], 
    default: 'client'
  },
  workshop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workshop'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);