const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Workshop = require('../models/Workshop');

// List all services
router.get('/', async (req, res) => {
  try {
    // Populate mechanics so we see names in the UI, not just IDs
    const services = await Service.find().populate('authorizedMechanics', 'name email');
    res.json(services);
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Create new service
router.post('/', async (req, res) => {
  try {
    const newService = new Service(req.body);
    const savedService = await newService.save();

    // Link service to the workshop
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

// Update service
router.put('/:id', async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Delete service
router.delete('/:id', async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;