const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  workshop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workshop',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  date: {
    type: String, // Format YYYY-MM-DD
    required: true
  },
  time: {
    type: String, // Format HH:mm (Start Time)
    required: true
  },
  // NEW: We save when the service finishes to calculate overlaps
  endTime: {
    type: String, // Format HH:mm
    required: true
  },
  status: {
    type: String,
    enum: ['Pendente', 'Confirmado', 'Em Progresso', 'Concluído', 'Cancelado'],
    default: 'Pendente'
  },
  mechanic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);