import React, { useState, useEffect } from 'react';
import { Droplets, Leaf, MessageSquare, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../utils/api';

const ActivityTimeline = ({ cropId, refreshTrigger }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await api.get(`/activities?cropId=${cropId}`);
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [cropId, refreshTrigger]);

  if (loading) return <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading history...</div>;
  if (activities.length === 0) return <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No activities recorded yet.</div>;

  const displayCount = expanded ? activities.length : 2;

  return (
    <div className="flex-col gap-sm" style={{ marginTop: '0.5rem' }}>
      <div className="flex items-center justify-between">
         <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Recent Activity</span>
         {activities.length > 2 && (
           <button 
             onClick={() => setExpanded(!expanded)}
             style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
           >
             {expanded ? <><ChevronUp size={12}/> Show Less</> : <><ChevronDown size={12}/> View All ({activities.length})</>}
           </button>
         )}
      </div>

      <div className="flex-col gap-xs">
        {activities.slice(0, displayCount).map(activity => (
          <div 
            key={activity.id} 
            style={{ 
              padding: '0.6rem', 
              backgroundColor: '#f8fafc', 
              borderRadius: 'var(--radius-sm)', 
              borderLeft: `3px solid ${activity.type === 'Irrigation' ? '#10b981' : '#f59e0b'}`,
              fontSize: '0.8rem'
            }}
          >
            <div className="flex justify-between items-start mb-xs">
              <div className="flex items-center gap-xs font-bold" style={{ color: 'var(--text-main)' }}>
                {activity.type === 'Irrigation' ? <Droplets size={14} color="#10b981" /> : <Leaf size={14} color="#f59e0b" />}
                {activity.type}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Calendar size={10} /> {new Date(activity.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: '1.4' }}>
              {activity.notes || 'Activity recorded'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
