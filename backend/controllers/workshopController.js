const Workshop = require('../models/Workshop');
const Service = require('../models/Service');

// --- PUBLIC FUNCTIONS ---

// 1. List all workshops (SMART SELF-HEALING VERSION)
exports.getPublicWorkshops = async (req, res) => {
  try {
    // A. Fetch workshops with .lean() to get plain JavaScript objects we can modify
    const workshops = await Workshop.find()
      .populate('services')
      .populate('staff')
      .lean(); 

    // B. "Self-Healing" Logic
    // If a workshop appears empty, we manually double-check the Service collection
    for (let workshop of workshops) {
      if (!workshop.services || workshop.services.length === 0) {
        // Look for services that point to this workshop ID
        const foundServices = await Service.find({ workshop: workshop._id }).lean();
        
        if (foundServices.length > 0) {
           console.log(`🔧 Auto-Fixed: Found ${foundServices.length} orphaned services for ${workshop.name}`);
           workshop.services = foundServices;
        }
      }
    }
      
    res.json(workshops);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// 2. Get details of a specific workshop
exports.getWorkshopDetails = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id)
      .populate('services')
      .populate('staff')
      .lean();
    
    if (!workshop) {
      return res.status(404).json({ msg: 'Oficina não encontrada' });
    }

    // Manual fallback for details page too
    let services = workshop.services;
    if (!services || services.length === 0) {
       services = await Service.find({ workshop: req.params.id }).lean();
       workshop.services = services;
    }
    
    res.json({ workshop, services });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Oficina não encontrada' });
    }
    res.status(500).send('Erro no servidor');
  }
};

// --- ADMIN FUNCTIONS ---

// 3. Create Workshop 
exports.createWorkshop = async (req, res) => {
  try {
    const newWorkshop = new Workshop(req.body);
    const saved = await newWorkshop.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ message: 'Error creating workshop', error });
  }
};

// 4. Get Config (Admin Dashboard)
exports.getWorkshopConfig = async (req, res) => {
  try {
    const workshop = await Workshop.findOne()
      .populate('services')
      .populate('staff');

    if (!workshop) return res.json(null); 
    
    res.json(workshop);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching config', error });
  }
};

// 5. Update General Info
exports.updateWorkshop = async (req, res) => {
  try {
    const { name, location, contact } = req.body;
    const updatedWorkshop = await Workshop.findByIdAndUpdate(
      req.params.id,
      { name, location, contact },
      { new: true }
    );
    res.json(updatedWorkshop);
  } catch (error) {
    res.status(500).json({ message: 'Error updating workshop', error });
  }
};

// 6. Update Shifts
exports.updateShifts = async (req, res) => {
  try {
    const { shifts } = req.body;
    
    if (!shifts || !Array.isArray(shifts)) {
      return res.status(400).json({ message: 'Invalid shifts format' });
    }

    const updatedWorkshop = await Workshop.findByIdAndUpdate(
      req.params.id,
      { shifts },
      { new: true }
    );
    res.json(updatedWorkshop);
  } catch (error) {
    res.status(500).json({ message: 'Error updating shifts', error });
  }
};