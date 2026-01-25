const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware'); 

// Create
router.post('/', verifyToken, isAdmin, authController.registerStaff);

// Read (List All)
router.get('/', verifyToken, isAdmin, authController.getAllStaff); 

// Read (List Mechanics ONLY) - Must be before /:id
router.get('/mechanics', verifyToken, isAdmin, authController.getMechanics);

// Read (Single)
router.get('/:id', verifyToken, isAdmin, authController.getStaffById);

// Update
router.put('/:id', verifyToken, isAdmin, authController.updateStaff);

// Delete
router.delete('/:id', verifyToken, isAdmin, authController.deleteStaff);

module.exports = router;