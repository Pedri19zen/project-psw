import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ClientDashboard = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    const res = await api.get('/bookings/my-history');
    setBookings(res.data);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Concluída': { bg: '#d1fae5', text: '#065f46' },
      'Em curso': { bg: '#dbeafe', text: '#1e40af' },
      'Pendente': { bg: '#fef3c7', text: '#92400e' }
    };
    const current = styles[status] || { bg: '#f1f5f9', text: '#475569' };
    return <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: current.bg, color: current.text }}>{status}</span>;
  };

  return (
    <div className="fade-in" style={{ padding: '40px', maxWidth: '1000px', margin: 'auto' }}>
      <h2 style={{ marginBottom: '30px' }}>As Minhas Intervenções</h2>
      <div style={{ background: 'white', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left' }}>Data</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Serviço</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px' }}>{new Date(b.date).toLocaleDateString()}</td>
                <td style={{ padding: '15px' }}><strong>{b.serviceId?.tipo}</strong><br/><small>{b.vehicleId?.brand}</small></td>
                <td style={{ padding: '15px' }}>{getStatusBadge(b.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientDashboard;