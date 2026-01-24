import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    services: 0,
    staff: 0,
    bookings: 0,
    revenue: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch data function (moved out so it can be called after updates)
  const fetchAdminData = async () => {
    try {
      const [servicesRes, staffRes, bookingsRes] = await Promise.all([
        api.get('/services'),
        api.get('/staff/mechanics'),
        api.get('/bookings/admin/all')
      ]);

      const allBookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];

      const totalRevenue = allBookings
        .filter(b => b.status === 'Concluído')
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

  // 2. Handler to change booking status (Accept/Decline/Complete)
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status: newStatus });
      // Refresh data to show changes immediately
      fetchAdminData();
    } catch (err) {
      console.error("Erro ao atualizar estado:", err);
      alert("Não foi possível atualizar o estado da marcação.");
    }
  };

  const getStatusBadge = (status) => {
    const stylesMap = {
      'Concluído': { bg: '#d1fae5', text: '#065f46' },
      'Em Progresso': { bg: '#dbeafe', text: '#1e40af' },
      'Pendente': { bg: '#fef3c7', text: '#92400e' },
      'Cancelado': { bg: '#fee2e2', text: '#b91c1c' },
      'Confirmado': { bg: '#dcfce7', text: '#15803d' }
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

  if (loading) return <div className="fade-in" style={{padding: '2rem'}}>A carregar painel...</div>;

  return (
    <div className={styles.container}>
      <h2 style={{ marginBottom: '20px' }}>Visão Geral do Sistema</h2>
      
      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>🔧</div>
          <div className={styles.cardInfo}>
            <h3>{stats.services}</h3>
            <p>Serviços Ativos</p>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>👥</div>
          <div className={styles.cardInfo}>
            <h3>{stats.staff}</h3>
            <p>Mecânicos</p>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>📅</div>
          <div className={styles.cardInfo}>
            <h3>{stats.bookings}</h3>
            <p>Total de Marcações</p>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>💶</div>
          <div className={styles.cardInfo}>
            <h3>{stats.revenue}€</h3>
            <p>Receita (Concluídos)</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '20px' }}>Intervenções Recentes</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#64748b', borderBottom: '2px solid #f1f5f9' }}>
              <th style={{ padding: '12px' }}>Data</th>
              <th style={{ padding: '12px' }}>Cliente</th>
              <th style={{ padding: '12px' }}>Serviço</th>
              <th style={{ padding: '12px' }}>Estado</th>
              <th style={{ padding: '12px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.length > 0 ? (
              recentBookings.map(b => (
                <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px' }}>{new Date(b.date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}><strong>{b.client?.name || 'Utilizador'}</strong></td>
                  <td style={{ padding: '12px' }}>{b.service?.name || 'Serviço'}</td>
                  <td style={{ padding: '12px' }}>{getStatusBadge(b.status)}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* ACCPET / DECLINE logic */}
                      {b.status === 'Pendente' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(b._id, 'Confirmado')}
                            style={{ background: '#22c55e', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Aceitar
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(b._id, 'Cancelado')}
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Recusar
                          </button>
                        </>
                      )}
                      {/* COMPLETE logic */}
                      {b.status === 'Confirmado' && (
                        <button 
                          onClick={() => handleStatusUpdate(b._id, 'Concluído')}
                          style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Concluir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Nenhuma marcação encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Ações Rápidas</h3>
        <div className={styles.actionsGrid}>
          <Link to="/admin/services/new" className={styles.actionCard}>
            <span className={styles.actionIcon}>+</span>
            <span>Novo Serviço</span>
          </Link>
          <Link to="/admin/staff/new" className={styles.actionCard}>
            <span className={styles.actionIcon}>+</span>
            <span>Registar Staff</span>
          </Link>
          <Link to="/admin/settings" className={styles.actionCard}>
            <span className={styles.actionIcon}>⚙️</span>
            <span>Configurar Oficina</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;