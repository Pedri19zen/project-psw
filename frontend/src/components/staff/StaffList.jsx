import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Staff
  const fetchStaff = async () => {
    try {
      const res = await api.get('/staff'); 
      setStaff(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this staff member?")) {
      try {
        await api.delete(`/staff/${id}`);
        // Remove from UI immediately
        setStaff(staff.filter((person) => person._id !== id));
      } catch (err) {
        alert("Error removing staff member.");
      }
    }
  };

  if (loading) return <div style={{padding: '2rem'}}>Loading staff...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#1e293b' }}>Staff Management</h2>
        <Link to="/admin/staff/new" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 20px', background: '#2563eb', color: 'white', borderRadius: '6px' }}>
          + New Staff
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '15px', color: '#64748b' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '15px', color: '#64748b' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '15px', color: '#64748b' }}>Role</th>
              <th style={{ textAlign: 'right', padding: '15px', color: '#64748b' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((person) => (
              <tr key={person._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '15px', fontWeight: '500' }}>{person.name}</td>
                <td style={{ padding: '15px', color: '#666' }}>{person.email}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ 
                    background: person.role === 'admin' ? '#fef3c7' : '#e0f2fe', 
                    color: person.role === 'admin' ? '#92400e' : '#0369a1', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.9em',
                    textTransform: 'capitalize'
                  }}>
                    {person.role === 'mechanic' ? 'Mechanic' : person.role}
                  </span>
                </td>
                <td style={{ padding: '15px', textAlign: 'right' }}>
                  <Link 
                    to={`/admin/staff/edit/${person._id}`} 
                    style={{ 
                      marginRight: '10px', 
                      color: '#2563eb', 
                      textDecoration: 'none', 
                      fontWeight: 'bold',
                      fontSize: '0.9rem' 
                    }}
                  >
                    Edit
                  </Link>
                  
                  <button 
                    onClick={() => handleDelete(person._id)}
                    style={{ 
                      background: '#ef4444', 
                      color: 'white', 
                      border: 'none', 
                      padding: '6px 12px', 
                      borderRadius: '4px',
                      cursor: 'pointer', 
                      fontWeight: 'bold',
                      fontSize: '0.85rem'
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No staff found.</p>}
      </div>
    </div>
  );
};

export default StaffList;