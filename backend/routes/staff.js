const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware'); 

// Create New Staff (Admin Only)
router.post('/', verifyToken, isAdmin, authController.registerStaff);

// Get All Staff (Admin Only)
router.get('/', verifyToken, isAdmin, authController.getAllStaff); 

// Get Mechanics Only (Admin Only) - MUST be before /:id
router.get('/mechanics', verifyToken, isAdmin, authController.getMechanics);

// Get Single Staff by ID
router.get('/:id', verifyToken, isAdmin, authController.getStaffById);

// Update Staff
router.put('/:id', verifyToken, isAdmin, authController.updateStaff);

// Delete Staff
router.delete('/:id', verifyToken, isAdmin, authController.deleteStaff);

module.exports = router;