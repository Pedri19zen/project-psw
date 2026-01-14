const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },       // e.g., "Oil Change"
  type: { type: String, required: true },       // e.g., "Maintenance"
  price: { type: Number, required: true },
  duration: { type: Number, required: true },   // in minutes
  descriptionPublic: { type: String },          // Visible to Client
  descriptionPrivate: { type: String },         // Visible to Staff
  // Which mechanics can do this?
  authorizedMechanics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  workshop: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);