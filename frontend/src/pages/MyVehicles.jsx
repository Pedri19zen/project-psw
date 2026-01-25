import { useState, useEffect } from 'react';
import api from '../services/api';

const MyVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    plate: '',
    year: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const isValidPlate = (plate) => {
    // Allows AA-00-00, 00-AA-00, 00-00-AA, AA-00-AA
    const regex = /^([A-Z0-9]{2}-[A-Z0-9]{2}-[A-Z0-9]{2})$/;
    return regex.test(plate);
  };

  const isValidYear = (year) => {
    const currentYear = new Date().getFullYear();
    return year >= 1886 && year <= (currentYear + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 1. Validate Year
    if (!isValidYear(formData.year)) {
      setError(`Invalid year. Must be between 1886 and ${new Date().getFullYear() + 1}.`);
      return;
    }

    // 2. Validate Plate
    if (!isValidPlate(formData.plate)) {
      setError('Invalid license plate. Format: XX-XX-XX (e.g. AA-22-BB).');
      return;
    }

    try {
      const res = await api.post('/vehicles', formData);
      setVehicles([...vehicles, res.data]);
      setFormData({ brand: '', model: '', plate: '', year: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding vehicle.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this vehicle?")) {
      try {
        await api.delete(`/vehicles/${id}`);
        setVehicles(vehicles.filter(v => v._id !== id));
      } catch (err) {
        alert("Error removing vehicle.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'plate' ? value.toUpperCase() : value
    });
  };

  // --- INTERNAL STYLES 
  const styles = {
    container: { maxWidth: '1000px', margin: '0 auto', padding: '2rem' },
    errorBox: { padding: '15px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: '500' },
    formCard: { background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' },
    inputGroup: { display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' },
    input: { flex: '1 1 200px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    card: { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    deleteBtn: { marginTop: '10px', padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', width: '100%' },
    submitBtn: { padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }
  };

  if (loading) return <div style={{padding: '2rem'}}>Loading vehicles...</div>;

  return (
    <div className="fade-in" style={styles.container}>
      <h2 style={{ color: '#1e293b', marginBottom: '1.5rem' }}>My Vehicles</h2>

      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.formCard}>
        <div style={styles.inputGroup}>
          <input style={styles.input} type="text" name="brand" placeholder="Brand (e.g. BMW)" value={formData.brand} onChange={handleChange} required />
          <input style={styles.input} type="text" name="model" placeholder="Model (e.g. i8)" value={formData.model} onChange={handleChange} required />
        </div>
        <div style={styles.inputGroup}>
          <input style={styles.input} type="text" name="plate" placeholder="Plate (AA-00-AA)" value={formData.plate} onChange={handleChange} required maxLength={8} />
          <input style={styles.input} type="number" name="year" placeholder="Year" value={formData.year} onChange={handleChange} required />
        </div>
        <button type="submit" style={styles.submitBtn}>Add Vehicle</button>
      </form>

      <div style={styles.grid}>
        {vehicles.length === 0 ? (
          <p style={{ color: '#64748b' }}>No vehicles added yet.</p>
        ) : (
          vehicles.map((v) => (
            <div key={v._id} style={styles.card}>
              <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>{v.brand} {v.model}</h3>
              <p style={{ margin: '5px 0', color: '#64748b' }}><strong>Plate:</strong> <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{v.plate}</span></p>
              <p style={{ margin: '5px 0', color: '#64748b' }}><strong>Year:</strong> {v.year}</p>
              <button onClick={() => handleDelete(v._id)} style={styles.deleteBtn}>Remove</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyVehicles;