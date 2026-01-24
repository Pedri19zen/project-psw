const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController'); 
const { verifyToken, isAdmin } = require('../middleware/authMiddleware'); 

// Get mechanics
router.get('/mechanics', verifyToken, staffController.getMechanics);

// Create new staff (This forces the role to 'mechanic')
router.post('/', verifyToken, isAdmin, staffController.createStaff);

module.exports = router;