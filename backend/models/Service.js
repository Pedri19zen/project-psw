const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'Maintenance' },
  price: { type: Number, required: true },
  descriptionPublic: { type: String },
  descriptionPrivate: { type: String },
  // Duration in minutes (Default 60 min)
  duration: { type: Number, default: 60 }, 
  authorizedMechanics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  workshop: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop' }
});

module.exports = mongoose.model('Service', ServiceSchema);