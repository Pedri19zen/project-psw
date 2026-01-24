import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ClientDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await api.get('/bookings/my-history');
        
        // Ensure res.data is an array
        setBookings(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getStatusBadge = (status) => {
    // Matches your Portuguese Model Enums
    const styles = {
      'Concluído': { bg: '#d1fae5', text: '#065f46' },
      'Em Progresso': { bg: '#dbeafe', text: '#1e40af' },
      'Pendente': { bg: '#fef3c7', text: '#92400e' },
      'Confirmado': { bg: '#dcfce7', text: '#15803d' },
      'Cancelado': { bg: '#fee2e2', text: '#b91c1c' }
    };
    const current = styles[status] || { bg: '#f1f5f9', text: '#475569' };
    return (
      <span style={{ 
        padding: '6px 12px', 
        borderRadius: '20px', 
        fontSize: '12px', 
        fontWeight: 'bold', 
        background: current.bg, 
        color: current.text 
      }}>
        {status}
      </span>
    );
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando histórico...</div>;

  return (
    <div className="fade-in" style={{ padding: '40px', maxWidth: '1000px', margin: 'auto' }}>
      <h2 style={{ marginBottom: '30px' }}>As Minhas Intervenções</h2>
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left' }}>Data</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Serviço</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map(b => (
                <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '15px' }}>
                    {/* Format the date correctly */}
                    {new Date(b.date).toLocaleDateString('pt-PT')} às {b.time}
                  </td>
                  <td style={{ padding: '15px' }}>
                    {/* FIXED: Changed serviceId to service and added safe navigation */}
                    <strong style={{ display: 'block', color: '#1e293b' }}>
                        {b.service?.name || 'Serviço não definido'}
                    </strong>
                    {/* FIXED: Changed vehicleId to vehicle */}
                    <small style={{ color: '#64748b' }}>
                        {b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model} (${b.vehicle.plate})` : 'Veículo não definido'}
                    </small>
                  </td>
                  <td style={{ padding: '15px' }}>{getStatusBadge(b.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  Ainda não tem marcações registadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientDashboard;