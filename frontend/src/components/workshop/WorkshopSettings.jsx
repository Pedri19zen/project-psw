import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './WorkshopSettings.module.css';

const WorkshopSettings = () => {
  const [workshop, setWorkshop] = useState({
    name: '',
    location: '',
    contact: '',
    shifts: [], 
    _id: null
  });
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

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

  // Handle basic text inputs (Name, Location, Contact)
  const handleBasicChange = (e) => {
    setWorkshop({ ...workshop, [e.target.name]: e.target.value });
  };

  // Handle changes inside the specific Shift rows
  const handleShiftChange = (index, field, value) => {
    const updatedShifts = [...workshop.shifts];
    updatedShifts[index][field] = value;
    setWorkshop({ ...workshop, shifts: updatedShifts });
  };

  // Save General Info
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      await axios.put(`http://localhost:5000/api/workshops/${workshop._id}`, {
        name: workshop.name,
        location: workshop.location,
        contact: workshop.contact
      });
      setMessage({ type: 'success', text: 'General info updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update general info.' });
    }
  };

  // Save Shift Configuration
  const handleSaveShifts = async () => {
    setMessage(null);
    
    // Basic Validation: Ensure Start Time is before End Time
    for (let shift of workshop.shifts) {
      if (shift.startTime >= shift.endTime) {
        setMessage({ type: 'error', text: `Error in ${shift.name}: Start time must be before End time.` });
        return;
      }
    }

    try {
      await axios.put(`http://localhost:5000/api/workshops/${workshop._id}/shifts`, {
        shifts: workshop.shifts
      });
      setMessage({ type: 'success', text: 'Shift configuration saved!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save shifts.' });
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

      {/* General Info */}
      <form onSubmit={handleSaveInfo} className={styles.form}>
        <h3>General Information</h3>
        <div className={styles.formGroup}>
          <label>Workshop Name</label>
          <input 
            type="text" name="name" 
            value={workshop.name} onChange={handleBasicChange} required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Location</label>
          <input 
            type="text" name="location" 
            value={workshop.location} onChange={handleBasicChange} required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Contact Phone</label>
          <input 
            type="text" name="contact" 
            value={workshop.contact} onChange={handleBasicChange} required
          />
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.saveBtn}>Save General Info</button>
        </div>
      </form>

      {/* Shift Configuration */}
      <div className={styles.sectionDivider}>
        <h3>Shift Management (Turnos)</h3>
        <p className={styles.hint}>Define working hours and capacity for each shift.</p>
        
        <div className={styles.shiftGrid}>
          {workshop.shifts.map((shift, index) => (
            <div key={index} className={styles.shiftCard}>
              <h4>{shift.name}</h4>
              
              <div className={styles.shiftRow}>
                <label>Start:</label>
                <input 
                  type="time" 
                  value={shift.startTime}
                  onChange={(e) => handleShiftChange(index, 'startTime', e.target.value)}
                />
              </div>

              <div className={styles.shiftRow}>
                <label>End:</label>
                <input 
                  type="time" 
                  value={shift.endTime}
                  onChange={(e) => handleShiftChange(index, 'endTime', e.target.value)}
                />
              </div>

              <div className={styles.shiftRow}>
                <label>Slots:</label>
                <input 
                  type="number" 
                  min="0"
                  value={shift.slotsPerShift}
                  onChange={(e) => handleShiftChange(index, 'slotsPerShift', parseInt(e.target.value))}
                />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button onClick={handleSaveShifts} className={styles.saveBtnSecondary}>
            Update Shifts
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkshopSettings;