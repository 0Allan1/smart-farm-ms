import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Sprout, Activity, Calendar, Info, Send, MessageSquare } from 'lucide-react';
import api from '../utils/api';

const ExtensionFarmerView = () => {
  const { farmerId } = useParams();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCropId, setSelectedCropId] = useState(null);
  const [adviceContent, setAdviceContent] = useState('');
  const [adviceHistory, setAdviceHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch managed farmer info
        const managed = await api.get('/access/managed');
        const currentFarmer = managed.find(f => f.id === farmerId);
        
        if (!currentFarmer) {
          alert('Access denied or farmer not found');
          navigate('/extension');
          return;
        }
        
        setFarmer(currentFarmer);

        // Fetch farms and crops using the farmerId override
        const [farmsData, cropsData] = await Promise.all([
          api.get(`/farms?farmerId=${farmerId}`),
          api.get(`/crops?farmerId=${farmerId}`)
        ]);

        setFarms(farmsData);
        setCrops(cropsData);
      } catch (error) {
        console.error('Error fetching farmer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [farmerId, navigate]);

  const fetchAdvice = async (cropId) => {
    try {
      const data = await api.get(`/advice/${cropId}`);
      setAdviceHistory(data);
    } catch (error) {
      console.error('Error fetching advice:', error);
    }
  };

  const handlePostAdvice = async (e) => {
    e.preventDefault();
    if (!adviceContent.trim() || !selectedCropId) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/advice', { content: adviceContent, cropId: selectedCropId });
      setAdviceContent('');
      fetchAdvice(selectedCropId);
    } catch (error) {
      alert('Error posting advice: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-xl text-center">Loading farmer data...</div>;
  if (!farmer) return null;

  return (
    <div className="animate-fade-in flex-col gap-lg">
      <header className="flex items-center gap-md mb-md">
        <button className="btn btn-secondary" onClick={() => navigate('/extension')}>
          <ChevronLeft size={18} /> Back to Dashboard
        </button>
        <div>
          <h1 style={{ margin: 0 }}>{farmer.name}'s Farm Data</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Read-only Access | Assistant Mode</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Left Column: Farmer & Farms Info */}
        <div className="flex-col gap-lg">
          <div className="card">
            <h3 className="mt-0 mb-md flex items-center gap-sm">
              <Info size={20} color="var(--primary-color)" /> Farmer Information
            </h3>
            <div className="flex-col gap-sm" style={{ fontSize: '0.9rem' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Phone:</span>
                <span style={{ fontWeight: 500 }}>{farmer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
                <span style={{ fontWeight: 500 }}>{farmer.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Member Since:</span>
                <span style={{ fontWeight: 500 }}>{new Date(farmer.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="mt-0 mb-md flex items-center gap-sm">
              <MapPin size={20} color="var(--secondary-color)" /> Land & Plots ({farms.length})
            </h3>
            <div className="flex-col gap-md">
              {farms.map(farm => (
                <div key={farm.id} style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600 }}>{farm.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {farm.location} • {farm.size} ha • {farm.soilType} Soil
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Crops & Activities */}
        <div className="flex-col gap-lg">
          <div className="card">
            <h3 className="mt-0 mb-md flex items-center gap-sm">
              <Sprout size={20} color="var(--primary-color)" /> Registered Crops ({crops.length})
            </h3>
            <div className="flex-col gap-md">
              {crops.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No crops registered for any plots.</p>
              ) : (
                crops.map(crop => (
                  <div 
                    key={crop.id} 
                    className={`flex-col gap-sm p-md border rounded cursor-pointer transition-all ${selectedCropId === crop.id ? 'border-primary bg-emerald-50' : 'border-gray-200'}`}
                    onClick={() => {
                      setSelectedCropId(crop.id);
                      fetchAdvice(crop.id);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div style={{ fontWeight: 600 }}>{crop.name} {crop.variation ? `(${crop.variation})` : ''}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Plot: {crop.farm.name} | Stage: {crop.growthStage}
                        </div>
                      </div>
                      <div className="text-right">
                         <span className={`badge ${crop.status === 'Active' ? 'badge-success' : 'badge-info'}`}>
                          {crop.status}
                        </span>
                      </div>
                    </div>

                    {selectedCropId === crop.id && (
                      <div className="mt-md pt-md border-t animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <h4 className="mb-sm flex items-center gap-xs"><MessageSquare size={16} color="var(--primary-color)"/> Advisory Terminal</h4>
                        
                        <form onSubmit={handlePostAdvice} className="flex-col gap-sm">
                          <textarea 
                            className="form-input w-full" 
                            style={{ minHeight: '80px', fontSize: '0.9rem' }}
                            placeholder="Type your expert advice for this crop..."
                            value={adviceContent}
                            onChange={(e) => setAdviceContent(e.target.value)}
                            required
                          />
                          <button type="submit" className="btn btn-primary self-end" disabled={isSubmitting}>
                            <Send size={14}/> {isSubmitting ? 'Sending...' : 'Post Advice'}
                          </button>
                        </form>

                        <div className="mt-md flex-col gap-sm">
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Advice History</div>
                          {adviceHistory.length === 0 ? (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No advice records for this crop.</p>
                          ) : (
                            adviceHistory.map(item => (
                              <div key={item.id} style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                                <div className="mb-xs" style={{ fontWeight: 500 }}>{item.content}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(item.createdAt).toLocaleString()}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Aggregate Activity Log Note */}
          <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)', textAlign: 'center' }}>
             <Activity size={32} color="var(--text-secondary)" className="mb-sm" />
             <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
               Aggregate reports and detailed activity logs per crop are available in the "Aggregate Reports" tab of your service portal.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtensionFarmerView;
