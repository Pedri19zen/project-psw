const User = require('../models/User');
const Workshop = require('../models/Workshop');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client("250749350765-8nnv7dfbr3bv1o891hqqhnnhomfo6i2j.apps.googleusercontent.com");
const JWT_SECRET = process.env.JWT_SECRET || "segredo_jwt";

// 1. CLIENT REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "This email is already registered." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword, role: 'client' });
    
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error during registration." });
  }
};

// 2. LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found." });

    if (!user.password) return res.status(400).json({ msg: "Account created via Google. Please use Google Login." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Incorrect password." });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error during login." });
  }
};

// 3. GOOGLE AUTH
exports.googleAuth = async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "250749350765-8nnv7dfbr3bv1o891hqqhnnhomfo6i2j.apps.googleusercontent.com",
    });
    const { name, email } = ticket.getPayload();
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, role: 'client' });
      await user.save();
    }
    const appToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token: appToken, role: user.role, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Invalid Google Token." });
  }
};

// 4. GET ME
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 5. REGISTER STAFF
exports.registerStaff = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "This email is already registered." });

    const workshop = await Workshop.findOne();
    if (!workshop) {
      return res.status(400).json({ msg: "Error: Please configure the workshop in Settings first." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: role || 'mechanic',
      workshop: workshop._id 
    });
    
    await user.save();
    res.status(201).json({ msg: "Staff member registered successfully!" });

  } catch (err) {
    console.error("Staff Register Error:", err);
    res.status(500).json({ msg: "Server error registering staff." });
  }
};

// 6. UPDATE STAFF
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const updateData = { name, email, role };

    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ msg: "Staff member not found." });

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error updating staff member." });
  }
};

// 7. DELETE STAFF
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) return res.status(404).json({ msg: "Staff member not found." });

    res.json({ msg: "Staff member removed successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error removing staff member." });
  }
};

// 8. GET STAFF BY ID
exports.getStaffById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'Staff member not found.' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// 9. GET ALL STAFF
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['mechanic', 'staff', 'admin'] } }).select('-password');
    res.json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// 10. GET ONLY MECHANICS
exports.getMechanics = async (req, res) => {
  try {
    const mechanics = await User.find({ role: 'mechanic' }).select('-password');
    res.json(mechanics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error fetching mechanics.' });
  }
};