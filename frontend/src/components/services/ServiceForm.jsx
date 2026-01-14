import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './ServiceForm.module.css';

const ServiceForm = () => {
  const navigate = useNavigate();
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'Maintenance',
    price: '',
    duration: 30,
    descriptionPublic: '',
    descriptionPrivate: '',
    authorizedMechanics: [] // Stores IDs of selected mechanics
  });

  const [mechanics, setMechanics] = useState([]);

  // Fetch mechanics for the checklist
  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/staff/mechanics');
        setMechanics(response.data);
      } catch (err) {
        console.error('Error fetching mechanics:', err);
      }
    };
    fetchMechanics();
  }, []);

  // Handle Text Inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Mechanic Checkbox Selection
  const handleMechanicToggle = (mechanicId) => {
    const currentIds = formData.authorizedMechanics;
    if (currentIds.includes(mechanicId)) {
      // Remove if already selected
      setFormData({ 
        ...formData, 
        authorizedMechanics: currentIds.filter(id => id !== mechanicId) 
      });
    } else {
      // Add if not selected
      setFormData({ 
        ...formData, 
        authorizedMechanics: [...currentIds, mechanicId] 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/services', formData);
      navigate('/admin/services'); // Go back to list after success
    } catch (err) {
      alert('Error creating service. Check console.');
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Add New Service</h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Row 1: Basic Info */}
        <div className={styles.formGroup}>
          <label>Service Name</label>
          <input 
            type="text" 
            name="name" 
            required 
            onChange={handleChange} 
            placeholder="e.g. Oil Change"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>Type</label>
            <select name="type" onChange={handleChange}>
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
              required 
              onChange={handleChange} 
            />
          </div>

          <div className={styles.formGroup}>
            <label>Duration (min)</label>
            <input 
              type="number" 
              name="duration" 
              defaultValue={30} 
              onChange={handleChange} 
            />
          </div>
        </div>

        {/* Row 2: Descriptions */}
        <div className={styles.formGroup}>
          <label>Public Description (Client View)</label>
          <textarea 
            name="descriptionPublic" 
            rows="3" 
            onChange={handleChange}
          ></textarea>
        </div>

        <div className={styles.formGroup}>
          <label>Private Notes (Staff Only)</label>
          <textarea 
            name="descriptionPrivate" 
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
                  onChange={() => handleMechanicToggle(mech._id)}
                />
                {mech.name}
              </label>
            ))}
            {mechanics.length === 0 && <small>No mechanics found in database.</small>}
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={() => navigate('/admin/services')} className={styles.cancelBtn}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn}>
            Create Service
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;