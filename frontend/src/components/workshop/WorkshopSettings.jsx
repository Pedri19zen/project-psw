import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './WorkshopSettings.module.css';

const WorkshopSettings = () => {
  const [workshop, setWorkshop] = useState({
    name: '',
    location: '',
    contact: '',
    _id: null
  });
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Fetch the current workshop details when the page opens
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/workshops/config');
        setWorkshop(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading settings:', err);
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setWorkshop({ ...workshop, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    
    try {
      // We use the ID retrieved from the GET request to target the specific document
      await axios.put(`http://localhost:5000/api/workshops/${workshop._id}`, {
        name: workshop.name,
        location: workshop.location,
        contact: workshop.contact
      });
      setMessage({ type: 'success', text: 'Settings updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update settings.' });
    }
  };

  if (loading) return <div className={styles.loading}>Loading settings...</div>;

  return (
    <div className={styles.container}>
      <h2>Workshop Configuration</h2>
      
      {message && (
        <div className={`${styles.alert} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Workshop Name</label>
          <input 
            type="text" 
            name="name" 
            value={workshop.name} 
            onChange={handleChange} 
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Location / Address</label>
          <input 
            type="text" 
            name="location" 
            value={workshop.location} 
            onChange={handleChange} 
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Contact Phone</label>
          <input 
            type="text" 
            name="contact" 
            value={workshop.contact} 
            onChange={handleChange} 
            required
          />
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.saveBtn}>Save Changes</button>
        </div>
      </form>

      {/* Placeholder for the next step (Shifts) */}
      <div className={styles.sectionDivider}>
        <h3>Shift Configuration</h3>
        <p className={styles.hint}>Shift management will be implemented in the next step.</p>
      </div>
    </div>
  );
};

export default WorkshopSettings;