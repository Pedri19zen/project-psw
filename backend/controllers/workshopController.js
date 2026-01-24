const Workshop = require('../models/Workshop');
const Service = require('../models/Service');

// Listar todas as oficinas (apenas info básica)
exports.getPublicWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.find().select('name location contact address');
    res.json(workshops);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Obter detalhes de uma oficina e os seus serviços
exports.getWorkshopDetails = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ msg: 'Oficina não encontrada' });
    }

    // Buscar os serviços associados a esta oficina
    // Assumindo que o Modelo Service tem um campo 'workshop' ou que Workshop tem array de services
    const services = await Service.find({ workshop: req.params.id });

    res.json({ workshop, services });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Oficina não encontrada' });
    }
    res.status(500).send('Erro no servidor');
  }
};