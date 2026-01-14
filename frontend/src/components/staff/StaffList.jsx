import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './StaffList.module.css';
import { useNavigate } from 'react-router-dom'; // 1. NEW: Import the hook

const StaffList = () => {
  const navigate = useNavigate(); // 2. NEW: Initialize the hook

  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/staff/mechanics');
        setMechanics(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching staff:', err);
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  if (loading) return <div className={styles.loading}>Loading team...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Team Management</h2>
        
        {/* 3. NEW: Updated the button to navigate to the form */}
        <button 
          className={styles.addButton} 
          onClick={() => navigate('/admin/staff/new')}
        >
          + Register New Mechanic
        </button>
      </div>

      <div className={styles.grid}>
        {mechanics.map((person) => (
          <div key={person._id} className={styles.card}>
            <div className={styles.avatar}>
              {person.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.info}>
              <h3>{person.name}</h3>
              <p className={styles.email}>{person.email}</p>
              <span className={styles.roleBadge}>Mechanic</span>
            </div>
          </div>
        ))}
      </div>

      {mechanics.length === 0 && (
        <div className={styles.emptyState}>No staff found.</div>
      )}
    </div>
  );
};

export default StaffList;