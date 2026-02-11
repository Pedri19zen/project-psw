import React from 'react';

const VehicleCard = ({ vehicle }) => {
  return (
    <div 
      style={{
        background: '#1e293b',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
        border: '1px solid #334155',
        borderLeft: '6px solid #2563eb',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        color: '#f1f5f9'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.7)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.5)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.2rem' }}>
          {vehicle.brand} {vehicle.model}
        </h3>
        <span style={{ 
          background: '#0f172a', 
          padding: '4px 10px', 
          borderRadius: '6px', 
          fontFamily: 'monospace',
          fontWeight: 'bold',
          color: '#60a5fa',
          border: '1px solid #334155'
        }}>
          {vehicle.plate}
        </span>
      </div>
      
      <div style={{ borderTop: '1px solid #334155', paddingTop: '10px', marginTop: '5px' }}>
        <p style={{ margin: '8px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
          <strong>Year:</strong> {vehicle.year}
        </p>
      </div>
    </div>
  );
};

export default VehicleCard;