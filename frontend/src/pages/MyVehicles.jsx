import React, { useState, useEffect } from 'react';
import VehicleCard from '../components/VehicleCard';
import api from '../services/api'; // Importa a ligação que fizeste no Step 3

const MyVehicles = () => {
  // 1. Estados: Onde guardamos a lista de carros e o que escrevemos no formulário
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ brand: '', model: '', plate: '', year: '' });

  // 2. useEffect: Corre assim que abrimos a página para ir buscar os carros à BD
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const res = await api.get('/vehicles/my-vehicles');
      setVehicles(res.data);
    } catch (err) {
      console.error("Erro ao carregar veículos. O backend está ligado?");
    }
  };

  // 3. Função para guardar um carro novo
  const handleSubmit = async (e) => {
    e.preventDefault(); // Impede a página de fazer refresh
    try {
      await api.post('/vehicles', form);
      setForm({ brand: '', model: '', plate: '', year: '' }); // Limpa o formulário
      loadVehicles(); // Atualiza a lista no ecrã
      alert("Veículo registado com sucesso!");
    } catch (err) {
      alert("Erro ao registar veículo.");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>A Minha Garagem</h1>
      
      {/* Formulário de Registo */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', backgroundColor: '#f4f4f4', padding: '15px', borderRadius: '8px' }}>
        <h3>Registar Novo Veículo</h3>
        <input placeholder="Marca" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} required style={{ marginRight: '10px' }} />
        <input placeholder="Modelo" value={form.model} onChange={e => setForm({...form, model: e.target.value})} required style={{ marginRight: '10px' }} />
        <input placeholder="Matrícula" value={form.plate} onChange={e => setForm({...form, plate: e.target.value})} required style={{ marginRight: '10px' }} />
        <input type="number" placeholder="Ano" value={form.year} onChange={e => setForm({...form, year: e.target.value})} required style={{ marginRight: '10px' }} />
        <button type="submit">Adicionar Carro</button>
      </form>

      {/* Listagem de Carros */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
  {vehicles.map(v => (
    <VehicleCard key={v._id} vehicle={v} />
  ))}
</div>
    </div>
  );
};

export default MyVehicles;