import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.clear(); // Limpa token e role
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'var(--primary)',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: 'var(--shadow)',
      color: 'white'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '1px' }}>
         REPRO<span style={{ fontWeight: '300' }}>AUTO</span>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {token ? (
          <>
            <Link to="/dashboard" style={linkStyle}>Histórico</Link>
            <Link to="/veiculos" style={linkStyle}>Meus Veículos</Link>
            <Link to="/agendar" style={{ 
              ...linkStyle, 
              background: 'rgba(255,255,255,0.2)', 
              padding: '8px 15px', 
              borderRadius: '8px' 
            }}>Nova Marcação</Link>
            
            <button 
              onClick={handleLogout}
              style={{
                background: 'var(--danger)',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '8px',
                fontWeight: 'bold',
                marginLeft: '10px'
              }}
            >
              Sair
            </button>
          </>
        ) : (
          <Link to="/login" style={linkStyle}>Login / Entrar</Link>
        )}
      </div>
    </nav>
  );
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'opacity 0.2s'
};

export default Navbar;