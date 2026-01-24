import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api'; // Correct API import
import styles from './ServiceForm.module.css';

const ServiceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL to check if we are editing
  const isEditMode = !!id;

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'Maintenance',
    price: '',
    duration: 30,
    descriptionPublic: '',
    descriptionPrivate: '',
    authorizedMechanics: [] 
  });

  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Mechanics (Always needed)
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

  // 2. Fetch Service Data (Only if Editing)
  useEffect(() => {
    if (isEditMode) {
      const fetchService = async () => {
        try {
          const res = await api.get(`/services/${id}`);
          setFormData({
            name: res.data.name,
            type: res.data.type,
            price: res.data.price,
            duration: res.data.duration,
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

  // Handle Text Inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Mechanic Checkbox Selection
  const handleMechanicToggle = (mechanicId) => {
    const currentIds = formData.authorizedMechanics;
    if (currentIds.includes(mechanicId)) {
      setFormData({ 
        ...formData, 
        authorizedMechanics: currentIds.filter(id => id !== mechanicId) 
      });
    } else {
      setFormData({ 
        ...formData, 
        authorizedMechanics: [...currentIds, mechanicId] 
      });
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

  return (
    <div className={styles.container}>
      <h2>{isEditMode ? 'Edit Service' : 'Add New Service'}</h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Row 1: Basic Info */}
        <div className={styles.formGroup}>
          <label>Service Name</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name}
            required 
            onChange={handleChange} 
            placeholder="e.g. Oil Change"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>Type</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="Maintenance">Maintenance</option>
              <option value="Repair">Repair</option>
              <option value="Inspection">Inspection</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label>Price (€)</label>
            <input 
              type="number" 
              name="price" 
              value={formData.price}
              required 
              onChange={handleChange} 
            />
          </div>

          <div className={styles.formGroup}>
            <label>Duration (min)</label>
            <input 
              type="number" 
              name="duration" 
              value={formData.duration}
              onChange={handleChange} 
            />
          </div>
        </div>

        {/* Row 2: Descriptions */}
        <div className={styles.formGroup}>
          <label>Public Description (Client View)</label>
          <textarea 
            name="descriptionPublic" 
            value={formData.descriptionPublic}
            rows="3" 
            onChange={handleChange}
          ></textarea>
        </div>

        <div className={styles.formGroup}>
          <label>Private Notes (Staff Only)</label>
          <textarea 
            name="descriptionPrivate" 
            value={formData.descriptionPrivate}
            rows="2" 
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Row 3: Mechanic Assignment */}
        <div className={styles.mechanicsSection}>
          <label>Authorized Mechanics</label>
          <div className={styles.checkboxGrid}>
            {mechanics.map((mech) => (
              <label key={mech._id} className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={formData.authorizedMechanics.includes(mech._id)}
                  onChange={() => handleMechanicToggle(mech._id)}
                />
                {mech.name}
              </label>
            ))}
            {mechanics.length === 0 && <small>No mechanics found in database.</small>}
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            type="button" 
            onClick={() => navigate('/admin/services')} 
            style={{ background: '#64748b', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          
          {/* FIXED: Uses btn-primary class */}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (isEditMode ? 'Update Service' : 'Create Service')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;