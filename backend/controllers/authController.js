const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Your Google Client ID
const client = new OAuth2Client("250749350765-8nnv7dfbr3bv1o891hqqhnnhomfo6i2j.apps.googleusercontent.com");

// Secret (matches your .env or fallback)
const JWT_SECRET = process.env.JWT_SECRET || "segredo_jwt";

// 1. REGISTER (Default: client)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "Este email já está registado." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: 'client' // FIX: Must be lowercase to match User Model Enum
    });
    
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    // Explicitly send role back
    res.json({ token, role: user.role, name: user.name });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Erro no servidor ao registar." });
  }
};

// 2. LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Utilizador não encontrado" });

    // Google Account Check
    if (!user.password) {
      return res.status(400).json({ msg: "Conta criada via Google. Use o Login do Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Password incorreta" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    // CRITICAL: Send role back so frontend knows where to redirect
    res.json({
      token,
      role: user.role, 
      name: user.name
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Erro no servidor ao fazer login" });
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
      // Create new user if not exists
      user = new User({ 
        name, 
        email, 
        role: 'client' // FIX: Lowercase
        // Note: No password field for Google users
      });
      await user.save();
    }

    const appToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ token: appToken, role: user.role, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Token do Google inválido" });
  }
};

// 4. GET CURRENT USER (Optional helper)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Erro no servidor');
  }
};