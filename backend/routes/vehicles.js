const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Middleware do Membro 3
const vehicleController = require('../controllers/vehicleController');

// @route   GET api/vehicles
// @desc    Obter veículos do user logado
// @access  Private
router.get('/', auth, vehicleController.getMyVehicles);

// @route   POST api/vehicles
// @desc    Adicionar novo veículo
// @access  Private
router.post('/', auth, vehicleController.addVehicle);

// @route   DELETE api/vehicles/:id
// @desc    Remover veículo
// @access  Private
router.delete('/:id', auth, vehicleController.deleteVehicle);

module.exports = router;