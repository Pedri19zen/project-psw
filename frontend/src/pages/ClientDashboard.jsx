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
        console.error("Error loading history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getStatusBadge = (status) => {
    // Matches your English Backend Enums
    const styles = {
      'Completed': { bg: '#d1fae5', text: '#065f46' },
      'In Progress': { bg: '#dbeafe', text: '#1e40af' },
      'Pending': { bg: '#fef3c7', text: '#92400e' },
      'Confirmed': { bg: '#dcfce7', text: '#15803d' },
      'Cancelled': { bg: '#fee2e2', text: '#b91c1c' }
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

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading history...</div>;

  return (
    <div className="fade-in" style={{ padding: '40px', maxWidth: '1000px', margin: 'auto' }}>
      <h2 style={{ marginBottom: '30px' }}>My Interventions</h2>
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Service</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map(b => (
                <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '15px' }}>
                    {/* Format the date to English (GB for DD/MM/YYYY) */}
                    {new Date(b.date).toLocaleDateString('en-GB')} at {b.time}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <strong style={{ display: 'block', color: '#1e293b' }}>
                        {b.service?.name || 'Service undefined'}
                    </strong>
                    <small style={{ color: '#64748b' }}>
                        {b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model} (${b.vehicle.plate})` : 'Vehicle undefined'}
                    </small>
                  </td>
                  <td style={{ padding: '15px' }}>{getStatusBadge(b.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
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