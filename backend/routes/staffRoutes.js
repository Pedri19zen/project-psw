const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Fetch only mechanics to populate dropdowns
router.get('/mechanics', async (req, res) => {
  try {
    const mechanics = await User.find({ role: 'mechanic' }).select('name email _id');
    res.json(mechanics);
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;