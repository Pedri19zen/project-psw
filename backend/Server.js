require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// Importação dos Models (Necessário para criar as contas automáticas)
const User = require('./models/User'); 

// Import route handlers
const workshopRoutes = require('./routes/workshopRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const staffRoutes = require('./routes/staffRoutes');
const authRoutes = require('./routes/auth'); 

const app = express();

app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/workshops', require('./routes/workshops'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use(cors());
app.use(express.json());

// --- FUNÇÃO PARA CRIAR CONTAS PREDEFINIDAS ---
const seedUsers = async () => {
  try {
    // 1. Criar ADMIN (Controlo Total)
    const adminExists = await User.findOne({ email: 'admin@repro.com' });
    if (!adminExists) {
      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      await new User({
        name: 'Administrador Repro',
        email: 'admin@repro.com',
        password: hashedAdminPassword,
        role: 'Admin'
      }).save();
      console.log('✅ Conta ADMIN pronta: admin@repro.com / admin123');
    }

    // 2. Criar STAFF (Funcionário)
    const staffExists = await User.findOne({ email: 'staff@repro.com' });
    if (!staffExists) {
      const hashedStaffPassword = await bcrypt.hash('staff123', 10);
      await new User({
        name: 'Técnico Repro',
        email: 'staff@repro.com',
        password: hashedStaffPassword,
        role: 'Staff'
      }).save();
      console.log('✅ Conta STAFF pronta: staff@repro.com / staff123');
    }
  } catch (err) {
    console.error('❌ Erro ao criar contas automáticas:', err);
  }
};

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Server connected to MongoDB Atlas');
    seedUsers(); // Chama a criação das contas após ligar à BD
  })
  .catch((err) => console.error('Server DB connection error:', err));

// Register Routes
app.use('/api/workshops', workshopRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/auth', authRoutes); 

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});