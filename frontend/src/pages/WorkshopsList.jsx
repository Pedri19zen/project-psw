import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWorkshops } from '../services/api';

const WorkshopsList = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkshops();
  }, []);

  const loadWorkshops = async () => {
    try {
      const data = await getWorkshops();
      setWorkshops(data);
    } catch (err) {
      console.error("Error loading workshops", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading workshops...</p>;

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: 'auto' }}>
      <h1>Our Workshops</h1>
      <p>Select a workshop to see available services.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {workshops.map(ws => (
          <div key={ws._id} style={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <h2 style={{ marginTop: 0 }}>{ws.name}</h2>
              <p style={{ color: '#666' }}>{ws.location || ws.address}</p>
              <p>Contact: {ws.contact}</p>
            </div>
            
            <Link to={`/workshops/${ws._id}`} style={{
              marginTop: '15px',
              display: 'inline-block',
              textAlign: 'center',
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '10px 15px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              View Services
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkshopsList;