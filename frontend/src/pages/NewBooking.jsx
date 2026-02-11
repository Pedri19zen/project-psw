import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../services/api';

const NewBooking = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [workshops, setWorkshops] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState('');
  
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resW = await api.get('/workshops');
        const resV = await api.get('/vehicles');
        setWorkshops(resW.data || []);
        setVehicles(resV.data || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedWorkshop || !selectedService) return;
      setLoadingSlots(true);
      try {
        const res = await api.get(`/bookings/available-slots`, {
          params: { 
            workshopId: selectedWorkshop._id, 
            date: selectedDate.toISOString().split('T')[0],
            serviceId: selectedService._id 
          }
        });
        setAvailableSlots(res.data || []);
      } catch (err) {
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    if (step === 2) fetchSlots();
  }, [selectedDate, selectedWorkshop, selectedService, step]);

  const handleFinalBooking = async () => {
    if (!selectedVehicle || !selectedSlot) {
      return alert("Please select a vehicle and a time slot.");
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
      alert("Booking confirmed successfully!");
      navigate('/dashboard'); 
    } catch (err) {
      alert(err.response?.data?.msg || "Error creating booking.");
    }
  };

  const getServicesList = (workshop) => {
    if (!workshop) return [];
    return workshop.services || workshop.servicos || [];
  };

  return (
    <div className="booking-wrapper fade-in" style={{ padding: '20px', backgroundColor: '#0f172a', minHeight: '90vh' }}>
      
      <style>{`
        .react-calendar { width: 100%; border: 1px solid #334155 !important; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-family: sans-serif; background: #1e293b !important; color: #f1f5f9 !important; }
        .react-calendar__navigation button { color: #f1f5f9 !important; background: none !important; font-size: 1.5rem !important; min-width: 44px; }
        .react-calendar__navigation button:enabled:hover, .react-calendar__navigation button:enabled:focus { background-color: #334155 !important; border-radius: 8px; }
        .react-calendar__navigation__label { font-weight: bold; font-size: 1.1rem !important; color: #f1f5f9 !important; }
        .react-calendar__month-view__weekdays { color: #94a3b8 !important; font-weight: bold; text-transform: uppercase; font-size: 0.8rem; text-decoration: none !important; }
        .react-calendar__tile { color: #f1f5f9 !important; font-weight: 500; background: #1e293b !important; }
        .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background-color: #334155 !important; border-radius: 8px; color: #60a5fa !important; }
        .react-calendar__tile--now { background: #854d0e !important; color: #fef08a !important; border-radius: 8px; }
        .react-calendar__tile--active { background: #2563eb !important; color: white !important; border-radius: 8px; }
        .slot-btn { padding: 12px 15px; border-radius: 8px; cursor: pointer; font-weight: 800 !important; min-width: 90px; text-align: center; font-size: 1rem; border: 1px solid #475569 !important; background-color: #334155 !important; color: #f1f5f9 !important; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: all 0.2s; }
        .slot-btn:hover { border-color: #60a5fa !important; background-color: #475569 !important; color: #60a5fa !important; }
        .slot-btn.active { background-color: #2563eb !important; color: white !important; border-color: #2563eb !important; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3); }
      `}</style>

      <div style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', maxWidth: '600px', margin: '20px auto', border: '1px solid #334155' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ width: '35px', height: '35px', borderRadius: '50%', background: step >= i ? '#2563eb' : '#334155', color: step >= i ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: step >= i ? 'none' : '1px solid #475569' }}>{i}</div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h3 style={{ marginBottom: '15px', color: '#f1f5f9' }}>Select Workshop & Service</h3>
            <select 
              onChange={(e) => {
                setSelectedWorkshop(workshops.find(w => w._id === e.target.value));
                setSelectedService(null);
              }} 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #475569', color: '#f1f5f9', background: '#0f172a' }}
            >
              <option value="" disabled selected={!selectedWorkshop}>Select a Workshop...</option>
              {workshops.map(w => <option key={w._id} value={w._id}>{w.nome || w.name}</option>)}
            </select>

            {selectedWorkshop && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {getServicesList(selectedWorkshop).length > 0 ? (
                  getServicesList(selectedWorkshop).map(s => (
                    <div 
                      key={s._id} 
                      onClick={() => setSelectedService(s)} 
                      style={{ 
                        padding: '15px', borderRadius: '12px', cursor: 'pointer',
                        border: selectedService?._id === s._id ? '2px solid #2563eb' : '1px solid #475569', 
                        background: selectedService?._id === s._id ? '#1e3a8a' : '#334155',
                        color: '#f1f5f9'
                      }}
                    >
                      <strong style={{ display: 'block', marginBottom: '5px' }}>{s.name || s.tipo}</strong>
                      <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{s.price || s.preco}€</span>
                      <br/>
                      <small style={{ color: '#94a3b8' }}>⏱️ {s.duration || 60} min</small>
                    </div>
                  ))
                ) : (
                  <p style={{ gridColumn: '1 / -1', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>
                      This workshop has no services configured.
                  </p>
                )}
              </div>
            )}
            
            <button disabled={!selectedService} onClick={() => setStep(2)} style={{ width: '100%', padding: '12px', marginTop: '20px', borderRadius: '8px', border: 'none', background: selectedService ? '#2563eb' : '#475569', color: selectedService ? 'white' : '#94a3b8', cursor: selectedService ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>Next Step</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ marginBottom: '15px', color: '#f1f5f9' }}>Select Vehicle & Time</h3>
            
            {vehicles.length === 0 ? (
              <div style={{ padding: '20px', background: '#450a0a', border: '1px solid #991b1b', borderRadius: '8px', color: '#fca5a5', marginBottom: '20px', textAlign: 'center' }}>
                <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>No vehicles found.</p>
                <button onClick={() => navigate('/veiculos')} style={{ padding: '10px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Add Vehicle Now</button>
              </div>
            ) : (
              <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #475569', color: '#f1f5f9', background: '#0f172a' }}>
                <option value="">Select your car...</option>
                {vehicles.map(v => <option key={v._id} value={v._id}>{v.brand} {v.model} ({v.plate})</option>)}
              </select>
            )}

            <div style={{ opacity: vehicles.length === 0 ? 0.5 : 1, pointerEvents: vehicles.length === 0 ? 'none' : 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                  <Calendar onChange={setSelectedDate} value={selectedDate} minDate={new Date()} />
                </div>

                <h4 style={{ color: '#f1f5f9', marginBottom: '10px' }}>Available Slots ({selectedService?.duration || 60} min):</h4>
                {loadingSlots ? <p style={{color: '#94a3b8'}}>Loading slots...</p> : (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {availableSlots.length > 0 ? availableSlots.map(slot => (
                      <button key={slot} onClick={() => setSelectedSlot(slot)} className={`slot-btn ${selectedSlot === slot ? 'active' : ''}`}>
                        {slot}
                      </button>
                    )) : <p style={{ color: '#fca5a5' }}>No slots available for this date.</p>}
                  </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#334155', color: '#f1f5f9', fontWeight: 'bold', cursor: 'pointer' }}>Back</button>
              <button disabled={!selectedVehicle || !selectedSlot} onClick={() => setStep(3)} style={{ flex: 1, padding: '12px', background: (selectedVehicle && selectedSlot) ? '#2563eb' : '#475569', color: (selectedVehicle && selectedSlot) ? 'white' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: (selectedVehicle && selectedSlot) ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>Review</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '20px', color: '#f1f5f9' }}>Confirm Booking</h3>
            <div style={{ textAlign: 'left', background: '#0f172a', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #334155' }}>
              <p style={{marginBottom: '8px', color: '#cbd5e1'}}><strong>Workshop:</strong> {selectedWorkshop?.nome || selectedWorkshop?.name}</p>
              <p style={{marginBottom: '8px', color: '#cbd5e1'}}><strong>Service:</strong> {selectedService?.tipo || selectedService?.name} ({selectedService?.duration}m)</p>
              <p style={{marginBottom: '8px', color: '#cbd5e1'}}><strong>Vehicle:</strong> {vehicles.find(v => v._id === selectedVehicle)?.brand} ({vehicles.find(v => v._id === selectedVehicle)?.plate})</p>
              <p style={{marginBottom: '8px', color: '#cbd5e1'}}><strong>Date:</strong> {selectedDate.toLocaleDateString()}</p>
              <p style={{marginBottom: '0px', color: '#cbd5e1'}}><strong>Time:</strong> {selectedSlot}</p>
            </div>
            
            <button 
              onClick={handleFinalBooking} 
              style={{ width: '100%', padding: '15px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1em' }}
            >
              Confirm & Schedule
            </button>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              
              <button 
                onClick={() => setStep(2)} 
                style={{ flex: 1, padding: '15px', background: '#475569', color: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Go Back
              </button>

              <button 
                onClick={() => navigate('/dashboard')} 
                style={{ flex: 1, padding: '15px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancel
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewBooking;