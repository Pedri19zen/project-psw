import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api, { getVehicles } from '../services/api';

const NewBooking = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Estados de Dados
  const [workshops, setWorkshops] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  // Estados de Seleção
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState('');
  
  // Estados de UI
  const [loadingSlots, setLoadingSlots] = useState(false);

  // 1. Carregar Oficinas e Veículos ao montar o componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resW = await api.get('/workshops');
        const dataV = await getVehicles(); // Usando a função exportada do seu api.js
        setWorkshops(resW.data || []);
        setVehicles(dataV || []);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    };
    fetchData();
  }, []);

  // 2. Buscar horários (slots) sempre que a data ou oficina mudar
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedWorkshop) return;
      setLoadingSlots(true);
      try {
        const res = await api.get(`/bookings/available-slots`, {
          params: { 
            workshopId: selectedWorkshop._id, 
            date: selectedDate.toISOString().split('T')[0] 
          }
        });
        setAvailableSlots(res.data || []);
      } catch (err) {
        console.error("Erro ao buscar horários:", err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    if (step === 2) fetchSlots();
  }, [selectedDate, selectedWorkshop, step]);

  const handleFinalBooking = async () => {
    if (!selectedVehicle || !selectedSlot) {
      return alert("Por favor, selecione um veículo e um horário.");
    }

    try {
      const bookingData = {
        workshopId: selectedWorkshop._id,
        serviceId: selectedService._id,
        vehicleId: selectedVehicle,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedSlot
      };

      await api.post('/bookings', bookingData);
      alert("Marcação efetuada com sucesso!");
      navigate('/dashboard'); // Ou a rota de suas marcações
    } catch (err) {
      alert(err.response?.data?.msg || "Erro ao efetuar marcação.");
    }
  };

  // Estilos (Mantidos do seu código original)
  const cardStyle = { 
    background: 'white', padding: '30px', borderRadius: '12px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '600px', margin: '40px auto' 
  };
  const slotButtonStyle = (slot) => ({
    padding: '10px 15px', border: '1px solid #2563eb', borderRadius: '6px', cursor: 'pointer',
    backgroundColor: selectedSlot === slot ? '#2563eb' : 'white',
    color: selectedSlot === slot ? 'white' : '#2563eb',
    fontWeight: 'bold'
  });

  return (
    <div className="fade-in" style={{ padding: '20px' }}>
      <div style={cardStyle}>
        {/* Indicador de Passos */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ 
              width: '30px', height: '30px', borderRadius: '50%', 
              background: step >= i ? '#2563eb' : '#cbd5e1', 
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
            }}>{i}</div>
          ))}
        </div>

        {/* PASSO 1: Oficina e Serviço */}
        {step === 1 && (
          <div>
            <h3 style={{ marginBottom: '15px' }}>Selecione a Oficina e o Serviço</h3>
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
                width: '100%', padding: '12px', marginTop: '20px', borderRadius: '8px', border: 'none',
                background: selectedService ? '#2563eb' : '#94a3b8', color: 'white', cursor: 'pointer' 
              }}
            >Próximo</button>
          </div>
        )}

        {/* PASSO 2: Veículo, Data e Horário */}
        {step === 2 && (
          <div>
            <h3 style={{ marginBottom: '15px' }}>Escolha o Veículo e Horário</h3>
            <select 
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)} 
              style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd' }}
            >
              <option value="">Selecione o seu carro...</option>
              {vehicles.map(v => <option key={v._id} value={v._id}>{v.brand} {v.model} ({v.plate})</option>)}
            </select>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <Calendar onChange={setSelectedDate} value={selectedDate} minDate={new Date()} />
            </div>

            <h4>Horários Disponíveis:</h4>
            {loadingSlots ? <p>A carregar horários...</p> : (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                {availableSlots.length > 0 ? availableSlots.map(slot => (
                  <button key={slot} onClick={() => setSelectedSlot(slot)} style={slotButtonStyle(slot)}>
                    {slot}
                  </button>
                )) : <p style={{ color: 'red' }}>Sem vagas para este dia.</p>}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}>Voltar</button>
              <button 
                disabled={!selectedVehicle || !selectedSlot} 
                onClick={() => setStep(3)} 
                style={{ flex: 1, padding: '12px', background: (selectedVehicle && selectedSlot) ? '#2563eb' : '#94a3b8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >Resumo</button>
            </div>
          </div>
        )}

        {/* PASSO 3: Confirmação Final */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '20px' }}>Confirmar Marcação</h3>
            <div style={{ textAlign: 'left', background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <p><strong>Oficina:</strong> {selectedWorkshop?.nome || selectedWorkshop?.name}</p>
              <p><strong>Serviço:</strong> {selectedService?.tipo || selectedService?.name}</p>
              <p><strong>Veículo:</strong> {vehicles.find(v => v._id === selectedVehicle)?.brand} ({selectedSlot})</p>
              <p><strong>Data:</strong> {selectedDate.toLocaleDateString()}</p>
              <p><strong>Hora:</strong> {selectedSlot}</p>
            </div>
            <button 
              onClick={handleFinalBooking} 
              style={{ width: '100%', padding: '15px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1em' }}
            >Confirmar e Agendar</button>
            <button onClick={() => setStep(2)} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}>
              Alterar data ou horário
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewBooking;