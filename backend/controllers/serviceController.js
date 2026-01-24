const Service = require('../models/Service');
const Workshop = require('../models/Workshop');

// 1. Get All Services (Public)
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching services' });
  }
};

// 2. Create Service AND Link to Workshop (CRITICAL FIX)
exports.createService = async (req, res) => {
  try {
    const { name, description, price, duration, workshopId } = req.body;

    // A. Find the workshop to attach this service to
    // If no ID is sent, we default to the first workshop found (Single Workshop Mode)
    let workshop;
    if (workshopId) {
      workshop = await Workshop.findById(workshopId);
    } else {
      workshop = await Workshop.findOne();
    }

    if (!workshop) {
      return res.status(404).json({ message: 'No workshop found. Please create a workshop first.' });
    }

    // B. Create the Service in the Services Collection
    const newService = new Service({
      name, 
      description,
      price,
      duration,
      workshop: workshop._id // Link field
    });

    const savedService = await newService.save();

    // C. THE FIX: Push the new Service ID into the Workshop's "services" array
    // This connects the two so .populate('services') works in the controller
    if (!workshop.services) {
        workshop.services = [];
    }
    workshop.services.push(savedService._id);
    await workshop.save();

    console.log(`✅ Success: Service "${name}" created and linked to Workshop "${workshop.name}"`);
    
    res.status(201).json(savedService);

  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: 'Error creating service', error: error.message });
  }
};

// 3. Update Service
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!service) return res.status(404).json({ msg: "Service not found" });
        res.json(service);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};

// 4. Delete Service
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ msg: "Service not found" });

        // Optional: Remove from Workshop array too
        await Workshop.updateOne(
            { _id: service.workshop }, 
            { $pull: { services: service._id } }
        );

        await Service.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Service removed' });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};