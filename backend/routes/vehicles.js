const express = require('express');
const router = express.Router();
// Import the Object containing all functions
const vehicleController = require('../controllers/vehicleController'); 

// ✅ CORRECTED: Importing 'verifyToken' to match your authMiddleware.js
const { verifyToken } = require('../middleware/authMiddleware'); 

// Debug log to ensure functions are loaded
console.log("🛠️ Loading Vehicle Routes...");
if (!vehicleController.createVehicle) {
    console.error("❌ CRITICAL ERROR: vehicleController.createVehicle is UNDEFINED. Check your controller exports!");
}

//Routes with 'verifyToken' middleware applied
router.get('/', verifyToken, vehicleController.getVehicles);
router.post('/', verifyToken, vehicleController.createVehicle);

// Added the PUT route for updates
router.put('/:id', verifyToken, vehicleController.updateVehicle); 
router.delete('/:id', verifyToken, vehicleController.deleteVehicle);

module.exports = router;