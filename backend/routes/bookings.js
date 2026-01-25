const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Get All Bookings (Admin Only)
// NOTE: Dashboard calls /api/bookings, so this must be the root '/'
router.get('/', verifyToken, isAdmin, bookingController.getAllBookings);

// Get Client History (Logged in User)
router.get('/my-history', verifyToken, bookingController.getClientHistory);

// Get Available Slots (Public/Auth)
router.get('/available-slots', bookingController.getAvailableSlots);

// Create Booking (Logged in User)
router.post('/', verifyToken, bookingController.createBooking);

// Update Status (Admin Only)
router.patch('/:id/status', verifyToken, isAdmin, bookingController.updateBookingStatus);

module.exports = router;