const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin_oficina', 'mechanic', 'client'], 
    default: 'client' 
  },
  workshop: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);