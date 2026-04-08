import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // In our backend, we use phone primarily. Identifier can be email or phone.
    const result = await login(formData.identifier, formData.password);
    
    if (result.success) {
      if (result.user.role === 'Admin') {
        navigate('/admin');
      } else if (result.user.role === 'Extension Officer') {
        navigate('/extension');
      } else {
        navigate('/dashboard');
      }
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
          <h1>Welcome to SFMS</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to manage your farm</p>
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
            <label className="form-label">Phone Number</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. 078xxxxxxx"
              value={formData.identifier}
              onChange={(e) => setFormData({...formData, identifier: e.target.value})}
              required 
            />
          </div>
          
          <div className="form-group">
            <div className="flex justify-between">
              <label className="form-label">Password</label>
              <a href="#" style={{ fontSize: '0.8rem' }}>Forgot password?</a>
            </div>
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
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="text-center mt-md" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
