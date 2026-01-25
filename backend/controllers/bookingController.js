const Booking = require('../models/Booking');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Service = require('../models/Service');
const Workshop = require('../models/Workshop');
const mongoose = require('mongoose');

const getUserId = (user) => (user?._id || user?.id || user?.userId);

// ✅ HELPER: Add minutes to "HH:mm"
const addMinutes = (time, minutes) => {
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toTimeString().slice(0, 5);
};

// ✅ HELPER: Check overlap
const isOverlapping = (startA, endA, startB, endB) => {
  return startA < endB && startB < endA;
};

// 1. Get ALL Bookings (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('client', 'name email')
      .populate('vehicle', 'brand model plate')
      .populate('service', 'name price duration')
      .populate('workshop', 'name')
      .populate('mechanic', 'name')
      .sort({ date: -1, time: -1 });

    console.log(`Admin: Found ${bookings.length} total bookings.`);
    res.json(bookings);
  } catch (error) {
    console.error("Admin Fetch Error:", error.message);
    res.status(500).json({ msg: 'Error loading bookings.' });
  }
};

// 2. Create a New Booking (Duration Aware)
exports.createBooking = async (req, res) => {
  try {
    const { workshopId, serviceId, vehicleId, date, time } = req.body;
    const userId = getUserId(req.user);

    if (!userId) return res.status(401).json({ msg: 'User not authenticated.' });

    // Validation
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ msg: 'Vehicle not found.' });
    if (vehicle.owner.toString() !== userId.toString()) {
      return res.status(403).json({ msg: 'Access denied: You do not own this vehicle.' });
    }

    // Get Service Duration
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ msg: 'Service not found.' });

    const duration = service.duration || 60;
    const endTime = addMinutes(time, duration);

    // Find Mechanics
    const mechanics = await User.find({ role: 'mechanic', workshop: workshopId });
    if (mechanics.length === 0) return res.status(400).json({ msg: 'No mechanics available in this workshop.' });

    // Find Conflicting Bookings
    const conflictingBookings = await Booking.find({
      workshop: workshopId,
      date: date,
      status: { $ne: 'Cancelled' }, // English status
      $or: [
        { time: { $lt: endTime }, endTime: { $gt: time } }
      ]
    });

    const busyIds = conflictingBookings.map(b => b.mechanic?.toString());
    const availableMechanic = mechanics.find(m => !busyIds.includes(m._id.toString()));

    if (!availableMechanic) {
      return res.status(400).json({ msg: `No vacancy for a ${duration} min service at this time.` });
    }

    const newBooking = new Booking({
      client: userId,
      workshop: workshopId,
      service: serviceId,
      vehicle: vehicleId,
      mechanic: availableMechanic._id,
      date,
      time,
      endTime, // ✅ Saved for overlap checks
      status: 'Pending' // English status
    });

    const savedBooking = await newBooking.save();
    console.log(`Booking Created: ${savedBooking._id}`);
    res.status(201).json(savedBooking);

  } catch (error) {
    console.error("createBooking Error:", error.message);
    res.status(500).json({ msg: 'Error creating booking.', error: error.message });
  }
};

// 3. Get Client History
exports.getClientHistory = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    if (!userId) return res.status(401).json({ msg: 'Unauthorized.' });

    const bookings = await Booking.find({ client: new mongoose.Types.ObjectId(userId) })
      .populate('vehicle', 'brand model plate')
      .populate('service', 'name price')
      .populate('workshop', 'name location')
      .populate('mechanic', 'name')
      .sort({ date: -1 });

    console.log(`Found ${bookings.length} bookings for user ${userId}`);
    res.json(bookings);
  } catch (error) {
    console.error("History Error:", error.message);
    res.status(500).json({ msg: 'Error fetching history.' });
  }
};

// 4. Get Available Slots (Duration Aware)
exports.getAvailableSlots = async (req, res) => {
  try {
    const { workshopId, date, serviceId } = req.query;
    if (!workshopId || !date) return res.status(400).json([]);

    // 1. Get Duration
    let duration = 60;
    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (service && service.duration) duration = service.duration;
    }

    // 2. Get Workshop Shifts
    const workshop = await Workshop.findById(workshopId);
    if (!workshop || !workshop.shifts || workshop.shifts.length === 0) {
      return res.json([]); 
    }

    // 3. Generate Base Start Times
    let possibleStarts = [];
    workshop.shifts.forEach(shift => {
      let current = parseInt(shift.startTime.split(':')[0]);
      const end = parseInt(shift.endTime.split(':')[0]);
      while (current < end) {
        possibleStarts.push(`${current.toString().padStart(2, '0')}:00`);
        current++;
      }
    });

    // 4. Get Mechanics & Bookings
    const mechanics = await User.find({ role: 'mechanic', workshop: workshopId });
    if (mechanics.length === 0) return res.json([]); 

    const bookings = await Booking.find({
      workshop: workshopId,
      date: date,
      status: { $ne: 'Cancelled' }
    });

    // 5. Filter Slots based on Duration Overlap
    const availableSlots = possibleStarts.filter(startTime => {
      const requestedEndTime = addMinutes(startTime, duration);

      // Which mechanics are busy during this specific window?
      const busyMechanics = bookings.filter(b => {
        return isOverlapping(b.time, b.endTime, startTime, requestedEndTime);
      }).map(b => b.mechanic.toString());

      // Are there any free mechanics?
      const freeMechanicCount = mechanics.length - new Set(busyMechanics).size;
      return freeMechanicCount > 0;
    });

    res.json(availableSlots);

  } catch (error) {
    console.error("Slots Error:", error);
    res.json([]);
  }
};

// 5. Update Booking Status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status.' });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('client service vehicle');

    if (!booking) return res.status(404).json({ msg: 'Booking not found.' });

    console.log(`Status updated to: ${status} for Booking ${id}`);
    res.json(booking);
  } catch (error) {
    res.status(500).json({ msg: 'Error updating status.' });
  }
};