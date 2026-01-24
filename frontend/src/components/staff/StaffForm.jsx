import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const StaffForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff', formData);
      navigate('/admin/staff');
    } catch (err) {
      console.error(err);
      setError('Failed to register staff member.');
    }
  };

  return (
    <div className="card fade-in" style={{ maxWidth: '500px', margin: '2rem auto', padding: '2rem' }}>
      <h2 style={{color: '#1e293b'}}>Register New Mechanic</h2>
      
      {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}

      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        <div>
          <label style={{display: 'block', marginBottom: '0.5rem'}}>Full Name</label>
          <input 
            type="text" 
            className="form-control"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            style={{width: '100%', padding: '0.8rem'}}
          />
        </div>

        <div>
          <label style={{display: 'block', marginBottom: '0.5rem'}}>Email</label>
          <input 
            type="email" 
            className="form-control"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            style={{width: '100%', padding: '0.8rem'}}
          />
        </div>

        <div>
          <label style={{display: 'block', marginBottom: '0.5rem'}}>Password</label>
          <input 
            type="password" 
            className="form-control"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            style={{width: '100%', padding: '0.8rem'}}
          />
        </div>

        <button type="submit" className="btn-primary" style={{marginTop: '1rem'}}>
          Register Mechanic
        </button>
      </form>
    </div>
  );
};

export default StaffForm;