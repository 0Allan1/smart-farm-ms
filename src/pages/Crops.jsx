import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Plus, CheckCircle, Droplets, Leaf, Info } from 'lucide-react';
import api from '../utils/api';
import ActivityModal from '../components/ActivityModal';
import ActivityTimeline from '../components/ActivityTimeline';

const AdviceFeed = ({ cropId }) => {
  const [advice, setAdvice] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvice = async () => {
      try {
        const data = await api.get(`/advice/${cropId}`);
        setAdvice(data);
      } catch (error) {
        console.error('Error fetching advice:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvice();
  }, [cropId]);

  if (loading) return <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Loading advice...</div>;
  if (advice.length === 0) return <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No recommendations yet.</div>;

  return (
    <div className="flex-col gap-xs">
      {advice.map(item => (
        <div key={item.id} style={{ fontSize: '0.85rem', backgroundColor: 'white', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1fae5' }}>
          <div style={{ fontWeight: 500 }}>{item.content}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
            {new Date(item.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
};

const Crops = () => {
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    variation: '',
    plantedDate: '',
    growthStage: 'Seedling',
    farmId: ''
  });

  // Scheduler states
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [activityType, setActivityType] = useState('Irrigation');
  const [harvestYield, setHarvestYield] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [advice, setAdvice] = useState([]); // Store advice for selected crop

  const fetchData = async () => {
    try {
      const [cropsData, farmsData] = await Promise.all([
        api.get('/crops'),
        api.get('/farms')
      ]);
      setCrops(cropsData);
      setFarms(farmsData);
      if (farmsData.length > 0) {
        setFormData(prev => ({ ...prev, farmId: farmsData[0].id }));
      }
    } catch (error) {
      console.error('Error fetching crop data:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchAdvice = async (cropId) => {
    try {
      const data = await api.get(`/advice/${cropId}`);
      setAdvice(data);
    } catch (error) {
      console.error('Error fetching advice:', error);
    }
  };

  const handleSelectCrop = (crop) => {
    setSelectedCrop(crop);
    fetchAdvice(crop.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/crops', formData);
      setShowModal(false);
      setFormData({ 
        name: '', 
        variation: '', 
        plantedDate: '', 
        growthStage: 'Seedling', 
        farmId: farms[0]?.id || '' 
      });
      fetchData();
    } catch (error) {
      alert('Error adding crop: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleHarvest = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/crops/${selectedCrop.id}`, {
        status: 'Harvested',
        yield: harvestYield,
        growthStage: 'Harvested'
      });
      setShowHarvestModal(false);
      setHarvestYield('');
      fetchData();
    } catch (error) {
      alert('Error harvesting: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this crop?')) return;
    try {
      await api.delete(`/crops/${id}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Error deleting crop');
    }
  };

  const getStageColor = (stage) => {
    switch(stage) {
      case 'Seedling': return '#fcd34d';
      case 'Vegetative': return '#34d399';
      case 'Flowering': return '#c084fc';
      case 'Ripening': return '#f59e0b';
      case 'Harvested': return '#94a3b8';
      default: return '#e2e8f0';
    }
  };

  return (
    <div className="animate-fade-in flex-col gap-lg">
      <div className="flex justify-between items-center mb-md">
        <div>
          <h1 style={{ margin: 0 }}>My Crops</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track growth stages and manage harvest.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Crop
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <p>Loading your crops...</p>
        ) : crops.length === 0 ? (
          <p>No crops registered yet. Select "Add Crop" to begin.</p>
        ) : (
          crops.map(crop => (
            <div key={crop.id} className="card flex-col gap-md">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-sm">
                  <div style={{ padding: '0.5rem', backgroundColor: '#ecfdf5', borderRadius: '50%' }}>
                    <Sprout size={24} color="var(--primary-color)" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>{crop.name} {crop.variation ? `(${crop.variation})` : ''}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{crop.farm?.name}</div>
                  </div>
                </div>
                <span className={`badge ${crop.status === 'Active' ? 'badge-success' : 'badge-info'}`}>
                  {crop.status}
                </span>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }} className="flex justify-between items-center">
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Planted</div>
                  <div style={{ fontWeight: 500 }}>{new Date(crop.plantedDate).toLocaleDateString()}</div>
                </div>
                <div className="text-center">
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Growth Stage</div>
                  <div className="flex items-center gap-xs" style={{ fontWeight: 600 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: getStageColor(crop.growthStage) }}></div>
                    {crop.growthStage}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: crop.isManualStage ? '#f59e0b' : '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                    {crop.isManualStage ? 'Manual Override' : 'System Calculated'}
                  </div>
                </div>
                <div className="text-right">
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Yield</div>
                  <div style={{ fontWeight: 500 }}>{crop.yield || '-'}</div>
                </div>
              </div>

              <div className="flex gap-sm">
                <button 
                  className="btn btn-secondary flex-1" 
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => {
                    setSelectedCrop(crop);
                    setActivityType('Irrigation');
                    setShowActivityModal(true);
                  }}
                >
                  <Droplets size={16}/> Irrigation
                </button>
                <button 
                  className="btn btn-secondary flex-1" 
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => {
                    setSelectedCrop(crop);
                    setActivityType('Fertilization');
                    setShowActivityModal(true);
                  }}
                >
                  <Leaf size={16}/> Fertilizer
                </button>
                <button 
                  className="btn btn-secondary flex-1" 
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => {
                    setSelectedCrop(crop);
                    setShowHarvestModal(true);
                  }}
                  disabled={crop.status === 'Harvested'}
                >
                  <CheckCircle size={16}/> Harvest
                </button>
              </div>

              {crop.status === 'Harvested' && (
                <button 
                  className="btn btn-secondary w-full" 
                  style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)', fontSize: '0.8rem' }}
                  onClick={() => handleDelete(crop.id)}
                >
                  Remove Record
                </button>
              )}

              {/* Officer Recommendations (FR 7.1) */}
              <div className="flex-col gap-sm mt-md pt-md border-t" style={{ backgroundColor: '#f0fdf4', margin: '0 -1rem', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Info size={14}/> Extension Officer Advice
                </div>
                {/* We'll use a component or inline fetch logic here */}
                <AdviceFeed cropId={crop.id} />
              </div>

              {/* Activity Timeline (FR 3.5) */}
              <ActivityTimeline cropId={crop.id} refreshTrigger={refreshTrigger} />
            </div>
          ))
        )}
      </div>

      {/* Scheduler Modal (FR 4.1) */}
      {showActivityModal && selectedCrop && (
        <ActivityModal 
          crop={selectedCrop} 
          type={activityType} 
          onClose={() => setShowActivityModal(false)}
          onRefresh={() => {
            fetchData();
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      )}

      {/* Add Crop Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 500 }}>
            <h2 className="mb-md">Register New Crop</h2>
            {loading ? (
              <div className="text-center py-lg">
                <p>Loading farm data...</p>
              </div>
            ) : farms.length === 0 ? (
              <div className="text-center py-lg">
                <p className="mb-md">You need to register a farm before adding crops.</p>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard/farms')}>Go to My Farms</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Crop Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Maize"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Variation (Common Options)</label>
                  <select 
                    className="form-input"
                    value={formData.variation}
                    onChange={(e) => setFormData({...formData, variation: e.target.value})}
                  >
                    <option value="">-- Select Variety (Optional) --</option>
                    <optgroup label="Maize">
                      <option value="Hybrid WH 505">Hybrid WH 505</option>
                      <option value="ZM 607">ZM 607</option>
                      <option value="SC 719">SC 719</option>
                      <option value="Local Variety">Local Variety</option>
                    </optgroup>
                    <optgroup label="Beans">
                      <option value="Climbing Beans">Climbing Beans</option>
                      <option value="Bush Beans">Bush Beans</option>
                      <option value="RWR 2245">RWR 2245</option>
                    </optgroup>
                    <optgroup label="Potatoes">
                      <option value="Kinigi">Kinigi</option>
                      <option value="Kirundo">Kirundo</option>
                    </optgroup>
                    <optgroup label="Rice">
                      <option value="Kigoli">Kigoli</option>
                      <option value="Wat 9">Wat 9</option>
                    </optgroup>
                    <option value="Other">Other / Not Listed</option>
                  </select>
                </div>
                <div className="flex gap-md w-full">
                  <div className="form-group w-full">
                    <label className="form-label">Date Planted</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={formData.plantedDate}
                      onChange={(e) => setFormData({...formData, plantedDate: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-group w-full">
                    <label className="form-label">Select Farm</label>
                    <select 
                      className="form-input"
                      value={formData.farmId}
                      onChange={(e) => setFormData({...formData, farmId: e.target.value})}
                      required
                    >
                      {farms.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-sm mt-lg justify-end">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Register Crop</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Harvest Modal */}
      {showHarvestModal && selectedCrop && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 400 }}>
            <h2 className="mb-md">Harvest Crop</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Finalize the cycle for <strong>{selectedCrop.name}</strong>. Record your total yield to complete the record.
            </p>
            <form onSubmit={handleHarvest}>
              <div className="form-group">
                <label className="form-label">Total Yield (kg)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-input" 
                  placeholder="e.g. 250.5"
                  value={harvestYield}
                  onChange={(e) => setHarvestYield(e.target.value)}
                  required 
                />
              </div>
              <div className="flex gap-sm mt-lg justify-end">
                <button type="button" className="btn btn-secondary" onClick={() => setShowHarvestModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Complete Harvest</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Crops;
