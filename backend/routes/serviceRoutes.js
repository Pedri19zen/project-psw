const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Workshop = require('../models/Workshop');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware'); // <--- IMPORT

// List all services (PUBLIC - Clients need to see this)
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().populate('authorizedMechanics', 'name email');
    res.json(services);
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Create new service (ADMIN ONLY)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const newService = new Service(req.body);
    const savedService = await newService.save();

    if (req.body.workshop) {
      await Workshop.findByIdAndUpdate(req.body.workshop, {
        $push: { services: savedService._id }
      });
    }

    res.status(201).json(savedService);
  } catch (error) {
    res.status(400).json({ message: 'Error creating service', error });
  }
});

// Update service (ADMIN ONLY)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Delete service (ADMIN ONLY)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;