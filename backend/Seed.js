require('dotenv').config(); 

const mongoose = require('mongoose');
const Workshop = require('./models/Workshop');
const User = require('./models/User');
const Service = require('./models/Service');

const MONGO_URI = process.env.MONGO_URI; 

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected to Cloud!'))
  .catch(err => console.log('Connection Error:', err));

const seedData = async () => {
  try {
    console.log('Clearing old data...');
    await Workshop.deleteMany({});
    await User.deleteMany({});
    await Service.deleteMany({});

    console.log('Creating Workshop...');
    const workshop = await Workshop.create({
      name: "Oficina Central Viseu",
      location: "Rua do Politécnico, Viseu",
      contact: "232 000 000",
      shifts: [
        { name: "Morning", startTime: "09:00", endTime: "13:00", slotsPerShift: 3 },
        { name: "Afternoon", startTime: "14:00", endTime: "18:00", slotsPerShift: 3 }
      ]
    });

    console.log('Creating Mechanics...');
    // Creating mechanics immediately so you have staff to assign in your UI
    const mechanic1 = await User.create({
      name: "João Mecânico",
      email: "joao@oficina.pt",
      password: "123", 
      role: "mechanic",
      workshop: workshop._id
    });

    const mechanic2 = await User.create({
      name: "Martim Técnico",
      email: "martim@oficina.pt",
      password: "123",
      role: "mechanic",
      workshop: workshop._id
    });

    // Link staff to workshop
    workshop.staff.push(mechanic1._id, mechanic2._id);
    await workshop.save();

    console.log('Database Seeded Successfully! You are ready to build.');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();