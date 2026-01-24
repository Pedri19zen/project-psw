const User = require('../models/User');
const Workshop = require('../models/Workshop');
const bcrypt = require('bcryptjs');

// 1. Get Mechanics (Logic)
exports.getMechanics = async (req, res) => {
  try {
    const mechanics = await User.find({ 
      role: { $in: ['mechanic', 'staff'] } 
    }).select('name email role _id');
    
    res.json(mechanics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error loading mechanics' });
  }
};

// 2. Create Staff (Logic)
exports.createStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check duplicates
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Find workshop
    const workshop = await Workshop.findOne();
    if (!workshop) {
      return res.status(404).json({ message: 'No workshop configuration found.' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'mechanic', // Ensures they are staff
      workshop: workshop._id
    });

    const savedUser = await newUser.save();

    // Link to Workshop
    if (!workshop.staff) workshop.staff = [];
    workshop.staff.push(savedUser._id);
    await workshop.save();

    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role
    });

  } catch (error) {
    console.error("Register Staff Error:", error);
    res.status(500).json({ message: 'Error creating mechanic', error: error.message });
  }
};