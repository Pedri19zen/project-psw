import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const StaffForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'mechanic',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const fetchStaff = async () => {
        try {
          const res = await api.get(`/staff/${id}`);
          setFormData({
            name: res.data.name,
            email: res.data.email,
            role: res.data.role,
            password: ''
          });
        } catch (err) {
          console.error(err);
          setError("Could not load staff details.");
        }
      };
      fetchStaff();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode) {
        await api.put(`/staff/${id}`, formData);
      } else {
        await api.post('/staff', formData);
      }
      navigate('/admin/staff');
    } catch (err) {
      setError(err.response?.data?.msg || "Error saving staff member.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { 
      maxWidth: '600px', 
      margin: '2rem auto', 
      padding: '2.5rem', 
      background: '#1e293b', 
      borderRadius: '12px', 
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
      border: '1px solid #334155'
    },
    header: { marginBottom: '1.5rem', color: '#f1f5f9', fontWeight: '700' },
    formGroup: { marginBottom: '1.2rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#94a3b8' },
    input: { 
      width: '100%', 
      padding: '12px', 
      borderRadius: '8px', 
      border: '1px solid #475569', 
      fontSize: '1rem', 
      background: '#0f172a', 
      color: '#f1f5f9',
      boxSizing: 'border-box'
    },
    select: { 
      width: '100%', 
      padding: '12px', 
      borderRadius: '8px', 
      border: '1px solid #475569', 
      fontSize: '1rem', 
      background: '#0f172a', 
      color: '#f1f5f9',
      boxSizing: 'border-box'
    },
    errorBox: { 
      padding: '12px', 
      background: '#7f1d1d', 
      color: '#fecaca', 
      borderRadius: '8px', 
      marginBottom: '1.5rem',
      border: '1px solid #991b1b'
    },
    actions: { display: 'flex', gap: '15px', marginTop: '2.5rem' },
    cancelBtn: { 
      flex: 1, 
      padding: '12px', 
      background: '#334155', 
      color: '#f1f5f9', 
      border: 'none', 
      borderRadius: '8px', 
      cursor: 'pointer', 
      fontWeight: 'bold',
      transition: 'background 0.2s'
    },
    submitBtn: { 
      flex: 1, 
      padding: '12px', 
      background: '#2563eb', 
      color: 'white', 
      border: 'none', 
      borderRadius: '8px', 
      cursor: 'pointer', 
      fontWeight: 'bold',
      transition: 'background 0.2s'
    }
  };

  return (
    <div className="fade-in" style={styles.container}>
      <h2 style={styles.header}>{isEditMode ? 'Edit Staff Member' : 'Add New Staff'}</h2>

      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Full Name</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            placeholder="e.g. John Doe"
            style={styles.input} 
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email Address</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            placeholder="john@reproauto.com"
            style={styles.input} 
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Role</label>
          <select 
            name="role" 
            value={formData.role} 
            onChange={handleChange} 
            style={styles.select}
          >
            <option value="mechanic">Mechanic</option>
            <option value="admin">Administrator</option>
            <option value="staff">Receptionist</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            {isEditMode ? 'New Password (leave blank to keep current)' : 'Password'}
          </label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            required={!isEditMode}
            placeholder={isEditMode ? "********" : "Enter secure password"}
            style={styles.input} 
          />
        </div>

        <div style={styles.actions}>
          <button 
            type="button" 
            onClick={() => navigate('/admin/staff')} 
            style={styles.cancelBtn}
            onMouseEnter={(e) => e.target.style.background = '#475569'}
            onMouseLeave={(e) => e.target.style.background = '#334155'}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            style={{
              ...styles.submitBtn,
              background: loading ? '#475569' : '#2563eb',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = '#1d4ed8')}
            onMouseLeave={(e) => !loading && (e.target.style.background = '#2563eb')}
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update Staff' : 'Register Staff')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffForm;