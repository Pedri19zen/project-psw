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
    duration: 60, // Default 60 min
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
        console.error('Error fetching mechanics:', err);
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
          console.error("Error loading service:", err);
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
    container: { maxWidth: '800px', margin: '2rem auto', padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    formGroup: { marginBottom: '1.2rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1e293b' },
    input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' },
    row: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
    col: { flex: 1, minWidth: '200px' },
    checkboxGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' },
    actions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '2rem' }
  };

  return (
    <div className="fade-in" style={styles.container}>
      <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>{isEditMode ? 'Edit Service' : 'Add New Service'}</h2>
      
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
              <label key={mech._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.authorizedMechanics.includes(mech._id)} onChange={() => handleMechanicToggle(mech._id)} />
                {mech.name}
              </label>
            ))}
            {mechanics.length === 0 && <small>No mechanics found.</small>}
          </div>
        </div>

        <div style={styles.actions}>
          <button type="button" onClick={() => navigate('/admin/services')} style={{ background: '#64748b', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ background: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? 'Saving...' : (isEditMode ? 'Update Service' : 'Create Service')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;