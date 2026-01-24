const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');

// @route   POST api/bookings
// @desc    Criar nova marcação real (Lógica no Controller)
// @access  Private
router.post('/', auth, bookingController.createBooking);

// @route   GET api/bookings/available-slots
// @desc    Simular horários disponíveis (Mock)
// @access  Private
router.get('/available-slots', auth, (req, res) => {
  const slots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
  res.json(slots);
});

// @route   GET api/bookings/my-bookings
// @desc    Listar marcações do usuário logado
// @access  Private
router.get('/my-bookings', auth, bookingController.getMyBookings);

// @route   PUT api/bookings/cancel/:id
// @desc    Cancelar uma marcação específica
// @access  Private
router.put('/cancel/:id', auth, bookingController.cancelBooking);

module.exports = router;