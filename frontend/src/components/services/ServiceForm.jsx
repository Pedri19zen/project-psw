import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const ServiceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    type: 'Maintenance',
    price: '',
    duration: 60,
    descriptionPublic: '',
    descriptionPrivate: '',
    authorizedMechanics: [] 
  });

  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const response = await api.get('/staff/mechanics');
        setMechanics(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMechanics();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const fetchService = async () => {
        try {
          const res = await api.get(`/services/${id}`);
          setFormData({
            name: res.data.name,
            type: res.data.type,
            price: res.data.price,
            duration: res.data.duration || 60,
            descriptionPublic: res.data.descriptionPublic || '',
            descriptionPrivate: res.data.descriptionPrivate || '',
            authorizedMechanics: res.data.authorizedMechanics?.map(m => m._id) || []
          });
        } catch (err) {
          console.error(err);
        }
      };
      fetchService();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMechanicToggle = (mechanicId) => {
    const currentIds = formData.authorizedMechanics;
    if (currentIds.includes(mechanicId)) {
      setFormData({ ...formData, authorizedMechanics: currentIds.filter(id => id !== mechanicId) });
    } else {
      setFormData({ ...formData, authorizedMechanics: [...currentIds, mechanicId] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode) {
        await api.put(`/services/${id}`, formData);
      } else {
        await api.post('/services', formData);
      }
      navigate('/admin/services'); 
    } catch (err) {
      alert('Error saving service.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { 
      maxWidth: '800px', 
      margin: '2rem auto', 
      padding: '2.5rem', 
      background: '#1e293b', 
      borderRadius: '12px', 
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
      border: '1px solid #334155'
    },
    formGroup: { marginBottom: '1.2rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#94a3b8' },
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
    row: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
    col: { flex: 1, minWidth: '200px' },
    checkboxGrid: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
      gap: '12px', 
      marginTop: '10px',
      background: '#0f172a',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid #334155'
    },
    checkboxLabel: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      cursor: 'pointer',
      color: '#cbd5e1',
      fontSize: '0.9rem'
    },
    actions: { display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '2.5rem' },
    cancelBtn: { 
      background: '#334155', 
      color: '#f1f5f9', 
      padding: '12px 24px', 
      border: 'none', 
      borderRadius: '8px', 
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'background 0.2s'
    },
    submitBtn: { 
      background: '#2563eb', 
      color: 'white', 
      padding: '12px 24px', 
      border: 'none', 
      borderRadius: '8px', 
      cursor: 'pointer', 
      fontWeight: 'bold',
      transition: 'background 0.2s'
    }
  };

  return (
    <div className="fade-in" style={styles.container}>
      <h2 style={{ marginBottom: '1.5rem', color: '#f1f5f9', fontWeight: '700' }}>{isEditMode ? 'Edit Service' : 'Add New Service'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Service Name</label>
          <input type="text" name="name" value={formData.name} required onChange={handleChange} placeholder="e.g. Oil Change" style={styles.input} />
        </div>

        <div style={styles.row}>
          <div style={styles.col}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Type</label>
              <select name="type" value={formData.type} onChange={handleChange} style={styles.input}>
                <option value="Maintenance">Maintenance</option>
                <option value="Repair">Repair</option>
                <option value="Inspection">Inspection</option>
              </select>
            </div>
          </div>
          
          <div style={styles.col}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Price (€)</label>
              <input type="number" name="price" value={formData.price} required onChange={handleChange} style={styles.input} />
            </div>
          </div>

          <div style={styles.col}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Duration (min)</label>
              <input type="number" name="duration" value={formData.duration} onChange={handleChange} style={styles.input} />
            </div>
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Public Description (Client View)</label>
          <textarea name="descriptionPublic" value={formData.descriptionPublic} rows="3" onChange={handleChange} style={styles.input}></textarea>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Private Notes (Staff Only)</label>
          <textarea name="descriptionPrivate" value={formData.descriptionPrivate} rows="2" onChange={handleChange} style={styles.input}></textarea>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Authorized Mechanics</label>
          <div style={styles.checkboxGrid}>
            {mechanics.map((mech) => (
              <label key={mech._id} style={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={formData.authorizedMechanics.includes(mech._id)} 
                  onChange={() => handleMechanicToggle(mech._id)}
                  style={{ cursor: 'pointer', accentColor: '#3b82f6' }}
                />
                {mech.name}
              </label>
            ))}
            {mechanics.length === 0 && <small style={{ color: '#64748b' }}>No mechanics found.</small>}
          </div>
        </div>

        <div style={styles.actions}>
          <button 
            type="button" 
            onClick={() => navigate('/admin/services')} 
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
            {loading ? 'Saving...' : (isEditMode ? 'Update Service' : 'Create Service')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;