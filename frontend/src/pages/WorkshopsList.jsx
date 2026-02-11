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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading workshops...</p>;

  return (
    <div className="fade-in" style={{ padding: '40px', maxWidth: '1200px', margin: 'auto' }}>
      <h1 style={{ color: '#f1f5f9' }}>Our Workshops</h1>
      <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Select a workshop to see available services.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {workshops.map(ws => (
          <div key={ws._id} style={{
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
            backgroundColor: '#1e293b',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s',
            color: '#f1f5f9'
          }}>
            <div>
              <h2 style={{ marginTop: 0, color: '#f1f5f9' }}>{ws.name}</h2>
              <p style={{ color: '#cbd5e1', marginBottom: '8px' }}>📍 {ws.location || ws.address}</p>
              <p style={{ color: '#94a3b8', fontSize: '0.9em' }}>📞 {ws.contact}</p>
            </div>
            
            <Link to={`/workshops/${ws._id}`} style={{
              marginTop: '20px',
              display: 'block',
              textAlign: 'center',
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '12px 15px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              transition: 'background 0.2s'
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