import React, { useState } from 'react';
import { X, Droplets, Leaf, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../utils/api';

const ActivityModal = ({ crop, type, onClose, onRefresh }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({
    hasRained: 'No',
    soilFeel: 'Dry',
    isWilting: 'No'
  });
  const [advice, setAdvice] = useState(null);

  const getAdvice = async () => {
    setLoading(true);
    try {
      const response = await api.post('/scheduler/advice', {
        cropId: crop.id,
        answers
      });
      setAdvice(response.advice);
      setStep(2);
    } catch (error) {
      alert('Error getting advice: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const recordActivity = async (actionType) => {
    setLoading(true);
    try {
      const rec = actionType === 'Irrigation' ? advice.irrigation : advice.fertilization;
      
      // Parse recommendation string for numeric amount if possible or just store as notes
      const notes = `${rec.recommendation} | Reason: ${rec.reason}`;
      
      await api.post('/activities', {
        type: actionType,
        cropId: crop.id,
        notes,
        metadata: { answers, advice: rec }
      });
      
      alert(`${actionType} recorded successfully!`);
      onRefresh();
      onClose();
    } catch (error) {
      alert('Error recording activity: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 500, position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-sm mb-lg">
          <div style={{ padding: '0.5rem', backgroundColor: type === 'Irrigation' ? '#ecfdf5' : '#fff7ed', borderRadius: '50%' }}>
            {type === 'Irrigation' ? <Droplets size={24} color="#10b981" /> : <Leaf size={24} color="#f59e0b" />}
          </div>
          <h2 style={{ margin: 0 }}>{type} Scheduler</h2>
        </div>

        {step === 1 && (
          <div className="flex-col gap-md">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Answer a few questions about your <strong>{crop.name}</strong> to get the best advice.
            </p>

            <div className="form-group">
              <label className="form-label">Has it rained in the last 48 hours?</label>
              <div className="flex gap-sm">
                {['Yes', 'No'].map(opt => (
                  <button 
                    key={opt}
                    className={`btn ${answers.hasRained === opt ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setAnswers({...answers, hasRained: opt})}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">How does the soil feel at root depth?</label>
              <div className="flex gap-sm">
                {['Dry', 'Moist', 'Wet'].map(opt => (
                  <button 
                    key={opt}
                    className={`btn ${answers.soilFeel === opt ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, fontSize: '0.85rem' }}
                    onClick={() => setAnswers({...answers, soilFeel: opt})}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Are the leaves showing signs of wilting?</label>
              <div className="flex gap-sm">
                {['Yes', 'No'].map(opt => (
                  <button 
                    key={opt}
                    className={`btn ${answers.isWilting === opt ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setAnswers({...answers, isWilting: opt})}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <button 
              className="btn btn-primary w-full mt-md" 
              onClick={getAdvice}
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Get System Advice'}
            </button>
          </div>
        )}

        {step === 2 && advice && (
          <div className="flex-col gap-lg">
            <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-sm mb-sm">
                <Info size={18} color="var(--primary-color)" />
                <strong style={{ fontSize: '1.1rem' }}>System Recommendation</strong>
              </div>
              
              <div className="flex-col gap-md">
                {/* Irrigation Recommendation */}
                {type === 'Irrigation' ? (
                  <div className="flex-col gap-xs">
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: advice.irrigation.recommendation.includes('No') ? 'var(--text-secondary)' : '#10b981' }}>
                      {advice.irrigation.recommendation}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                       {advice.irrigation.reason}
                    </p>
                  </div>
                ) : (
                  /* Fertilization Recommendation */
                  <div className="flex-col gap-xs">
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: advice.fertilization.recommendation.includes('No') ? 'var(--text-secondary)' : '#f59e0b' }}>
                      {advice.fertilization.recommendation}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                       {advice.fertilization.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Warnings/Business Rules (NFR-5 / BR-3) */}
            {type === 'Irrigation' && answers.soilFeel === 'Wet' && (
              <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#fff7ed', borderRadius: 'var(--radius-sm)', border: '1px solid #ffedd5', color: '#9a3412', fontSize: '0.85rem' }}>
                <AlertTriangle size={18} />
                <span>Safety Rule Alert: Irrigation is suspended when soil is already wet to protect crop health.</span>
              </div>
            )}

            <div className="flex gap-sm">
              <button 
                className="btn btn-secondary flex-1" 
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button 
                className="btn btn-primary flex-2"
                disabled={loading || (type === 'Irrigation' && advice.irrigation.recommendation.includes('No'))}
                onClick={() => recordActivity(type)}
              >
                {loading ? 'Saving...' : `Record ${type} Action`}
              </button>
            </div>
            
            {(type === 'Irrigation' && advice.irrigation.recommendation.includes('No')) && (
               <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                 No action required at this time.
               </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityModal;
