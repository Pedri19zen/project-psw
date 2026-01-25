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
        loadBookings(); // Refresh list
      } catch (err) {
        alert("Error cancelling booking.");
      }
    }
  };

  if (loading) return <p>Loading bookings...</p>;

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: 'auto' }}>
      <h1>My Bookings</h1>
      
      <div style={{ display: 'grid', gap: '20px' }}>
        {bookings.length > 0 ? (
          bookings.map(b => (
            <div key={b._id} style={{
              border: '1px solid #e2e8f0',
              padding: '20px',
              borderRadius: '10px',
              backgroundColor: b.status === 'Cancelled' ? '#f1f5f9' : 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '0.8em', 
                  fontWeight: 'bold',
                  backgroundColor: b.status === 'Pending' ? '#fef3c7' : '#dcfce7',
                  color: b.status === 'Pending' ? '#92400e' : '#166534'
                }}>
                  {b.status}
                </span>
                <h3 style={{ margin: '10px 0 5px 0' }}>{b.service.name} - {b.workshop.name}</h3>
                <p style={{ margin: 0 }}><strong>Vehicle:</strong> {b.vehicle.brand} {b.vehicle.model} ({b.vehicle.plate})</p>
                <p style={{ margin: 0 }}><strong>Date:</strong> {b.date} at {b.time}</p>
              </div>

              {b.status === 'Pending' && (
                <button 
                  onClick={() => handleCancel(b._id)}
                  style={{
                    padding: '10px 15px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          ))
        ) : (
          <p>You have no registered bookings.</p>
        )}
      </div>
    </div>
  );
};

export default MyBookings;