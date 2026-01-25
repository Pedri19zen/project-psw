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

  // Prevent crash if user is null
  if (!user) return null;

  // Role check
  const isAdmin = user.role === 'admin';

  // --- INTERNAL STYLES ---
  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'sans-serif'
    },
    sidebar: {
      width: '260px',
      background: '#0f172a', // Dark Navy
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed', // Keep sidebar fixed
      height: '100vh',
      left: 0,
      top: 0,
      zIndex: 10
    },
    logo: {
      padding: '20px',
      fontSize: '1.5rem',
      fontWeight: '900',
      borderBottom: '1px solid #1e293b',
      letterSpacing: '1px',
      color: 'white',
      textAlign: 'center'
    },
    logoSpan: {
      color: '#3b82f6' // Blue accent
    },
    nav: {
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
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
      transition: 'background 0.2s'
    },
    divider: {
      marginTop: '20px',
      marginBottom: '10px',
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      color: '#64748b',
      fontWeight: 'bold',
      paddingLeft: '15px'
    },
    userProfile: {
      padding: '20px',
      borderTop: '1px solid #1e293b',
      background: '#1e293b'
    },
    userInfo: {
      marginBottom: '10px'
    },
    userName: {
      fontWeight: 'bold',
      fontSize: '0.9rem',
      margin: 0
    },
    userRole: {
      fontSize: '0.8rem',
      color: '#94a3b8',
      textTransform: 'capitalize'
    },
    logoutBtn: {
      width: '100%',
      padding: '8px',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: 'bold'
    },
    main: {
      marginLeft: '260px', // Offset for fixed sidebar
      flex: 1,
      background: '#f1f5f9',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      background: 'white',
      padding: '20px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },
    headerTitle: {
      fontSize: '1.25rem',
      color: '#1e293b',
      margin: 0
    },
    date: {
      color: '#64748b',
      fontSize: '0.9rem',
      fontWeight: '500'
    },
    content: {
      padding: '40px',
      maxWidth: '1200px',
      width: '100%',
      margin: '0 auto'
    }
  };

  return (
    <div style={styles.container}>
      {/* --- SIDEBAR --- */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          REPRO<span style={styles.logoSpan}>AUTO</span>
        </div>
        
        <nav style={styles.nav}>
          {/* Links Visible to ALL (Admin + Staff) */}
          <Link to="/admin/dashboard" style={styles.link}>
            <span style={{marginRight: '10px'}}>📊</span> Dashboard
          </Link>
          
          <Link to="/admin/services" style={styles.link}>
            <span style={{marginRight: '10px'}}>🔧</span> Services
          </Link>
          
          {/* Links Visible ONLY to ADMIN */}
          {isAdmin && (
            <>
              <div style={styles.divider}>Admin</div>
              <Link to="/admin/staff" style={styles.link}>
                <span style={{marginRight: '10px'}}>👥</span> Manage Staff
              </Link>
              <Link to="/admin/settings" style={styles.link}>
                <span style={{marginRight: '10px'}}>⚙️</span> Settings
              </Link>
            </>
          )}
        </nav>

        {/* User Profile at Bottom */}
        <div style={styles.userProfile}>
          <div style={styles.userInfo}>
            <p style={styles.userName}>{user.name || "User"}</p>
            <span style={styles.userRole}>{user.role}</span>
          </div>

          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main style={styles.main}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>
            {isAdmin ? 'Admin Dashboard' : 'Staff Area'}
          </h1>
          <div style={styles.date}>
            {new Date().toLocaleDateString('en-GB')} {/* Changed to English Date Format */}
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