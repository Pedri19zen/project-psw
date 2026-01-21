import React from 'react';

const VehicleCard = ({ vehicle }) => {
  return (
    <div className="vehicle-card" style={{
      background: 'var(--card-bg)',
      padding: '20px',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow)',
      borderLeft: '6px solid var(--primary)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}
    // Efeito interativo de levantar o card ao passar o rato
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'var(--shadow)';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: 0, color: 'var(--text-dark)', fontSize: '1.2rem' }}>
          {vehicle.brand} {vehicle.model}
        </h3>
        <span style={{ 
          background: '#e2e8f0', 
          padding: '4px 10px', 
          borderRadius: '6px', 
          fontFamily: 'monospace',
          fontWeight: 'bold',
          color: 'var(--primary)'
        }}>
          {vehicle.plate}
        </span>
      </div>
      
      <div style={{ borderTop: '1px solid #eee', pt: '10px', marginTop: '5px' }}>
        <p style={{ margin: '8px 0 0 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>
          <strong>Ano:</strong> {vehicle.year}
        </p>
      </div>
    </div>
  );
};

export default VehicleCard;