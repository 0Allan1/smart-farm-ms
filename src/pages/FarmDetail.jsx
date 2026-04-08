import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Ruler, Sprout, Info, Calendar, Activity } from 'lucide-react';
import api from '../utils/api';

const FarmDetail = () => {
  const { farmId } = useParams();
  const navigate = useNavigate();
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarmDetail = async () => {
      try {
        const data = await api.get(`/farms/${farmId}`);
        setFarm(data);
      } catch (error) {
        console.error('Error fetching farm details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmDetail();
  }, [farmId]);

  if (loading) return <div className="p-xl text-center">Loading plot details...</div>;
  if (!farm) return <div className="p-xl text-center">Plot not found.</div>;

  return (
    <div className="animate-fade-in flex-col gap-lg">
      <header className="flex items-center gap-md mb-md">
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard/farms')}>
          <ChevronLeft size={18} /> Back to My Farms
        </button>
        <div>
          <h1 style={{ margin: 0 }}>{farm.name} Details</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Comprehensive view of your land and crops.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Left Column: Farm Info */}
        <div className="flex-col gap-lg">
          <div className="card">
            <h3 className="mt-0 mb-md flex items-center gap-sm">
              <Info size={20} color="var(--primary-color)" /> Plot Information
            </h3>
            <div className="flex-col gap-sm" style={{ fontSize: '0.9rem' }}>
              <div className="flex justify-between items-center py-sm border-b">
                <span className="flex items-center gap-xs color-text-secondary"><MapPin size={16}/> Location</span>
                <span style={{ fontWeight: 600 }}>{farm.location}</span>
              </div>
              <div className="flex justify-between items-center py-sm border-b">
                <span className="flex items-center gap-xs color-text-secondary"><Ruler size={16}/> Size</span>
                <span style={{ fontWeight: 600 }}>{farm.size} Hectares</span>
              </div>
              <div className="flex justify-between items-center py-sm">
                <span className="flex items-center gap-xs color-text-secondary"><Activity size={16}/> Soil Type</span>
                <span style={{ fontWeight: 600 }}>{farm.soilType}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ backgroundColor: 'var(--bg-color)', border: '1px dashed var(--border-color)' }}>
             <h4 className="mt-0 mb-sm">Plot Summary</h4>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
               This {farm.soilType.toLowerCase()} soil plot is currently hosting {farm.crops?.length || 0} registered crops. 
               Maintain your activity log to optimize yield outcomes.
             </p>
          </div>
        </div>

        {/* Right Column: Crops on this Plot */}
        <div className="flex-col gap-lg">
          <div className="card">
            <h3 className="mt-0 mb-md flex items-center gap-sm">
              <Sprout size={20} color="var(--primary-color)" /> Crops in this Plot ({farm.crops?.length || 0})
            </h3>
            
            {farm.crops?.length === 0 ? (
              <div className="text-center py-lg">
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No crops found on this plot.</p>
                <button className="btn btn-primary mt-md" onClick={() => navigate('/dashboard/crops')}>Manage Crops</button>
              </div>
            ) : (
              <div className="flex-col gap-md">
                {farm.crops.map(crop => (
                  <div key={crop.id} className="flex justify-between items-center p-md border rounded animate-fade-in" style={{ backgroundColor: 'white' }}>
                    <div className="flex items-center gap-md">
                      <div style={{ padding: '0.5rem', backgroundColor: '#f0fdf4', borderRadius: '50%' }}>
                        <Sprout size={20} color="var(--primary-color)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{crop.name} {crop.variation ? `(${crop.variation})` : ''}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                           Planted: {new Date(crop.plantedDate).toLocaleDateString()} • Stage: {crop.growthStage}
                        </div>
                      </div>
                    </div>
                    <div>
                        <span className={`badge ${crop.status === 'Active' ? 'badge-success' : 'badge-info'}`}>
                          {crop.status}
                        </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmDetail;
