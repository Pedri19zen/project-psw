require('dotenv').config(); // Load environment variables first
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import route handlers
const workshopRoutes = require('./routes/workshopRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const staffRoutes = require('./routes/staffRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Server connected to MongoDB Atlas'))
  .catch((err) => console.error('Server DB connection error:', err));

// Register Routes
app.use('/api/workshops', workshopRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/staff', staffRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});