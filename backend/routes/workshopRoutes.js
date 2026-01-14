const express = require('express');
const router = express.Router();
const Workshop = require('../models/Workshop');

// Get the workshop configuration
// We grab the first workshop found since we are operating in single-workshop mode for now
router.get('/config', async (req, res) => {
  try {
    const workshop = await Workshop.findOne();
    if (!workshop) return res.status(404).json({ message: 'No workshop found' });
    res.json(workshop);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching config', error });
  }
});

// Update workshop details
router.put('/:id', async (req, res) => {
  try {
    const { name, location, contact } = req.body;
    const updatedWorkshop = await Workshop.findByIdAndUpdate(
      req.params.id,
      { name, location, contact },
      { new: true }
    );
    res.json(updatedWorkshop);
  } catch (error) {
    res.status(500).json({ message: 'Error updating workshop', error });
  }
});

// Update Shifts (Turnos)
// Critical for managing availability [cite: 56, 57]
router.put('/:id/shifts', async (req, res) => {
  try {
    const { shifts } = req.body;
    
    if (!shifts || !Array.isArray(shifts)) {
      return res.status(400).json({ message: 'Invalid shifts format' });
    }

    const updatedWorkshop = await Workshop.findByIdAndUpdate(
      req.params.id,
      { shifts },
      { new: true }
    );
    res.json(updatedWorkshop);
  } catch (error) {
    res.status(500).json({ message: 'Error updating shifts', error });
  }
});

module.exports = router;