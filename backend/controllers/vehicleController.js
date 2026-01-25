const Vehicle = require('../models/Vehicle');
const mongoose = require('mongoose');

const getUserId = (user) => {
  if (!user) return null;
  return user._id || user.id;
};

// VALIDATION HELPER: Check if Year is realistic
const isValidYear = (year) => {
  const currentYear = new Date().getFullYear();
  return year >= 1886 && year <= (currentYear + 1);
};

// VALIDATION HELPER: Check Portuguese/EU Plate format (XX-XX-XX)
const isValidPlate = (plate) => {
  const regex = /^([A-Z0-9]{2}-[A-Z0-9]{2}-[A-Z0-9]{2})$/;
  return regex.test(plate);
};

// Get all vehicles for the logged-in user
const getVehicles = async (req, res) => {
  try {
    const userId = getUserId(req.user);

    if (!userId) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const vehicles = await Vehicle.find({ owner: userId });
    res.status(200).json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new vehicle with Validation
const createVehicle = async (req, res) => {
  try {
    const { brand, model, plate, year } = req.body;
    const userId = getUserId(req.user);

    if (!brand || !model || !plate || !year) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // 1. Validate Year
    if (!isValidYear(year)) {
      const currentYear = new Date().getFullYear();
      return res.status(400).json({ message: `Invalid year. Must be between 1886 and ${currentYear + 1}.` });
    }

    // 2. Validate Plate
    if (!isValidPlate(plate)) {
      return res.status(400).json({ message: 'Invalid license plate. Please use the format XX-XX-XX.' });
    }

    const vehicle = await Vehicle.create({
      brand,
      model,
      plate, 
      year,
      owner: userId,
    });

    res.status(201).json(vehicle);
  } catch (error) {
    console.error('CREATE ERROR:', error);
    
    if (error.code === 11000) { 
        return res.status(400).json({ message: 'This license plate already exists.' });
    }
    
    res.status(500).json({ message: error.message });
  }
};

// Update a vehicle with Validation
const updateVehicle = async (req, res) => {
  try {
    const { plate, year } = req.body;
    
    if (year && !isValidYear(year)) {
       return res.status(400).json({ message: 'Invalid year.' });
    }

    if (plate && !isValidPlate(plate)) {
       return res.status(400).json({ message: 'Invalid license plate format.' });
    }

    const vehicle = await Vehicle.findById(req.params.id);
    const userId = getUserId(req.user);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'User not found' });
    }

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

// Delete a vehicle
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