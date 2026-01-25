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
    role: 'mechanic', // Default role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const fetchStaff = async () => {
        try {
          const res = await api.get(`/staff/${id}`);
          // Pre-fill form (exclude password)
          setFormData({
            name: res.data.name,
            email: res.data.email,
            role: res.data.role,
            password: '' // Keep empty unless changing
          });
        } catch (err) {
          console.error("Error fetching staff details:", err);
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
        // Update existing
        await api.put(`/staff/${id}`, formData);
      } else {
        // Create new
        await api.post('/staff', formData);
      }
      navigate('/admin/staff'); // Redirect back to list
    } catch (err) {
      setError(err.response?.data?.msg || "Error saving staff member.");
    } finally {
      setLoading(false);
    }
  };

  // --- INTERNAL STYLES ---
  const styles = {
    container: { maxWidth: '600px', margin: '2rem auto', padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    header: { marginBottom: '1.5rem', color: '#1e293b' },
    formGroup: { marginBottom: '1.2rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' },
    input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' },
    select: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', background: 'white' },
    errorBox: { padding: '10px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '1rem' },
    actions: { display: 'flex', gap: '10px', marginTop: '2rem' },
    cancelBtn: { flex: 1, padding: '10px', background: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    submitBtn: { flex: 1, padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
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
            required={!isEditMode} // Required only when creating new
            placeholder={isEditMode ? "********" : "Enter secure password"}
            style={styles.input} 
          />
        </div>

        <div style={styles.actions}>
          <button 
            type="button" 
            onClick={() => navigate('/admin/staff')} 
            style={styles.cancelBtn}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            style={styles.submitBtn}
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update Staff' : 'Register Staff')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffForm;