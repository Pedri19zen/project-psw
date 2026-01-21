const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client("250749350765-8nnv7dfbr3bv1o891hqqhnnhomfo6i2j.apps.googleusercontent.com");
// Use the .env file, but fall back to the hardcoded one if .env is missing
const JWT_SECRET = process.env.JWT_SECRET || "segredo_jwt";

// --- LOGIN NORMAL (Admin, Staff e Cliente) ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Procurar o utilizador pelo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Utilizador não encontrado" });
    }

    // 2. Se o utilizador não tiver password (criado via Google), deve usar o Google Login
    if (!user.password) {
      return res.status(400).json({ msg: "Conta criada via Google. Use o Login do Google." });
    }

    // 3. Comparar passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Password incorreta" });
    }

    // 4. Criar Token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      role: user.role,
      name: user.name
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Erro no servidor ao fazer login" });
  }
});

// --- REGISTO NORMAL ---
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "Este email já está registado." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword, role: 'Cliente' });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: user.role, name: user.name });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Erro no servidor ao registar." });
  }
});

// --- LOGIN GOOGLE ---
router.post('/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "250749350765-8nnv7dfbr3bv1o891hqqhnnhomfo6i2j.apps.googleusercontent.com",
    });
    const { name, email } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, role: 'Cliente' });
      await user.save();
    }

    const appToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token: appToken, role: user.role, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: "Token do Google inválido" });
  }
});

module.exports = router;