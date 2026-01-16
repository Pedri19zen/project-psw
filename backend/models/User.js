const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Não é required para quem usa Google
  role: { type: String, default: 'Cliente' }
});
module.exports = mongoose.model('User', UserSchema);