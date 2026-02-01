require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Workshop = require('./models/Workshop');
const Service = require('./models/Service');
const Booking = require('./models/Booking');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://reproauto.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/workshops', require('./routes/workshopRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/staff', require('./routes/staff'));

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
      console.log('Account ADMIN ready');
    }
  } catch (err) {
    console.error('Error seeding users:', err);
  }
};

const repairDatabase = async () => {
  try {
    const workshop = await Workshop.findOne();
    if (!workshop) {
      console.log("REPAIR SKIPPED: No workshop found.");
      return;
    }

    await Service.updateMany({ workshop: null }, { workshop: workshop._id });
    
    await User.updateMany({ role: 'mechanic', workshop: null }, { workshop: workshop._id });

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
        await Booking.updateOne({ _id: b._id }, { status: statusMap[b.status] });
        migratedCount++;
      }
    }

    if (migratedCount > 0) {
      console.log(`MIGRATION: Translated ${migratedCount} bookings to English.`);
    } else {
      console.log("Database Check: All bookings are in English.");
    }

  } catch (err) {
    console.error("Repair Failed:", err);
  }
};

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Server connected to MongoDB Atlas');
    await seedUsers(); 
    await repairDatabase(); 
  })
  .catch((err) => console.error('Server DB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});