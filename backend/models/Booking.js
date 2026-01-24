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
    type: String, // Formato YYYY-MM-DD
    required: true
  },
  time: {
    type: String, // Formato HH:mm
    required: true
  },
  status: {
    type: String,
    enum: ['Pendente', 'Confirmado', 'Em Progresso', 'Concluído', 'Cancelado'],
    default: 'Pendente'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);