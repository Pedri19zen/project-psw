const mongoose = require('mongoose');

const WorkshopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  contact: { type: String, required: true },
  // "Turnos" configuration as required in the project
  shifts: [{
    name: { type: String, required: true }, // e.g., "Morning"
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },   // "13:00"
    slotsPerShift: { type: Number, default: 2 }  // Vagas available
  }],
  // Links to Services and Staff
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  staff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Workshop', WorkshopSchema);