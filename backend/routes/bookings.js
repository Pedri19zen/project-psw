const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
// verifyToken handles the JWT, isAdmin checks the 'admin' role in req.user
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// User Actions
router.post('/', verifyToken, bookingController.createBooking);
router.get('/my-history', verifyToken, bookingController.getClientHistory);

// Public/Shared Actions
router.get('/available-slots', bookingController.getAvailableSlots);

// Admin & Staff Only: Get every booking in the system
router.get('/admin/all', verifyToken, isAdmin, bookingController.getAllBookings);

router.patch('/:id/status', verifyToken, isAdmin, bookingController.updateBookingStatus);

module.exports = router;