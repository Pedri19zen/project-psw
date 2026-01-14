import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ServiceList.module.css';
import { useNavigate } from 'react-router-dom'; 

const ServiceList = () => {
  const navigate = useNavigate(); 
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch services from your Backend API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/services');
        setServices(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load services. Is the backend running?');
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(`http://localhost:5000/api/services/${id}`);
        setServices(services.filter(service => service._id !== id));
      } catch (err) {
        alert('Error deleting service');
      }
    }
  };

  if (loading) return <div className={styles.loading}>Loading services...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Service Catalog</h2>
        {/* 3. NEW: Added onClick handler below */}
        <button 
          className={styles.addButton} 
          onClick={() => navigate('/admin/services/new')}
        >
          + Add New Service
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Service Name</th>
            <th>Type</th>
            <th>Duration</th>
            <th>Price</th>
            <th>Mechanics</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service._id}>
              <td><strong>{service.name}</strong></td>
              <td><span className={styles.badge}>{service.type}</span></td>
              <td>{service.duration} min</td>
              <td>{service.price}€</td>
              <td>
                <small className={styles.mechanicCount}>
                  {service.authorizedMechanics?.length || 0} Staff
                </small>
              </td>
              <td className={styles.actions}>
                <button className={styles.editBtn}>Edit</button>
                <button 
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(service._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {services.length === 0 && (
        <div className={styles.emptyState}>No services found. Add one above!</div>
      )}
    </div>
  );
};

export default ServiceList;