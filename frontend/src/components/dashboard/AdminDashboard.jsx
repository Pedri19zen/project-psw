import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [stats, setStats] = useState({
    services: 0,
    staff: 0,
    bookings: 0,
    revenue: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [servicesRes, staffRes, bookingsRes] = await Promise.all([
        api.get('/services'),
        api.get('/staff'),
        api.get('/bookings') 
      ]);

      const allBookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];

      const totalRevenue = allBookings
        .filter(b => b.status === 'Completed') 
        .reduce((acc, curr) => acc + (curr.service?.price || 0), 0);

      setStats({
        services: servicesRes.data.length || 0,
        staff: staffRes.data.length || 0,
        bookings: allBookings.length,
        revenue: totalRevenue
      });

      setRecentBookings(allBookings);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status: newStatus });
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert("Could not update booking status.");
    }
  };

  const getStatusBadge = (status) => {
    const stylesMap = {
      'Completed': { bg: '#064e3b', text: '#6ee7b7' },
      'In Progress': { bg: '#1e3a8a', text: '#93c5fd' },
      'Pending': { bg: '#78350f', text: '#fcd34d' },
      'Cancelled': { bg: '#7f1d1d', text: '#fca5a5' },
      'Confirmed': { bg: '#14532d', text: '#86efac' }
    };
    const current = stylesMap[status] || { bg: '#334155', text: '#cbd5e1' };
    return (
      <span style={{ 
        padding: '5px 12px', 
        borderRadius: '15px', 
        fontSize: '11px', 
        fontWeight: 'bold', 
        background: current.bg, 
        color: current.text,
        border: `1px solid ${current.bg}`
      }}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="fade-in" style={{padding: '2rem', color: '#94a3b8'}}>Loading dashboard...</div>;

  return (
    <div className={styles.container}>
      <h2 style={{ marginBottom: '20px', color: '#f1f5f9' }}>System Overview</h2>
      
      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>🔧</div>
          <div className={styles.cardInfo}>
            <h3>{stats.services}</h3>
            <p>Active Services</p>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>👥</div>
          <div className={styles.cardInfo}>
            <h3>{stats.staff}</h3>
            <p>Mechanics</p>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>📅</div>
          <div className={styles.cardInfo}>
            <h3>{stats.bookings}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>💶</div>
          <div className={styles.cardInfo}>
            <h3>{stats.revenue}€</h3>
            <p>Revenue (Completed)</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', background: '#1e293b', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', border: '1px solid #334155' }}>
        <h3 style={{ marginBottom: '20px', color: '#f1f5f9' }}>Recent Bookings</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#94a3b8', borderBottom: '2px solid #334155' }}>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Client</th>
              <th style={{ padding: '12px' }}>Service</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.length > 0 ? (
              recentBookings.map(b => (
                <tr key={b._id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '12px', color: '#cbd5e1' }}>{new Date(b.date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px', color: '#f1f5f9' }}><strong>{b.client?.name || 'User'}</strong></td>
                  <td style={{ padding: '12px', color: '#cbd5e1' }}>{b.service?.name || 'Service'}</td>
                  <td style={{ padding: '12px' }}>{getStatusBadge(b.status)}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {b.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(b._id, 'Confirmed')}
                            style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(b._id, 'Cancelled')}
                            style={{ background: '#b91c1c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {b.status === 'Confirmed' && (
                        <button 
                          onClick={() => handleStatusUpdate(b._id, 'Completed')}
                          style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No bookings found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAdmin && (
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ marginBottom: '15px', color: '#f1f5f9' }}>Quick Actions</h3>
          <div className={styles.actionsGrid}>
            <Link to="/admin/services/new" className={styles.actionCard}>
              <span className={styles.actionIcon}>+</span>
              <span>New Service</span>
            </Link>
            <Link to="/admin/staff/new" className={styles.actionCard}>
              <span className={styles.actionIcon}>+</span>
              <span>Register Staff</span>
            </Link>
            <Link to="/admin/settings" className={styles.actionCard}>
              <span className={styles.actionIcon}>⚙️</span>
              <span>Settings</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;