const Booking = require('../models/Booking');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Service = require('../models/Service');
const Workshop = require('../models/Workshop');
const mongoose = require('mongoose');

const getUserId = (user) => (user?._id || user?.id || user?.userId);

const addMinutes = (time, minutes) => {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60);
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
};

const isOverlapping = (startA, endA, startB, endB) => {
  return startA < endB && startB < endA;
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('client', 'name email')
      .populate('vehicle', 'brand model plate')
      .populate('service', 'name price duration')
      .populate('workshop', 'name')
      .populate('mechanic', 'name')
      .sort({ date: -1, time: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ msg: 'Error loading bookings.' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { workshopId, serviceId, vehicleId, date, time } = req.body;
    const userId = getUserId(req.user);

    if (!userId) return res.status(401).json({ msg: 'User not authenticated.' });

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ msg: 'Vehicle not found.' });
    if (vehicle.owner.toString() !== userId.toString()) {
      return res.status(403).json({ msg: 'Access denied: You do not own this vehicle.' });
    }

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ msg: 'Service not found.' });

    const duration = service.duration || 60;
    const endTime = addMinutes(time, duration);

    const mechanics = await User.find({ role: 'mechanic', workshop: workshopId });
    if (mechanics.length === 0) return res.status(400).json({ msg: 'No mechanics available in this workshop.' });

    const conflictingBookings = await Booking.find({
      workshop: workshopId,
      date: date,
      status: { $ne: 'Cancelled' },
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
      endTime,
      status: 'Pending'
    });

    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);

  } catch (error) {
    res.status(500).json({ msg: 'Error creating booking.', error: error.message });
  }
};

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

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ msg: 'Error fetching history.' });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { workshopId, date, serviceId } = req.query;
    if (!workshopId || !date) return res.status(400).json([]);

    let duration = 60;
    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (service && service.duration) duration = service.duration;
    }

    const workshop = await Workshop.findById(workshopId);
    if (!workshop || !workshop.shifts || workshop.shifts.length === 0) {
      return res.json([]); 
    }

    let possibleStarts = [];
    workshop.shifts.forEach(shift => {
      let current = parseInt(shift.startTime.split(':')[0]);
      const end = parseInt(shift.endTime.split(':')[0]);
      while (current < end) {
        possibleStarts.push(`${current.toString().padStart(2, '0')}:00`);
        current++;
      }
    });

    const mechanics = await User.find({ role: 'mechanic', workshop: workshopId });
    if (mechanics.length === 0) return res.json([]); 

    const bookings = await Booking.find({
      workshop: workshopId,
      date: date,
      status: { $ne: 'Cancelled' }
    });

    let availableSlots = possibleStarts.filter(startTime => {
      const requestedEndTime = addMinutes(startTime, duration);

      const busyMechanics = bookings.filter(b => {
        return isOverlapping(b.time, b.endTime, startTime, requestedEndTime);
      }).map(b => b.mechanic.toString());

      const freeMechanicCount = mechanics.length - new Set(busyMechanics).size;
      return freeMechanicCount > 0;
    });

    const now = new Date();

    const portugalDateFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Lisbon',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const portugalDateString = portugalDateFormatter.format(now);

    if (date < portugalDateString) {
      return res.json([]);
    }

    if (date === portugalDateString) {
      const portugalHourFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Lisbon',
        hour: 'numeric',
        hour12: false
      });
      
      const currentHour = parseInt(portugalHourFormatter.format(now));

      availableSlots = availableSlots.filter(slot => {
        const [slotHour] = slot.split(':').map(Number);
        if (slotHour >= currentHour) return true;
        return false;
      });
    }

    res.json(availableSlots);

  } catch (error) {
    console.error(error);
    res.json([]);
  }
};

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

    res.json(booking);
  } catch (error) {
    res.status(500).json({ msg: 'Error updating status.' });
  }
};