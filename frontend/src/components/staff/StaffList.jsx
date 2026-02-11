import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    try {
      const res = await api.get('/staff'); 
      setStaff(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this staff member?")) {
      try {
        await api.delete(`/staff/${id}`);
        setStaff(staff.filter((person) => person._id !== id));
      } catch (err) {
        alert("Error removing staff member.");
      }
    }
  };

  const styles = {
    container: { padding: '2rem', maxWidth: '1000px', margin: '0 auto', background: '#0f172a' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { color: '#f1f5f9', margin: 0 },
    addBtn: { textDecoration: 'none', padding: '10px 20px', background: '#2563eb', color: 'white', borderRadius: '8px', fontWeight: 'bold' },
    tableContainer: { background: '#1e293b', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)', border: '1px solid #334155', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { background: '#0f172a' },
    th: { textAlign: 'left', padding: '15px', color: '#94a3b8', borderBottom: '1px solid #334155', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
    tr: { borderBottom: '1px solid #334155' },
    td: { padding: '15px', color: '#f1f5f9' },
    email: { padding: '15px', color: '#94a3b8' },
    badge: (role) => ({
      background: role === 'admin' ? '#78350f' : '#1e3a8a', 
      color: role === 'admin' ? '#fcd34d' : '#93c5fd', 
      padding: '4px 10px', 
      borderRadius: '6px', 
      fontSize: '0.8rem',
      fontWeight: 'bold',
      textTransform: 'capitalize'
    }),
    editBtn: { marginRight: '15px', color: '#60a5fa', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' },
    removeBtn: { background: '#b91c1c', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }
  };

  if (loading) return <div style={{padding: '2rem', color: '#94a3b8'}}>Loading staff...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Staff Management</h2>
        <Link to="/admin/staff/new" style={styles.addBtn}>
          + New Staff
        </Link>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((person) => (
              <tr key={person._id} style={styles.tr}>
                <td style={styles.td}>{person.name}</td>
                <td style={styles.email}>{person.email}</td>
                <td style={styles.td}>
                  <span style={styles.badge(person.role)}>
                    {person.role === 'mechanic' ? 'Mechanic' : person.role}
                  </span>
                </td>
                <td style={{ padding: '15px', textAlign: 'right' }}>
                  <Link to={`/admin/staff/edit/${person._id}`} style={styles.editBtn}>
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(person._id)} style={styles.removeBtn}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && (
          <p style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', margin: 0 }}>
            No staff found.
          </p>
        )}
      </div>
    </div>
  );
};

export default StaffList;