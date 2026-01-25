require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// MODELS
const User = require('./models/User'); 
const Workshop = require('./models/Workshop');
const Service = require('./models/Service');
const Booking = require('./models/Booking'); // ✅ Added Booking Model

const app = express();
app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use('/api/auth', require('./routes/auth')); 
app.use('/api/workshops', require('./routes/workshopRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookings')); 
app.use('/api/vehicles', require('./routes/vehicles')); 
app.use('/api/staff', require('./routes/staff')); 

// --- 1. SEED USERS ---
const seedUsers = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@repro.com' });
    if (!adminExists) {
      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      await new User({
        name: 'Administrador Repro',
        email: 'admin@repro.com',
        password: hashedAdminPassword,
        role: 'admin'
      }).save();
      console.log('✅ Account ADMIN ready');
    }
  } catch (err) {
    console.error('Error seeding users:', err);
  }
};

// --- 2. REPAIR & MIGRATE DATABASE ---
const repairDatabase = async () => {
  try {
    const workshop = await Workshop.findOne();
    if (!workshop) {
      console.log("⚠️ REPAIR SKIPPED: No workshop found.");
      return;
    }

    // A. Fix Services (Orphans)
    await Service.updateMany({ workshop: null }, { workshop: workshop._id });
    
    // B. Fix Mechanics (Link to Workshop)
    await User.updateMany({ role: 'mechanic', workshop: null }, { workshop: workshop._id });

    // C. MIGRATE BOOKING STATUSES (PT -> EN) [THE FIX]
    const bookings = await Booking.find({});
    let migratedCount = 0;

    const statusMap = {
      'Pendente': 'Pending',
      'Confirmado': 'Confirmed',
      'Em Progresso': 'In Progress',
      'Concluído': 'Completed',
      'Cancelado': 'Cancelled'
    };

    for (const b of bookings) {
      if (statusMap[b.status]) {
        // We use updateOne here to bypass Mongoose enum validation checks during the transition
        await Booking.updateOne({ _id: b._id }, { status: statusMap[b.status] });
        migratedCount++;
      }
    }

    if (migratedCount > 0) {
      console.log(`🇺🇸 MIGRATION: Translated ${migratedCount} bookings to English.`);
    } else {
      console.log("✅ Database Check: All bookings are in English.");
    }

  } catch (err) {
    console.error("❌ Repair Failed:", err);
  }
};

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Server connected to MongoDB Atlas');
    await seedUsers(); 
    await repairDatabase(); 
  })
  .catch((err) => console.error('Server DB connection error:', err));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});