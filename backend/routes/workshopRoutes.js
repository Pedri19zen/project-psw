const express = require('express');
const router = express.Router();
const workshopController = require('../controllers/workshopController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// ==========================================
// IMPORTANT: ROUTE ORDER MATTERS!
// Specific routes (like /config) MUST come BEFORE dynamic routes (like /:id)
// ==========================================

// --- ADMIN ROUTES (Protected) ---

// 1. Create New (POST /) - Fixes the "Failed to save" error
router.post('/', verifyToken, isAdmin, workshopController.createWorkshop);

// 2. Get Config (GET /config) - Must be before /:id
router.get('/config', verifyToken, isAdmin, workshopController.getWorkshopConfig);

// 3. Update Info (PUT /:id)
router.put('/:id', verifyToken, isAdmin, workshopController.updateWorkshop);

// 4. Update Shifts (PUT /:id/shifts)
router.put('/:id/shifts', verifyToken, isAdmin, workshopController.updateShifts);


// --- PUBLIC ROUTES (Open) ---

// 5. List all (GET /)
router.get('/', workshopController.getPublicWorkshops);

// 6. View Details (GET /:id) - Catches everything else with an ID
router.get('/:id', workshopController.getWorkshopDetails);

module.exports = router;