const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Get All Services (Public)
router.get('/', serviceController.getServices);

// Create Service (Admin Only)
router.post('/', verifyToken, isAdmin, serviceController.createService);

// Update Service (Admin Only)
router.put('/:id', verifyToken, isAdmin, serviceController.updateService);

// Delete Service (Admin Only)
router.delete('/:id', verifyToken, isAdmin, serviceController.deleteService);

module.exports = router;