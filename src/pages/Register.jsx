import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ 
    name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await register(formData);
    
    if (result.success) {
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="card auth-card">
        <div className="auth-header">
          <div className="flex justify-center mb-md">
            <Sprout size={48} color="var(--primary-color)" />
          </div>
          <h1>Create Farmer Account</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Join SFMS as a registered farmer</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ 
              padding: '0.75rem', 
              backgroundColor: 'var(--danger-color)', 
              color: 'white', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Jean Damascene"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              type="tel" 
              className="form-input" 
              placeholder="e.g. 078xxxxxxx"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required 
            />
          </div>


          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-full mt-sm" 
            style={{ padding: '0.75rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div className="text-center mt-md" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
        <div className="text-center mt-sm" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Extension Officers are provisioned by system administrators.
        </div>
      </div>
    </div>
  );
};

export default Register;
