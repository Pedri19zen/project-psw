const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');
const Workshop = require('../models/Workshop');
const Vehicle = require('../models/Vehicle');

const getUserId = (user) => (user?._id || user?.id || user?.userId);

// HELPER: Add minutes to "HH:mm"
const addMinutes = (time, minutes) => {
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toTimeString().slice(0, 5);
};

// HELPER: Check overlap
const isOverlapping = (startA, endA, startB, endB) => {
  return startA < endB && startB < endA;
};

// 1. Get Available Slots (Duration Aware)
exports.getAvailableSlots = async (req, res) => {
  try {
    const { workshopId, date, serviceId } = req.query;
    if (!workshopId || !date) return res.status(400).json([]);

    // Get Duration from Service
    let duration = 60;
    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (service && service.duration) duration = service.duration;
    }

    // Get Workshop Hours
    const workshop = await Workshop.findById(workshopId);
    if (!workshop || !workshop.shifts) return res.json([]);

    // Generate All Possible Start Times
    let possibleStarts = [];
    workshop.shifts.forEach(shift => {
      let current = parseInt(shift.startTime.split(':')[0]);
      const end = parseInt(shift.endTime.split(':')[0]);
      while (current < end) {
        possibleStarts.push(`${current.toString().padStart(2, '0')}:00`);
        current++;
      }
    });

    // Get Mechanics and Bookings
    const mechanics = await User.find({ role: 'mechanic', workshop: workshopId });
    const bookings = await Booking.find({
      workshop: workshopId,
      date: date,
      status: { $ne: 'Cancelado' }
    });

    // Filter Slots
    const validSlots = possibleStarts.filter(startTime => {
      const requestedEndTime = addMinutes(startTime, duration);

      // Identify mechanics busy during this specific time block
      const busyMechanics = bookings.filter(b => {
        return isOverlapping(b.time, b.endTime, startTime, requestedEndTime);
      }).map(b => b.mechanic.toString());

      // Are there any mechanics NOT in the busy list?
      const freeMechanicCount = mechanics.length - new Set(busyMechanics).size;
      return freeMechanicCount > 0;
    });

    res.json(validSlots);

  } catch (error) {
    console.error("Slots Error:", error);
    res.json([]);
  }
};

// 2. Create Booking
exports.createBooking = async (req, res) => {
  try {
    const { workshopId, serviceId, vehicleId, date, time } = req.body;
    const userId = getUserId(req.user);

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ msg: 'Service not found.' });

    const duration = service.duration || 60;
    const endTime = addMinutes(time, duration);

    const mechanics = await User.find({ role: 'mechanic', workshop: workshopId });
    if (mechanics.length === 0) return res.status(400).json({ msg: 'No mechanics available.' });

    // Find Conflicting Bookings
    const conflictingBookings = await Booking.find({
      workshop: workshopId,
      date: date,
      status: { $ne: 'Cancelado' },
      $or: [
        { time: { $lt: endTime }, endTime: { $gt: time } }
      ]
    });

    const busyMechanicIds = conflictingBookings.map(b => b.mechanic.toString());
    const availableMechanic = mechanics.find(m => !busyMechanicIds.includes(m._id.toString()));

    if (!availableMechanic) {
      return res.status(400).json({ msg: 'No vacancy for this duration.' });
    }

    const newBooking = new Booking({
      client: userId,
      workshop: workshopId,
      service: serviceId,
      vehicle: vehicleId,
      mechanic: availableMechanic._id,
      date,
      time,
      endTime, // Save End Time
      status: 'Pendente'
    });

    await newBooking.save();
    res.status(201).json(newBooking);

  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ msg: 'Error creating booking.' });
  }
};

// 3. Get All Bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('client', 'name email')
      .populate('vehicle', 'brand model plate')
      .populate('service', 'name price duration')
      .populate('mechanic', 'name')
      .sort({ date: -1, time: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching bookings.' });
  }
};

// 4. Get Client History
exports.getClientHistory = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const bookings = await Booking.find({ client: userId })
      .populate('vehicle', 'brand model plate')
      .populate('service', 'name price duration')
      .populate('mechanic', 'name')
      .sort({ date: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching history.' });
  }
};

// 5. Update Status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ msg: 'Error updating status.' });
  }
};