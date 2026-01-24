import React, { useState, useEffect } from 'react';
import { getVehicles, addVehicle, deleteVehicle } from '../services/api';

const MyVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    plate: '',
    year: ''
  });
  const [loading, setLoading] = useState(true);

  // Carregar veículos ao iniciar
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      console.error('Erro ao carregar veículos', err);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar estado do formulário
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Enviar formulário
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await addVehicle(formData);
      setFormData({ brand: '', model: '', plate: '', year: '' }); // Limpar form
      alert("Veículo adicionado com sucesso!");
      loadVehicles(); // Recarregar lista
    } catch (err) {
      console.error(err);
      alert('Erro ao adicionar veículo. Verifique se a matrícula já existe.');
    }
  };

  // Remover veículo
  const handleDelete = async (id) => {
    if (window.confirm('Tem a certeza que deseja remover este veículo?')) {
      try {
        await deleteVehicle(id);
        loadVehicles();
      } catch (err) {
        alert("Erro ao remover veículo.");
      }
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: 'auto' }}>
      <h1>A Minha Garagem</h1>
      
      {/* Formulário de Adição */}
      <form onSubmit={onSubmit} style={{ 
        marginBottom: '30px', 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ marginTop: 0 }}>Registar Novo Veículo</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            name="brand" 
            placeholder="Marca (ex: Toyota)" 
            value={formData.brand} 
            onChange={onChange} 
            required 
            style={inputStyle} 
          />
          <input 
            type="text" 
            name="model" 
            placeholder="Modelo (ex: Yaris)" 
            value={formData.model} 
            onChange={onChange} 
            required 
            style={inputStyle} 
          />
          <input 
            type="text" 
            name="plate" 
            placeholder="Matrícula (AA-00-BB)" 
            value={formData.plate} 
            onChange={onChange} 
            required 
            style={inputStyle} 
          />
          <input 
            type="number" 
            name="year" 
            placeholder="Ano" 
            value={formData.year} 
            onChange={onChange} 
            required 
            style={inputStyle} 
          />
          <button type="submit" style={buttonStyle}>Adicionar Veículo</button>
        </div>
      </form>

      {/* Lista de Veículos */}
      {loading ? (
        <p>A carregar os seus veículos...</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '20px' 
        }}>
          {vehicles.length > 0 ? (
            vehicles.map(vehicle => (
              <div key={vehicle._id} style={{
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{vehicle.brand} {vehicle.model}</h3>
                <p style={{ margin: '5px 0', color: '#555' }}><strong>Matrícula:</strong> {vehicle.plate}</p>
                <p style={{ margin: '5px 0', color: '#555' }}><strong>Ano:</strong> {vehicle.year}</p>
                <button 
                  onClick={() => handleDelete(vehicle._id)} 
                  style={{...buttonStyle, backgroundColor: '#ef4444', marginTop: '10px', width: '100%'}}
                >
                  Remover
                </button>
              </div>
            ))
          ) : (
            <p style={{ color: '#64748b' }}>Ainda não tem veículos registados.</p>
          )}
        </div>
      )}
    </div>
  );
};

// Estilos
const inputStyle = { 
  padding: '10px', 
  borderRadius: '8px', 
  border: '1px solid #e2e8f0', 
  flex: '1', 
  minWidth: '150px' 
};

const buttonStyle = { 
  padding: '10px 20px', 
  background: '#2563eb', 
  color: 'white', 
  border: 'none', 
  borderRadius: '8px', 
  cursor: 'pointer', 
  fontWeight: 'bold' 
};

export default MyVehicles;