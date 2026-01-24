require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// MODELS (Required for the Repair Script)
const User = require('./models/User'); 
const Workshop = require('./models/Workshop');
const Service = require('./models/Service');

// ROUTES
const workshopRoutes = require('./routes/workshopRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const staffRoutes = require('./routes/staffRoutes');
const authRoutes = require('./routes/auth'); 
const bookingRoutes = require('./routes/bookings'); 
const vehicleRoutes = require('./routes/vehicles'); 

const app = express();
app.use(cors());
app.use(express.json());

// USE ROUTES
app.use('/api/auth', authRoutes); 
app.use('/api/workshops', workshopRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/vehicles', vehicleRoutes);

// --- 1. SEED USERS (Admin/Staff) ---
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

// --- 2. REPAIR DATABASE (The Fix for your "No Services" bug) ---
const repairDatabase = async () => {
  try {
    // A. Find the main workshop
    const workshop = await Workshop.findOne();
    if (!workshop) {
      console.log("⚠️ REPAIR SKIPPED: No workshop found. Please create one in Admin Panel.");
      return;
    }

    // B. Find ALL services
    const services = await Service.find();
    if (services.length === 0) return;

    // C. Check if they are orphans (missing workshop link)
    const orphans = services.filter(s => !s.workshop || s.workshop.toString() !== workshop._id.toString());

    if (orphans.length > 0) {
      console.log(`🔧 REPAIRING: Linking ${orphans.length} orphaned services to "${workshop.name}"...`);
      
      // 1. Update all services to point to this workshop
      await Service.updateMany({}, { workshop: workshop._id });
      
      // 2. Update workshop to include all service IDs
      const allServiceIds = services.map(s => s._id);
      workshop.services = allServiceIds;
      await workshop.save();
      
      console.log("✅ REPAIR COMPLETE: All services are now visible!");
    } else {
      console.log("✅ Database Integrity Check: OK (Services are properly linked)");
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
    await repairDatabase(); // <--- RUNS THE FIX ON STARTUP
  })
  .catch((err) => console.error('Server DB connection error:', err));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});