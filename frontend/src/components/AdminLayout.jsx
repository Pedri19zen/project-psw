import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  // --- DARK MODE INTERNAL STYLES ---
  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      background: '#0f172a' // Darkest Blue
    },
    sidebar: {
      width: '260px',
      background: '#1e293b', // Lighter Dark Blue (Card color)
      color: '#f1f5f9',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      height: '100vh',
      left: 0,
      top: 0,
      zIndex: 10,
      borderRight: '1px solid #334155', // Border for separation
      boxShadow: '4px 0 15px rgba(0,0,0,0.3)'
    },
    logo: {
      padding: '24px',
      fontSize: '1.5rem',
      fontWeight: '900',
      borderBottom: '1px solid #334155',
      letterSpacing: '1px',
      color: '#f1f5f9',
      textAlign: 'center'
    },
    logoSpan: {
      color: '#3b82f6' 
    },
    nav: {
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      flex: 1
    },
    link: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 15px',
      color: '#cbd5e1',
      textDecoration: 'none',
      borderRadius: '8px',
      fontSize: '0.95rem',
      transition: 'background 0.2s, color 0.2s',
      fontWeight: '500'
    },
    divider: {
      marginTop: '20px',
      marginBottom: '10px',
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      color: '#94a3b8',
      fontWeight: 'bold',
      paddingLeft: '15px',
      letterSpacing: '0.5px'
    },
    userProfile: {
      padding: '20px',
      borderTop: '1px solid #334155',
      background: '#1e293b'
    },
    userInfo: {
      marginBottom: '15px'
    },
    userName: {
      fontWeight: '600',
      fontSize: '0.95rem',
      margin: 0,
      color: '#f1f5f9'
    },
    userRole: {
      fontSize: '0.75rem',
      color: '#94a3b8',
      textTransform: 'uppercase',
      marginTop: '4px',
      display: 'inline-block',
      background: '#0f172a',
      padding: '2px 8px',
      borderRadius: '4px'
    },
    logoutBtn: {
      width: '100%',
      padding: '10px',
      background: '#b91c1c', // Darker Red
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '600',
      transition: 'background 0.2s'
    },
    main: {
      marginLeft: '260px', 
      flex: 1,
      background: '#0f172a', // Match body background
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      background: '#1e293b',
      padding: '20px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #334155',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)'
    },
    headerTitle: {
      fontSize: '1.5rem',
      color: '#f1f5f9',
      margin: 0,
      fontWeight: '700'
    },
    date: {
      color: '#94a3b8',
      fontSize: '0.9rem',
      fontWeight: '500'
    },
    content: {
      padding: '40px',
      maxWidth: '1200px',
      width: '100%',
      margin: '0 auto',
      color: '#f1f5f9'
    }
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          REPRO<span style={styles.logoSpan}>AUTO</span>
        </div>
        
        <nav style={styles.nav}>
          <Link 
            to="/admin/dashboard" 
            style={styles.link}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#334155'; e.currentTarget.style.color = '#60a5fa'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}
          >
            <span style={{marginRight: '12px'}}>📊</span> Dashboard
          </Link>
          
          <Link 
            to="/admin/services" 
            style={styles.link}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#334155'; e.currentTarget.style.color = '#60a5fa'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}
          >
            <span style={{marginRight: '12px'}}>🔧</span> Services
          </Link>
          
          {isAdmin && (
            <>
              <div style={styles.divider}>Admin</div>
              <Link 
                to="/admin/staff" 
                style={styles.link}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#334155'; e.currentTarget.style.color = '#60a5fa'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}
              >
                <span style={{marginRight: '12px'}}>👥</span> Manage Staff
              </Link>
              <Link 
                to="/admin/settings" 
                style={styles.link}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#334155'; e.currentTarget.style.color = '#60a5fa'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}
              >
                <span style={{marginRight: '12px'}}>⚙️</span> Settings
              </Link>
            </>
          )}
        </nav>

        <div style={styles.userProfile}>
          <div style={styles.userInfo}>
            <p style={styles.userName}>{user.name || "User"}</p>
            <span style={styles.userRole}>{user.role}</span>
          </div>

          <button 
            onClick={handleLogout} 
            style={styles.logoutBtn}
            onMouseEnter={(e) => e.target.style.background = '#ef4444'}
            onMouseLeave={(e) => e.target.style.background = '#b91c1c'}
          >
            Logout
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>
            {isAdmin ? 'Admin Dashboard' : 'Staff Area'}
          </h1>
          <div style={styles.date}>
            {new Date().toLocaleDateString('en-GB')}
          </div>
        </header>
        
        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;