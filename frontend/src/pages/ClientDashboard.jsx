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
        
        setBookings(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      'Completed': { bg: '#064e3b', text: '#6ee7b7' },
      'In Progress': { bg: '#1e3a8a', text: '#93c5fd' },
      'Pending': { bg: '#78350f', text: '#fcd34d' },
      'Confirmed': { bg: '#14532d', text: '#86efac' },
      'Cancelled': { bg: '#7f1d1d', text: '#fca5a5' }
    };
    const current = styles[status] || { bg: '#334155', text: '#cbd5e1' };
    
    return (
      <span style={{ 
        padding: '6px 12px', 
        borderRadius: '20px', 
        fontSize: '12px', 
        fontWeight: 'bold', 
        background: current.bg, 
        color: current.text,
        border: `1px solid ${current.bg}`
      }}>
        {status}
      </span>
    );
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading history...</div>;

  return (
    <div className="fade-in" style={{ padding: '40px', maxWidth: '1000px', margin: 'auto' }}>
      <h2 style={{ marginBottom: '30px', color: '#ffffff', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>My Interventions</h2>
      <div style={{ background: '#1e293b', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)', border: '1px solid #334155', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#0f172a' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', color: '#cbd5e1', borderBottom: '1px solid #334155' }}>Date</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#cbd5e1', borderBottom: '1px solid #334155' }}>Service</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#cbd5e1', borderBottom: '1px solid #334155' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map(b => (
                <tr key={b._id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '15px', color: '#f1f5f9' }}>
                    {new Date(b.date).toLocaleDateString('en-GB')} at {b.time}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <strong style={{ display: 'block', color: '#f1f5f9' }}>
                        {b.service?.name || 'Service undefined'}
                    </strong>
                    <small style={{ color: '#94a3b8' }}>
                        {b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model} (${b.vehicle.plate})` : 'Vehicle undefined'}
                    </small>
                  </td>
                  <td style={{ padding: '15px' }}>{getStatusBadge(b.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                  No bookings found.
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