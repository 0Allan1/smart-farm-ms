import React from 'react';
import { Bell, CloudLightning, Bug, Droplets, Check, Info } from 'lucide-react';
import api from '../utils/api';

const Alerts = () => {
  const [alerts, setAlerts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const fetchAlerts = async () => {
    try {
      const data = await api.get('/alerts');
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAlerts();
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/alerts/${id}/read`);
      fetchAlerts();
    } catch (error) {
      console.error('Error marking alert read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      // In a real app we'd have a bulk endpoint, for now we can loop or just call a specific bulk route if implemented
      // Assuming we implement a bulk route /alerts/read-all in the future, or just loop through unread ones.
      const unreadAlerts = alerts.filter(a => !a.read);
      await Promise.all(unreadAlerts.map(a => api.patch(`/alerts/${a.id}/read`)));
      fetchAlerts();
    } catch (error) {
      console.error('Error marking all read:', error);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'weather': return <CloudLightning size={20} />;
      case 'pest': return <Bug size={20} />;
      case 'task': return <Droplets size={20} />;
      case 'info': return <Info size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'warning': return 'var(--secondary-color)';
      case 'danger': return 'var(--danger-color)';
      case 'success': return 'var(--primary-color)';
      case 'info': return 'var(--accent-color)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="animate-fade-in flex-col gap-lg">
      <div className="flex justify-between items-center mb-md">
        <div>
          <h1 style={{ margin: 0 }}>System Alerts</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Weather, pest, and task notifications.</p>
        </div>
        <button className="btn btn-secondary" onClick={markAllRead} disabled={loading || alerts.length === 0}>
          <Check size={18} /> Mark all read
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center' }}>Loading alerts...</p>
        ) : !Array.isArray(alerts) || alerts.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center' }}>No alerts yet.</p>
        ) : (
          alerts.map((alert, idx) => (
            <div key={alert.id} className="flex gap-md items-start" style={{ 
              padding: '1.25rem', 
              borderBottom: idx !== alerts.length - 1 ? '1px solid var(--border-color)' : 'none',
              backgroundColor: alert.read ? 'transparent' : '#f8fafc',
              transition: 'background-color var(--transition-fast)',
              cursor: !alert.read ? 'pointer' : 'default'
            }}
            onClick={() => !alert.read && markRead(alert.id)}
            >
              <div style={{ 
                width: 40, height: 40, 
                borderRadius: '50%', 
                backgroundColor: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: getSeverityColor(alert.severity),
                boxShadow: 'var(--shadow-sm)'
              }}>
                {getIcon(alert.type)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div className="flex justify-between items-start mb-xs">
                  <h4 style={{ margin: 0, fontWeight: alert.read ? 500 : 700, color: 'var(--text-primary)' }}>{alert.message}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Source: {alert.type === 'weather' ? 'Weather Service' : 'System Automation'}
                </div>
              </div>
              
              {!alert.read && <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--primary-color)', marginTop: '0.5rem' }}></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alerts;
