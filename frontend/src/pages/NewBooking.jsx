import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../services/api';

const NewBooking = () => {
  const [step, setStep] = useState(1);
  const [workshops, setWorkshops] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [date, setDate] = useState(new Date());

  // Carregar dados iniciais com tratamento de erro
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resW = await api.get('/workshops');
        const resV = await api.get('/vehicles/my-vehicles');
        setWorkshops(resW.data || []);
        setVehicles(resV.data || []);
      } catch (error) {
        // Usamos o 'error' aqui para o compilador não reclamar
        console.error("Erro ao carregar dados:", error);
      }
    };
    fetchData();
  }, []);

  const handleBooking = async () => {
    try {
      await api.post('/bookings', { 
        workshopId: selectedWorkshop._id, 
        serviceId: selectedService._id, 
        vehicleId: selectedVehicle, 
        date 
      });
      alert("Agendado com sucesso!");
      setStep(1);
    } catch (err) { 
      // Usamos o 'err' no log para evitar o erro de "assigned but never used"
      console.error("Erro técnico:", err);
      alert("Erro ao agendar."); 
    }
  };

  const cardStyle = { 
    background: 'white', 
    padding: '30px', 
    borderRadius: '12px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
    maxWidth: '600px', 
    margin: '40px auto' 
  };

  return (
    <div className="fade-in" style={{ padding: '20px' }}>
      <div style={cardStyle}>
        {/* Indicador de Passos */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ 
              width: '30px', height: '30px', borderRadius: '50%', 
              background: step >= i ? '#2563eb' : '#cbd5e1', 
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {i}
            </div>
          ))}
        </div>

        {/* PASSO 1: Seleção de Oficina e Serviço */}
        {step === 1 && (
          <div>
            <h3>Selecione a Oficina e o Serviço</h3>
            <select 
              onChange={(e) => setSelectedWorkshop(workshops.find(w => w._id === e.target.value))} 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}
            >
              <option value="">Escolha a Oficina...</option>
              {workshops.map(w => <option key={w._id} value={w._id}>{w.nome || w.name}</option>)}
            </select>

            {selectedWorkshop && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {(selectedWorkshop.servicos || []).map(s => (
                  <div 
                    key={s._id} 
                    onClick={() => setSelectedService(s)} 
                    style={{ 
                      padding: '15px', borderRadius: '12px', cursor: 'pointer',
                      border: selectedService?._id === s._id ? '2px solid #2563eb' : '1px solid #eee', 
                      background: selectedService?._id === s._id ? '#eff6ff' : 'white' 
                    }}
                  >
                    <strong>{s.tipo || s.name}</strong><br/>{s.preco || s.price}€
                  </div>
                ))}
              </div>
            )}
            <button 
              disabled={!selectedService} 
              onClick={() => setStep(2)} 
              style={{ 
                width: '100%', padding: '12px', marginTop: '20px', 
                background: selectedService ? '#2563eb' : '#94a3b8', 
                color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' 
              }}
            >
              Próximo
            </button>
          </div>
        )}

        {/* PASSO 2: Veículo e Data */}
        {step === 2 && (
          <div>
            <h3>Veículo e Data</h3>
            <select 
              onChange={(e) => setSelectedVehicle(e.target.value)} 
              style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd' }}
            >
              <option value="">Selecione o seu carro...</option>
              {vehicles.map(v => <option key={v._id} value={v._id}>{v.brand} ({v.plate})</option>)}
            </select>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Calendar onChange={setDate} value={date} minDate={new Date()} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}>Voltar</button>
              <button 
                disabled={!selectedVehicle} 
                onClick={() => setStep(3)} 
                style={{ flex: 1, padding: '12px', background: selectedVehicle ? '#2563eb' : '#94a3b8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Resumo
              </button>
            </div>
          </div>
        )}

        {/* PASSO 3: Confirmação Final */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <h3>Confirmar Marcação</h3>
            <div style={{ textAlign: 'left', background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <p><strong>Serviço:</strong> {selectedService?.tipo || selectedService?.name}</p>
              <p><strong>Oficina:</strong> {selectedWorkshop?.nome || selectedWorkshop?.name}</p>
              <p><strong>Data:</strong> {date.toLocaleDateString()}</p>
            </div>
            <button 
              onClick={handleBooking} 
              style={{ width: '100%', padding: '15px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Finalizar
            </button>
            <button onClick={() => setStep(2)} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}>
              Alterar detalhes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewBooking;