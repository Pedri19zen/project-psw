const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Route: POST /api/auth/register
router.post('/register', authController.register);

// Route: POST /api/auth/login
router.post('/login', authController.login);

// Route: POST /api/auth/google
router.post('/google', authController.googleAuth);

// Route: GET /api/auth/me (Protected)
router.get('/me', verifyToken, authController.getMe);

module.exports = router;