import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './StaffForm.module.css';

const StaffForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '123' // Default password for simplicity
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/staff', formData);
      navigate('/admin/staff');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating staff');
    }
  };

  return (
    <div className={styles.container}>
      <h2>Register New Mechanic</h2>
      
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Full Name</label>
          <input 
            type="text" name="name" required 
            onChange={handleChange} placeholder="e.g. Carlos Silva"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Email Address</label>
          <input 
            type="email" name="email" required 
            onChange={handleChange} placeholder="mechanic@oficina.pt"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Default Password</label>
          <input 
            type="text" name="password" 
            value={formData.password} onChange={handleChange}
          />
          <small className={styles.hint}>They can change this later.</small>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={() => navigate('/admin/staff')} className={styles.cancelBtn}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn}>
            Register Staff
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffForm;