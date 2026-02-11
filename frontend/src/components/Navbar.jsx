import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/login');
  };

  const styles = {
    nav: {
      background: '#1e293b',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      borderBottom: '1px solid #334155',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    },
    logo: {
      textDecoration: 'none',
      fontSize: '1.5rem',
      letterSpacing: '-0.5px',
      color: '#f1f5f9'
    },
    logoAccent: {
      color: '#3b82f6',
      fontWeight: '800'
    },
    logoText: {
      fontWeight: '400'
    },
    linksContainer: {
      display: 'flex',
      gap: '20px',
      alignItems: 'center'
    },
    link: {
      color: '#cbd5e1',
      textDecoration: 'none',
      fontSize: '0.95rem',
      fontWeight: '500',
      transition: 'color 0.2s'
    },
    primaryBtn: {
      background: '#2563eb',
      color: 'white',
      textDecoration: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '0.9rem',
      transition: 'background 0.2s'
    },
    logoutBtn: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '0.9rem',
      cursor: 'pointer',
      marginLeft: '10px'
    }
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        <span style={styles.logoAccent}>REPRO</span>
        <span style={styles.logoText}>AUTO</span>
      </Link>

      <div style={styles.linksContainer}>
        {token ? (
          <>
            <Link to="/workshops" style={styles.link}>Workshops</Link>
            <Link to="/veiculos" style={styles.link}>My Vehicles</Link>
            <Link to="/dashboard" style={styles.link}>History</Link>
            
            <Link to="/agendar" style={styles.primaryBtn}>+ New Booking</Link>
            
            <button 
              onClick={handleLogout}
              style={styles.logoutBtn}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" style={styles.primaryBtn}>Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;