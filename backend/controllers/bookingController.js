const Booking = require('../models/Booking');

// @desc    Criar uma nova marcação
exports.createBooking = async (req, res) => {
  const { vehicle, workshop, service, date, time } = req.body;

  try {
    // 1. Validar se o utilizador já tem outra marcação no mesmo horário
    const existingBooking = await Booking.findOne({ 
      client: req.user.id, 
      date, 
      time,
      status: { $ne: 'Cancelado' }
    });

    if (existingBooking) {
      return res.status(400).json({ msg: 'Já tem uma marcação para este horário.' });
    }

    // 2. Criar a marcação
    const newBooking = new Booking({
      client: req.user.id,
      vehicle,
      workshop,
      service,
      date,
      time
    });

    const booking = await newBooking.save();
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao criar agendamento');
  }
};

// @desc    Obter marcações do cliente logado
exports.getMyBookings = async (req, res) => {
  try {
    // O populate transforma os IDs em objetos com a informação real das outras coleções
    const bookings = await Booking.find({ client: req.user.id })
      .populate('vehicle', 'brand model plate')
      .populate('workshop', 'name location')
      .populate('service', 'name price')
      .sort({ date: -1 }); // Mostrar as mais recentes primeiro

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro ao obter marcações');
  }
};

// @desc    Cancelar uma marcação (Mudar status para 'Cancelado')
exports.cancelBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ msg: 'Marcação não encontrada' });
    }

    // Verificar se a marcação pertence ao utilizador logado
    if (booking.client.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }

    // Em vez de apagar, mudamos o status para manter histórico
    booking.status = 'Cancelado';
    await booking.save();
    
    res.json({ msg: 'Marcação cancelada com sucesso' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro ao cancelar marcação');
  }
};