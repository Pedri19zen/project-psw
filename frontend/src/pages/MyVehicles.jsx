import { useState, useEffect } from 'react';
import api from '../services/api';

const carBrands = [
  'Alfa Romeo', 'Audi', 'BMW', 'Chevrolet', 'Citroen', 'Dacia', 'Fiat', 
  'Ford', 'Honda', 'Hyundai', 'Jaguar', 'Jeep', 'Kia', 'Land Rover', 
  'Lexus', 'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 
  'Opel', 'Peugeot', 'Porsche', 'Renault', 'Seat', 'Skoda', 'Smart', 
  'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
];

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
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1940 + 1 }, (_, i) => currentYear - i);

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
    const regex = /^([A-Z0-9]{2}-[A-Z0-9]{2}-[A-Z0-9]{2})$/;
    return regex.test(plate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

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
  const styles = {
    container: { maxWidth: '1000px', margin: '0 auto', padding: '2rem' },
    header: { color: '#ffffff', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' },
    errorBox: { padding: '15px', background: '#7f1d1d', color: '#fecaca', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: '500', border: '1px solid #991b1b' },
    formCard: { background: '#1e293b', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)', marginBottom: '2rem', border: '1px solid #334155' },
    inputGroup: { display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' },
    input: { flex: '1 1 200px', padding: '12px', borderRadius: '8px', border: '1px solid #475569', fontSize: '1rem', backgroundColor: '#0f172a', color: '#f1f5f9' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    card: { background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' },
    cardTitle: { margin: '0 0 10px 0', color: '#f8fafc' },
    text: { margin: '5px 0', color: '#94a3b8' },
    plateBadge: { fontFamily: 'monospace', background: '#334155', color: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', border: '1px solid #475569' },
    deleteBtn: { marginTop: '15px', padding: '10px 16px', background: '#b91c1c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', width: '100%', transition: 'background 0.2s' },
    submitBtn: { padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', width: '100%' }
  };

  if (loading) return <div style={{padding: '2rem', color: '#fff'}}>Loading vehicles...</div>;

  return (
    <div className="fade-in" style={styles.container}>
      <h2 style={styles.header}>My Vehicles</h2>

      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.formCard}>
        <div style={styles.inputGroup}>
          <select 
            name="brand" 
            value={formData.brand} 
            onChange={handleChange} 
            style={styles.input} 
            required
          >
            <option value="" disabled style={{color: '#94a3b8'}}>Select Brand</option>
            {carBrands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          
          <input style={styles.input} type="text" name="model" placeholder="Model (e.g. i8)" value={formData.model} onChange={handleChange} required />
        </div>
        
        <div style={styles.inputGroup}>
          <input style={styles.input} type="text" name="plate" placeholder="Plate (AA-00-AA)" value={formData.plate} onChange={handleChange} required maxLength={8} />
          
          <select 
            name="year" 
            value={formData.year} 
            onChange={handleChange} 
            style={styles.input} 
            required
          >
            <option value="" disabled>Select Year</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <button type="submit" style={styles.submitBtn}>Add Vehicle</button>
      </form>

      <div style={styles.grid}>
        {vehicles.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', width: '100%' }}>No vehicles added yet.</p>
        ) : (
          vehicles.map((v) => (
            <div key={v._id} style={styles.card}>
              <h3 style={styles.cardTitle}>{v.brand} {v.model}</h3>
              <p style={styles.text}><strong>Plate:</strong> <span style={styles.plateBadge}>{v.plate}</span></p>
              <p style={styles.text}><strong>Year:</strong> {v.year}</p>
              <button onClick={() => handleDelete(v._id)} style={styles.deleteBtn}>Remove</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyVehicles;