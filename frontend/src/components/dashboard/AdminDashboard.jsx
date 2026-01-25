import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext'; // 1. Import Auth Context
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const { user } = useAuth(); // 2. Get User
  const isAdmin = user?.role === 'admin'; // 3. Check Role

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
      console.error("Error loading dashboard data:", error);
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
      console.error("Error updating status:", err);
      alert("Could not update booking status.");
    }
  };

  const getStatusBadge = (status) => {
    const stylesMap = {
      'Completed': { bg: '#d1fae5', text: '#065f46' },
      'In Progress': { bg: '#dbeafe', text: '#1e40af' },
      'Pending': { bg: '#fef3c7', text: '#92400e' },
      'Cancelled': { bg: '#fee2e2', text: '#b91c1c' },
      'Confirmed': { bg: '#dcfce7', text: '#15803d' }
    };
    const current = stylesMap[status] || { bg: '#f1f5f9', text: '#475569' };
    return (
      <span style={{ 
        padding: '5px 10px', 
        borderRadius: '15px', 
        fontSize: '11px', 
        fontWeight: 'bold', 
        background: current.bg, 
        color: current.text 
      }}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="fade-in" style={{padding: '2rem'}}>Loading dashboard...</div>;

  return (
    <div className={styles.container}>
      <h2 style={{ marginBottom: '20px' }}>System Overview</h2>
      
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

      <div style={{ marginTop: '30px', background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '20px' }}>Recent Bookings</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#64748b', borderBottom: '2px solid #f1f5f9' }}>
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
                <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px' }}>{new Date(b.date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}><strong>{b.client?.name || 'User'}</strong></td>
                  <td style={{ padding: '12px' }}>{b.service?.name || 'Service'}</td>
                  <td style={{ padding: '12px' }}>{getStatusBadge(b.status)}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* ACCEPT / DECLINE logic */}
                      {b.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(b._id, 'Confirmed')}
                            style={{ background: '#22c55e', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(b._id, 'Cancelled')}
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {/* COMPLETE logic */}
                      {b.status === 'Confirmed' && (
                        <button 
                          onClick={() => handleStatusUpdate(b._id, 'Completed')}
                          style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
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
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No bookings found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. ONLY SHOW QUICK ACTIONS FOR ADMIN */}
      {isAdmin && (
        <div style={{ marginTop: '30px' }}>
          <h3>Quick Actions</h3>
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