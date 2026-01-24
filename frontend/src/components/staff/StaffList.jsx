import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; // Correct API import
import styles from './StaffList.module.css';

const StaffList = () => {
  const navigate = useNavigate(); 

  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        // Uses the configured API (Base URL + Auth Token)
        const response = await api.get('/staff/mechanics');
        setMechanics(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching staff:', err);
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  if (loading) return <div className="fade-in" style={{padding: '2rem'}}>Loading team...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Team Management</h2>
        
        {/* FIX: Uses global 'btn-primary' class for blue button */}
        <button 
          className="btn-primary" 
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