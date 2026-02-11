import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const WorkshopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ workshop: null, services: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const result = await api.get(`/workshops/${id}`);
        setData(result.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleBookClick = (serviceId) => {
    navigate(`/book`);
  };

  if (loading) return <p style={{ color: '#94a3b8', padding: '40px', textAlign: 'center' }}>Loading information...</p>;
  if (!data.workshop) return <p style={{ color: '#ef4444', padding: '40px', textAlign: 'center' }}>Workshop not found.</p>;

  return (
    <div className="fade-in" style={{ padding: '40px', maxWidth: '1200px', margin: 'auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          marginBottom: '20px', 
          cursor: 'pointer', 
          padding: '8px 16px', 
          background: '#334155', 
          color: '#f1f5f9', 
          border: '1px solid #475569', 
          borderRadius: '6px',
          fontWeight: '500'
        }}
      >
        &larr; Back
      </button>

      <div style={{ marginBottom: '40px', borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
        <h1 style={{ marginBottom: '10px', color: '#f1f5f9' }}>{data.workshop.nome || data.workshop.name}</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1em' }}>{data.workshop.morada || data.workshop.location}</p>
      </div>

      <h2 style={{ color: '#e2e8f0', marginBottom: '20px' }}>Available Services</h2>
      <div style={{ display: 'grid', gap: '15px' }}>
        {data.services.length > 0 ? (
          data.services.map(service => (
            <div key={service._id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              border: '1px solid #334155',
              borderRadius: '12px',
              backgroundColor: '#1e293b',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{ maxWidth: '70%' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#f1f5f9' }}>{service.name || service.tipo}</h3>
                <p style={{ margin: 0, color: '#cbd5e1' }}>{service.description}</p>
                <div style={{ marginTop: '8px', fontSize: '0.9em', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>⏱️</span> Estimated duration: {service.duration} min
                </div>
              </div>
              
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#60a5fa' }}>
                  {service.price || service.preco} €
                </div>
                <button 
                  onClick={() => handleBookClick(service._id)}
                  style={{
                    backgroundColor: '#16a34a',
                    color: 'white',
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    transition: 'background 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>This workshop has no services configured.</p>
        )}
      </div>
    </div>
  );
};

export default WorkshopDetails;