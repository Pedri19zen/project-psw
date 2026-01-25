require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// MODELS
const User = require('./models/User'); 
const Workshop = require('./models/Workshop');
const Service = require('./models/Service');

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
      console.log(' Account ADMIN ready');
    }
  } catch (err) {
    console.error('Error seeding users:', err);
  }
};

// --- 2. REPAIR DATABASE (Services & Mechanics) ---
const repairDatabase = async () => {
  try {
    // A. Find the main workshop
    const workshop = await Workshop.findOne();
    if (!workshop) {
      console.log(" REPAIR SKIPPED: No workshop found. Please create one in Settings.");
      return;
    }

    // B. Fix Services (Orphans)
    const services = await Service.find();
    if (services.length > 0) {
      const orphanServices = services.filter(s => !s.workshop || s.workshop.toString() !== workshop._id.toString());
      if (orphanServices.length > 0) {
        console.log(`🔧 REPAIR: Linking ${orphanServices.length} services to workshop...`);
        await Service.updateMany({}, { workshop: workshop._id });
        // Update workshop array
        const allServiceIds = await Service.find().distinct('_id');
        workshop.services = allServiceIds;
        await workshop.save();
      }
    }

    //  C. FIX MECHANICS (The "No Shifts" Fix)
    // Find mechanics that don't have a workshop assigned
    const orphanMechanics = await User.find({ role: 'mechanic', workshop: null });
    
    if (orphanMechanics.length > 0) {
      console.log(`👨‍🔧 REPAIR: Linking ${orphanMechanics.length} mechanics to workshop...`);
      // Update all mechanics to belong to the main workshop
      await User.updateMany(
        { role: 'mechanic', workshop: null }, 
        { workshop: workshop._id }
      );
      console.log(" MECHANICS FIXED: Shifts should now appear!");
    } else {
      console.log(" Database Check: All mechanics are properly linked.");
    }

  } catch (err) {
    console.error(" Repair Failed:", err);
  }
};

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Server connected to MongoDB Atlas');
    await seedUsers(); 
    await repairDatabase(); // <--- This will now fix your mechanics!
  })
  .catch((err) => console.error('Server DB connection error:', err));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});