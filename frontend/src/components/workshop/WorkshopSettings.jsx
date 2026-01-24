import { useState, useEffect } from 'react';
import api from '../../services/api'; 
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
        const response = await api.get('/workshops/config');
        // Check if the backend actually returned data
        if (response.data) {
          setWorkshop(response.data);
        }
      } catch (err) {
        console.warn('No settings found, ready to create new ones.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Handle basic text inputs
  const handleBasicChange = (e) => {
    setWorkshop({ ...workshop, [e.target.name]: e.target.value });
  };

  // Handle Shift changes
  const handleShiftChange = (index, field, value) => {
    const updatedShifts = [...workshop.shifts];
    updatedShifts[index][field] = value;
    setWorkshop({ ...workshop, shifts: updatedShifts });
  };

  // --- FIX IS HERE: HANDLE CREATE VS UPDATE ---
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      let res;
      if (workshop._id) {
        // ID exists? UPDATE it
        res = await api.put(`/workshops/${workshop._id}`, {
          name: workshop.name,
          location: workshop.location,
          contact: workshop.contact
        });
      } else {
        // No ID? CREATE it
        res = await api.post('/workshops', {
          name: workshop.name,
          location: workshop.location,
          contact: workshop.contact,
          shifts: workshop.shifts // Send shifts on create too
        });
      }
      
      // Update state with the new/updated data (including the new _id)
      setWorkshop(res.data);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    }
  };

  const handleSaveShifts = async () => {
    setMessage(null);
    if (!workshop._id) {
      setMessage({ type: 'error', text: 'Please save General Info first.' });
      return;
    }

    try {
      await api.put(`/workshops/${workshop._id}/shifts`, {
        shifts: workshop.shifts
      });
      setMessage({ type: 'success', text: 'Shift configuration saved!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save shifts.' });
    }
  };

  if (loading) return <div className="fade-in" style={{padding: '2rem'}}>Loading settings...</div>;

  return (
    <div className={styles.container}>
      <h2>Workshop Configuration</h2>
      
      {message && (
        <div className={`${styles.alert} ${styles[message.type]}`} style={{
          padding: '1rem', marginBottom: '1rem', borderRadius: '8px',
          backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#991b1b'
        }}>
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
          {/* Uses global 'btn-primary' class */}
          <button type="submit" className="btn-primary">
            {workshop._id ? 'Update Info' : 'Create Configuration'}
          </button>
        </div>
      </form>

      {/* Shift Configuration (Only show if we have an ID) */}
      {workshop._id && (
        <div className={styles.sectionDivider}>
          <h3>Shift Management (Turnos)</h3>
          
          <div className={styles.shiftGrid}>
            {workshop.shifts.map((shift, index) => (
              <div key={index} className={styles.shiftCard}>
                <h4>{shift.name}</h4>
                <div className={styles.shiftRow}>
                  <label>Start:</label>
                  <input 
                    type="time" value={shift.startTime}
                    onChange={(e) => handleShiftChange(index, 'startTime', e.target.value)}
                  />
                </div>
                <div className={styles.shiftRow}>
                  <label>End:</label>
                  <input 
                    type="time" value={shift.endTime}
                    onChange={(e) => handleShiftChange(index, 'endTime', e.target.value)}
                  />
                </div>
                <div className={styles.shiftRow}>
                  <label>Slots:</label>
                  <input 
                    type="number" min="0" value={shift.slotsPerShift}
                    onChange={(e) => handleShiftChange(index, 'slotsPerShift', parseInt(e.target.value))}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button onClick={handleSaveShifts} className="btn-primary">
              Update Shifts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopSettings;