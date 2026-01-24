const Vehicle = require('../models/Vehicle');

// Obter todos os veículos do utilizador autenticado
exports.getMyVehicles = async (req, res) => {
  try {
    // Assume-se que o middleware de auth coloca o user em req.user
    const vehicles = await Vehicle.find({ owner: req.user.id });
    res.json(vehicles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Adicionar um novo veículo
exports.addVehicle = async (req, res) => {
  const { brand, model, plate, year } = req.body;

  try {
    // Verificar se a matrícula já existe
    let vehicle = await Vehicle.findOne({ plate });
    if (vehicle) {
      return res.status(400).json({ msg: 'Veículo com esta matrícula já existe' });
    }

    vehicle = new Vehicle({
      owner: req.user.id,
      brand,
      model,
      plate,
      year
    });

    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Eliminar veículo (Opcional mas recomendado para gestão completa)
exports.deleteVehicle = async (req, res) => {
    try {
        let vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ msg: 'Veículo não encontrado' });

        // Garantir que o utilizador é o dono
        if (vehicle.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Não autorizado' });
        }

        await Vehicle.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Veículo removido' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
};