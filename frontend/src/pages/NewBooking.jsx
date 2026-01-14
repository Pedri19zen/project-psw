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

  useEffect(() => {
    const fetchData = async () => {
      const resW = await api.get('/workshops');
      const resV = await api.get('/vehicles/my-vehicles');
      setWorkshops(resW.data);
      setVehicles(resV.data);
    };
    fetchData();
  }, []);

  const handleBooking = async () => {
    try {
      await api.post('/bookings', { workshopId: selectedWorkshop._id, serviceId: selectedService._id, vehicleId: selectedVehicle, date });
      alert("Agendado com sucesso!");
      setStep(1);
    } catch (err) { alert("Erro ao agendar."); }
  };

  const cardStyle = { background: 'var(--card-bg)', padding: '30px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', maxWidth: '600px', margin: '40px auto' };

  return (
    <div className="fade-in" style={{ padding: '20px' }}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
          {[1,2,3].map(i => <div key={i} style={{ width: '30px', height: '30px', borderRadius: '50%', background: step >= i ? 'var(--primary)' : '#cbd5e1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i}</div>)}
        </div>

        {step === 1 && (
          <div>
            <h3>Selecione a Oficina e o Serviço</h3>
            <select onChange={(e) => setSelectedWorkshop(workshops.find(w => w._id === e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
              <option value="">Escolha a Oficina...</option>
              {workshops.map(w => <option key={w._id} value={w._id}>{w.nome}</option>)}
            </select>
            {selectedWorkshop && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {selectedWorkshop.servicos.map(s => (
                  <div key={s._id} onClick={() => setSelectedService(s)} style={{ padding: '15px', borderRadius: '12px', border: selectedService?._id === s._id ? '2px solid var(--primary)' : '1px solid #eee', cursor: 'pointer', background: selectedService?._id === s._id ? '#eff6ff' : 'white' }}>
                    <strong>{s.tipo}</strong><br/>{s.preco}€
                  </div>
                ))}
              </div>
            )}
            <button disabled={!selectedService} onClick={() => setStep(2)} style={{ width: '100%', padding: '12px', marginTop: '20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px' }}>Próximo</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3>Veículo e Data</h3>
            <select onChange={(e) => setSelectedVehicle(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px' }}>
              <option value="">Selecione o seu carro...</option>
              {vehicles.map(v => <option key={v._id} value={v._id}>{v.brand} ({v.plate})</option>)}
            </select>
            <Calendar onChange={setDate} value={date} minDate={new Date()} className="custom-calendar" />
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', borderRadius: '8px' }}>Voltar</button>
              <button disabled={!selectedVehicle} onClick={() => setStep(3)} style={{ flex: 1, padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px' }}>Resumo</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <h3>Confirmar Marcação</h3>
            <p><strong>{selectedService?.tipo}</strong> na <strong>{selectedWorkshop?.nome}</strong></p>
            <p>Data: {date.toLocaleDateString()}</p>
            <button onClick={handleBooking} style={{ width: '100%', padding: '15px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Finalizar</button>
            <button onClick={() => setStep(2)} style={{ marginTop: '10px', background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}>Alterar detalhes</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewBooking;