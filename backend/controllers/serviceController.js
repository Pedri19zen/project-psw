const Service = require('../models/Service');
const Workshop = require('../models/Workshop');

// 1. Get All Services (Public)
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching services.' });
  }
};

// 2. Create Service (Admin)
exports.createService = async (req, res) => {
  try {
    const { name, type, descriptionPublic, descriptionPrivate, price, duration, authorizedMechanics, workshopId } = req.body;

    // Default to first workshop if ID not provided
    let workshop;
    if (workshopId) {
      workshop = await Workshop.findById(workshopId);
    } else {
      workshop = await Workshop.findOne();
    }

    if (!workshop) {
      return res.status(404).json({ message: 'No workshop found. Please create a workshop in Settings first.' });
    }

    const newService = new Service({
      name, 
      type: type || 'Maintenance',
      descriptionPublic,
      descriptionPrivate,
      price,
      duration: duration || 60, // Default to 60 min
      authorizedMechanics,
      workshop: workshop._id
    });

    const savedService = await newService.save();

    // Link service to workshop
    if (!workshop.services) {
        workshop.services = [];
    }
    workshop.services.push(savedService._id);
    await workshop.save();

    console.log(`Success: Service "${name}" created.`);
    
    res.status(201).json(savedService);

  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: 'Error creating service.', error: error.message });
  }
};

// 3. Update Service (Admin)
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!service) return res.status(404).json({ msg: "Service not found." });
        res.json(service);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};

// 4. Delete Service (Admin)
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ msg: "Service not found." });

        // Remove from Workshop array
        await Workshop.updateOne(
            { _id: service.workshop }, 
            { $pull: { services: service._id } }
        );

        await Service.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Service removed successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};