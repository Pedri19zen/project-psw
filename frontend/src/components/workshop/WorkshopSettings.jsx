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

  const handleBasicChange = (e) => {
    setWorkshop({ ...workshop, [e.target.name]: e.target.value });
  };

  const handleShiftChange = (index, field, value) => {
    const updatedShifts = [...workshop.shifts];
    updatedShifts[index][field] = value;
    setWorkshop({ ...workshop, shifts: updatedShifts });
  };

  // Helper Function: Check if times are valid
  const validateShifts = (shifts) => {
    for (const shift of shifts) {
      if (shift.startTime && shift.endTime) {
        if (shift.startTime >= shift.endTime) {
          alert(`Error "${shift.name}": Endtime (${shift.endTime}) has to be before start: (${shift.startTime}).`);
          return false; // Invalid
        }
      }
    }
    return true; // Valid
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Validate before Creating (POST)
    if (!workshop._id) {
       if (!validateShifts(workshop.shifts)) return;
    }

    try {
      let res;
      if (workshop._id) {
        // UPDATE General Info
        res = await api.put(`/workshops/${workshop._id}`, {
          name: workshop.name,
          location: workshop.location,
          contact: workshop.contact
        });
      } else {
        // CREATE (Sends shifts too)
        res = await api.post('/workshops', {
          name: workshop.name,
          location: workshop.location,
          contact: workshop.contact,
          shifts: workshop.shifts 
        });
      }
      
      setWorkshop(res.data);
      setMessage({ type: 'success', text: 'Config saved successfully!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error while saving.' });
    }
  };

  const handleSaveShifts = async () => {
    setMessage(null);
    if (!workshop._id) {
      setMessage({ type: 'error', text: 'Please save general information first.' });
      return;
    }

    // Validate before Updating Shifts (PUT)
    if (!validateShifts(workshop.shifts)) return;

    try {
      await api.put(`/workshops/${workshop._id}/shifts`, {
        shifts: workshop.shifts
      });
      setMessage({ type: 'success', text: 'Shifts successfully updated!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Error while saving shifts.' });
    }
  };

  if (loading) return <div className="fade-in" style={{padding: '2rem'}}>A carregar configurações...</div>;

  return (
    <div className={styles.container}>
      <h2>Workshop settings</h2>
      
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
        <h3>General Info</h3>
        <div className={styles.formGroup}>
          <label>Name</label>
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
          <label>Contact</label>
          <input 
            type="text" name="contact" 
            value={workshop.contact} onChange={handleBasicChange} required
          />
        </div>

        <div className={styles.actions}>
          <button type="submit" className="btn-primary">
            {workshop._id ? 'Save' : 'Create'}
          </button>
        </div>
      </form>

      {/* Shift Configuration */}
      {workshop._id && (
        <div className={styles.sectionDivider}>
          <h3>Shifts</h3>
          
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
                  <label>Slots per shift:</label>
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
              Update shifts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopSettings;