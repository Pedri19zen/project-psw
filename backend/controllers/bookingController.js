const Booking = require('../models/Booking');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Service = require('../models/Service');
const mongoose = require('mongoose');

// Helper to handle req.user._id vs req.user.id
const getUserId = (user) => (user?._id || user?.id || user?.userId);

// 1. Get ALL bookings for Admin/Staff
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('client', 'name email')
      .populate('vehicle', 'brand model plate')
      .populate('service', 'name price')
      .populate('workshop', 'name')
      .populate('mechanic', 'name')
      .sort({ date: -1, time: -1 });

    console.log(`📊 Admin: Found ${bookings.length} total bookings.`);
    res.json(bookings);
  } catch (error) {
    console.error("Admin Fetch Error:", error.message);
    res.status(500).json({ msg: 'Erro ao carregar todas as marcações.' });
  }
};

// 2. Create a New Booking
exports.createBooking = async (req, res) => {
  try {
    const { workshopId, serviceId, vehicleId, date, time } = req.body;
    const userId = getUserId(req.user);

    if (!userId) {
      return res.status(401).json({ msg: 'Utilizador não autenticado.' });
    }

    // Ownership & Existence Check
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ msg: 'Veículo não encontrado.' });
    }

    // Security: Ensure user owns the car
    if (vehicle.owner.toString() !== userId.toString()) {
      return res.status(403).json({ msg: 'Acesso negado: Este veículo não lhe pertence.' });
    }

    // Auto-Assign Mechanic
    const mechanics = await User.find({ role: 'mechanic', workshop: workshopId });
    if (mechanics.length === 0) {
      return res.status(400).json({ msg: 'Não existem mecânicos disponíveis nesta oficina.' });
    }

    const busyBookings = await Booking.find({
      workshop: workshopId,
      date: date,
      time: time,
      status: { $ne: 'Cancelado' }
    });

    const busyIds = busyBookings.map(b => b.mechanic?.toString());
    const availableMechanic = mechanics.find(m => !busyIds.includes(m._id.toString()));

    if (!availableMechanic) {
      return res.status(400).json({ msg: 'Não há vagas disponíveis para o horário selecionado.' });
    }

    const newBooking = new Booking({
      client: userId,
      workshop: workshopId,
      service: serviceId,
      vehicle: vehicleId,
      mechanic: availableMechanic._id,
      date,
      time,
      status: 'Pendente' 
    });

    const savedBooking = await newBooking.save();
    console.log(`Booking Created: ${savedBooking._id}`);
    res.status(201).json(savedBooking);

  } catch (error) {
    console.error("createBooking Error:", error.message);
    res.status(500).json({ msg: 'Erro ao criar marcação.', error: error.message });
  }
};

// 3. Get Client History
exports.getClientHistory = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    if (!userId) return res.status(401).json({ msg: 'Não autorizado' });

    const bookings = await Booking.find({ client: new mongoose.Types.ObjectId(userId) })
      .populate('vehicle', 'brand model plate')
      .populate('service', 'name price')
      .populate('workshop', 'name location')
      .populate('mechanic', 'name')
      .sort({ date: -1 });

    console.log(`📋 Found ${bookings.length} bookings for user ${userId}`);
    res.json(bookings);
  } catch (error) {
    console.error("History Error:", error.message);
    res.status(500).json({ msg: 'Erro ao buscar histórico.' });
  }
};

// 4. Get Available Slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const { workshopId, date } = req.query;
    if (!workshopId || !date) return res.status(400).json([]);

    const allSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
    const mechanicCount = await User.countDocuments({ role: 'mechanic', workshop: workshopId });
    
    if (mechanicCount === 0) return res.json([]); 

    const dayBookings = await Booking.find({
      workshop: workshopId,
      date: date,
      status: { $ne: 'Cancelado' }
    });

    const availableSlots = allSlots.filter(slot => {
      const bookingsAtTime = dayBookings.filter(b => b.time === slot).length;
      return bookingsAtTime < mechanicCount;
    });

    res.json(availableSlots);
  } catch (error) {
    console.error("Slots Error:", error);
    res.json([]);
  }
};

// @desc    Update Booking Status (Accept/Decline/Complete)
// @route   PATCH /api/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // Validate the status matches your Portuguese enum
    const validStatuses = ['Pendente', 'Confirmado', 'Em Progresso', 'Concluído', 'Cancelado'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Estado inválido.' });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('client service vehicle');

    if (!booking) return res.status(404).json({ msg: 'Marcação não encontrada.' });

    console.log(`✅ Status updated to: ${status} for Booking ${id}`);
    res.json(booking);
  } catch (error) {
    res.status(500).json({ msg: 'Erro ao atualizar estado.' });
  }
};