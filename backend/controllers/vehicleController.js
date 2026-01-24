const Vehicle = require('../models/Vehicle'); // Ensure this matches your actual file name (Vehicle.js or vehicleModel.js)
const mongoose = require('mongoose');

// Helper function to get User ID safely
// This handles cases where the token payload uses 'id' instead of '_id'
const getUserId = (user) => {
  if (!user) return null;
  return user._id || user.id;
};

// @desc    Get all vehicles for the logged-in user
// @route   GET /api/vehicles
// @access  Private
const getVehicles = async (req, res) => {
  try {
    const userId = getUserId(req.user);

    // Safety check: Ensure user is authenticated
    if (!userId) {
      console.log('❌ Error: User is not defined in request.');
      return res.status(401).json({ message: 'User not authorized' });
    }

    console.log(`🔍 Fetching vehicles for user: ${userId}`);

    const vehicles = await Vehicle.find({ owner: userId });
    res.status(200).json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private
const createVehicle = async (req, res) => {
  try {
    const { brand, model, plate, year } = req.body;
    const userId = getUserId(req.user);

    // 1. Validation: Check if fields exist
    if (!brand || !model || !plate || !year) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // 2. Validation: Check if user is authenticated
    if (!userId) {
      console.log('❌ Error: Attempted to create vehicle without logged-in user.');
      return res.status(401).json({ message: 'User not authorized' });
    }

    console.log(`🚗 Attempting to create vehicle for user ${userId}:`, req.body);

    // 3. Create Vehicle
    const vehicle = await Vehicle.create({
      brand,
      model,
      plate,
      year,
      owner: userId, // ✅ FIX: Uses the safe ID variable
    });

    res.status(201).json(vehicle);
  } catch (error) {
    console.error('❌ CREATE ERROR:', error);
    
    // specialized error message for duplicate plates
    if (error.code === 11000) { 
        return res.status(400).json({ message: 'This license plate already exists.' });
    }
    
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    const userId = getUserId(req.user);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check for user
    if (!userId) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Ensure the logged-in user matches the vehicle owner
    if (vehicle.owner.toString() !== userId.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    const userId = getUserId(req.user);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Ensure the logged-in user matches the vehicle owner
    if (vehicle.owner.toString() !== userId.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await vehicle.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};