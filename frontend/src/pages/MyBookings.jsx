import React, { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking } from '../services/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(id);
        loadBookings();
      } catch (err) {
        alert("Error cancelling booking.");
      }
    }
  };

  const getBadgeStyles = (status) => {
    const map = {
      'Pending': { bg: '#78350f', text: '#fcd34d' },
      'Cancelled': { bg: '#450a0a', text: '#fca5a5' },
      'Confirmed': { bg: '#14532d', text: '#86efac' },
      'Completed': { bg: '#064e3b', text: '#6ee7b7' }
    };
    return map[status] || { bg: '#334155', text: '#cbd5e1' };
  };

  if (loading) return <p style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading bookings...</p>;

  return (
    <div className="fade-in" style={{ padding: '40px', maxWidth: '1000px', margin: 'auto' }}>
      <h1 style={{ color: '#f1f5f9', marginBottom: '30px' }}>My Bookings</h1>
      
      <div style={{ display: 'grid', gap: '20px' }}>
        {bookings.length > 0 ? (
          bookings.map(b => {
            const badge = getBadgeStyles(b.status);
            return (
              <div key={b._id} style={{
                border: '1px solid #334155',
                padding: '25px',
                borderRadius: '12px',
                backgroundColor: b.status === 'Cancelled' ? '#0f172a' : '#1e293b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
                opacity: b.status === 'Cancelled' ? 0.6 : 1
              }}>
                <div>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    backgroundColor: badge.bg,
                    color: badge.text,
                    border: `1px solid ${badge.bg}`
                  }}>
                    {b.status}
                  </span>
                  <h3 style={{ margin: '15px 0 8px 0', color: '#f1f5f9' }}>{b.service.name} - {b.workshop.name}</h3>
                  <p style={{ margin: '4px 0', color: '#cbd5e1' }}><strong>Vehicle:</strong> {b.vehicle.brand} {b.vehicle.model} ({b.vehicle.plate})</p>
                  <p style={{ margin: '4px 0', color: '#94a3b8', fontSize: '0.9rem' }}><strong>Date:</strong> {new Date(b.date).toLocaleDateString('en-GB')} at {b.time}</p>
                </div>

                {b.status === 'Pending' && (
                  <button 
                    onClick={() => handleCancel(b._id)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#991b1b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#ef4444'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#991b1b'}
                  >
                    Cancel
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <p style={{ color: '#94a3b8', textAlign: 'center' }}>You have no registered bookings.</p>
        )}
      </div>
    </div>
  );
};

export default MyBookings;