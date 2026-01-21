import React, { useState, useEffect } from 'react';
import VehicleCard from '../components/VehicleCard';
import api from '../services/api';

const MyVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ brand: '', model: '', plate: '', year: '' });
  const [loading, setLoading] = useState(true);

  // 1. Carregar veículos com tratamento de erro detalhado
  const loadVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vehicles/my-vehicles');
      
      // Verifica se res.data existe e é uma lista
      if (res.data && Array.isArray(res.data)) {
        setVehicles(res.data);
      } else {
        setVehicles([]);
      }
    } catch (err) {
      console.error("Erro ao carregar veículos:", err.response?.data || err.message);
      // Se der erro 401, o utilizador pode ter perdido a sessão
      if (err.response?.status === 401) {
        alert("Sessão expirada. Por favor, faça login novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Garante que o ano é um número
      const vehicleData = { ...form, year: Number(form.year) };
      
      await api.post('/vehicles', vehicleData);
      setForm({ brand: '', model: '', plate: '', year: '' });
      
      alert("Veículo registado com sucesso!");
      loadVehicles(); // Recarrega a lista após sucesso
    } catch (err) {
      console.error("Erro ao registar:", err);
      alert(err.response?.data?.msg || "Erro ao registar veículo.");
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: 'auto' }} className="fade-in">
      <h1>A Minha Garagem</h1>
      
      {/* Formulário Estilizado */}
      <form onSubmit={handleSubmit} style={{ 
        marginBottom: '30px', 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ marginTop: 0 }}>Registar Novo Veículo</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            placeholder="Marca (ex: BMW)" 
            value={form.brand} 
            onChange={e => setForm({...form, brand: e.target.value})} 
            required 
            style={inputStyle} 
          />
          <input 
            placeholder="Modelo (ex: Serie 1)" 
            value={form.model} 
            onChange={e => setForm({...form, model: e.target.value})} 
            required 
            style={inputStyle} 
          />
          <input 
            placeholder="Matrícula" 
            value={form.plate} 
            onChange={e => setForm({...form, plate: e.target.value})} 
            required 
            style={inputStyle} 
          />
          <input 
            type="number" 
            placeholder="Ano" 
            value={form.year} 
            onChange={e => setForm({...form, year: e.target.value})} 
            required 
            style={inputStyle} 
          />
          <button type="submit" style={buttonStyle}>Adicionar Carro</button>
        </div>
      </form>

      {/* Listagem com estado de Loading */}
      {loading ? (
        <p>A carregar os seus veículos...</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '20px' 
        }}>
          {vehicles.length > 0 ? (
            vehicles.map(v => (
              <VehicleCard key={v._id} vehicle={v} />
            ))
          ) : (
            <p style={{ color: '#64748b' }}>Ainda não tem veículos registados na sua garagem.</p>
          )}
        </div>
      )}
    </div>
  );
};

// Estilos rápidos
const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', flex: '1', minWidth: '150px' };
const buttonStyle = { padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

export default MyVehicles;