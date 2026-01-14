const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Workshop = require('../models/Workshop'); // <--- YOU WERE MISSING THIS LINE

// Fetch only mechanics to populate dropdowns
router.get('/mechanics', async (req, res) => {
  try {
    const mechanics = await User.find({ role: 'mechanic' }).select('name email _id');
    res.json(mechanics);
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Find the workshop
    const workshop = await Workshop.findOne();
    if (!workshop) return res.status(404).json({ message: 'No workshop configured' });

    // Create the user
    const newUser = new User({
      name,
      email,
      password,
      role: 'mechanic',
      workshop: workshop._id
    });

    const savedUser = await newUser.save();

    // Add user to the Workshop staff list
    workshop.staff.push(savedUser._id);
    await workshop.save();

    res.status(201).json(savedUser);
  } catch (error) {
    console.error(error); // Add this to see the real error in your terminal
    res.status(500).json({ message: 'Error creating mechanic', error });
  }
});

module.exports = router;