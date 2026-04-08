import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Ruler, Trash2 } from 'lucide-react';
import api from '../utils/api';

const Farms = () => {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    size: '',
    soilType: 'Loamy',
    location: ''
  });

  const fetchFarms = async () => {
    try {
      const data = await api.get('/farms');
      setFarms(data);
    } catch (error) {
      console.error('Error fetching farms:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFarms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/farms', {
        ...formData,
        size: parseFloat(formData.size)
      });
      setShowModal(false);
      setFormData({ name: '', size: '', soilType: 'Loamy', location: '' });
      fetchFarms();
    } catch (error) {
      alert('Error saving farm: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plot?')) return;
    try {
      await api.delete(`/farms/${id}`);
      fetchFarms();
    } catch (error) {
      alert('Error deleting farm: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="animate-fade-in flex-col gap-lg">
      <div className="flex justify-between items-center mb-md">
        <div>
          <h1 style={{ margin: 0 }}>My Farms</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your plots and soil details.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Plot
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <p>Loading your farms...</p>
        ) : farms.length === 0 ? (
          <p>No plots registered yet. Click "Add Plot" to get started.</p>
        ) : (
          farms.map(farm => (
            <div key={farm.id} className="card flex-col justify-between" style={{ padding: '1.5rem' }}>
              <div>
                <div className="flex justify-between items-start mb-sm">
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{farm.name}</h3>
                  <span className={`badge ${farm._count?.crops > 0 ? 'badge-success' : 'badge-warning'}`}>
                    {farm._count?.crops > 0 ? `${farm._count.crops} Active Crop` : 'Idle'}
                  </span>
                </div>
                
                <div className="flex items-center gap-sm mt-md" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <MapPin size={16} /> {farm.location}
                </div>
                <div className="flex items-center gap-sm mt-sm" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <Ruler size={16} /> {farm.size} Hectares • {farm.soilType} Soil
                </div>
              </div>
              
              <div className="flex gap-sm mt-lg">
                <button className="btn btn-secondary w-full" onClick={() => navigate(`/dashboard/farms/${farm.id}`)}>View Details</button>
                <button 
                  className="btn btn-secondary" 
                  style={{ color: 'var(--danger-color)', padding: '0.5rem' }} 
                  onClick={() => handleDelete(farm.id)}
                  title="Delete Plot"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Plot Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 500 }}>
            <h2 className="mb-md">Add New Plot</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Plot Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              <div className="flex gap-md w-full">
                <div className="form-group w-full">
                  <label className="form-label">Size (Hectares)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-input" 
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group w-full">
                  <label className="form-label">Soil Type</label>
                  <select 
                    className="form-input"
                    value={formData.soilType}
                    onChange={(e) => setFormData({...formData, soilType: e.target.value})}
                  >
                    <option value="Sandy">Sandy</option>
                    <option value="Clay">Clay</option>
                    <option value="Loamy">Loamy</option>
                    <option value="Volcanic">Volcanic</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location (District)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required 
                />
              </div>
              <div className="flex gap-sm mt-lg justify-end">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Plot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Farms;
