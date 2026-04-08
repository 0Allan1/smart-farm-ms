import React from 'react';
import { Link } from 'react-router-dom';
import { CloudRain, ShieldAlert, Activity, Droplets, Sprout, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const FarmerHome = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [shareCode, setShareCode] = React.useState(null);
  const [requests, setRequests] = React.useState([]);
  const [generating, setGenerating] = React.useState(false);
  const [weather, setWeather] = React.useState(null);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [alertsData, requestsData, weatherData] = await Promise.all([
          api.get('/alerts'),
          api.get('/access/requests'),
          api.get('/weather/current?location=Kigali')
        ]);
        setAlerts(alertsData);
        setRequests(requestsData);
        setWeather(weatherData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const generateCode = async () => {
    setGenerating(true);
    try {
      const data = await api.post('/access/generate');
      setShareCode(data.code);
    } catch (error) {
      alert('Error generating code: ' + (error.response?.data?.error || error.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleRequestStatus = async (accessId, status) => {
    try {
      await api.post('/access/status', { accessId, status });
      // Refresh requests
      const updated = await api.get('/access/requests');
      setRequests(updated);
      if (status === 'APPROVED') alert('Access granted successfully!');
    } catch (error) {
      alert('Error updating request: ' + (error.response?.data?.error || error.message));
    }
  };

  const tasks = [
    { id: 1, crop: 'Maize (Plot A)', task: 'Apply NPK Fertilizer', due: 'Today' },
    { id: 2, crop: 'Beans (Plot B)', task: 'Irrigate 10L/m²', due: 'Tomorrow' },
  ];

  return (
    <div className="animate-fade-in flex-col gap-lg">
      <div className="flex justify-between items-center mb-md">
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Welcome back, {user?.name?.split(' ')[0] || 'Farmer'}! 👋</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Here is your farm summary for today.</p>
        </div>
        
        <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid var(--accent-color)' }}>
          <div className="flex-col">
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weather: {weather?.location || 'Kigali'}</div>
            <div className="flex items-center gap-sm">
              <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{weather ? `${weather.temp}°C` : '--°C'}</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>{weather?.condition || 'Loading...'}</span>
            </div>
            {weather && (
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 600, marginTop: '2px' }}>
                💡 {weather.condition.includes('Rain') ? 'Skip irrigation today' : 'Ideal for field work'}
              </div>
            )}
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: 'var(--radius-md)' }}>
             <CloudRain color="var(--accent-color)" size={36} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Alerts widget */}
        <div className="card">
          <div className="flex justify-between items-center mb-md">
            <h3 className="flex items-center gap-sm mt-0"><ShieldAlert size={20} color="var(--danger-color)" /> Recent Alerts</h3>
            <Link to="/dashboard/alerts" style={{ fontSize: '0.85rem' }}>View All</Link>
          </div>
          <div className="flex-col gap-sm">
            {loading ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Loading alerts...</p>
            ) : alerts.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No new alerts today.</p>
            ) : (
              alerts.slice(0, 3).map(a => (
                <div key={a.id} style={{ 
                  padding: '0.75rem', 
                  borderRadius: 'var(--radius-md)', 
                  borderLeft: `4px solid ${a.severity === 'danger' ? 'var(--danger-color)' : 'var(--secondary-color)'}`,
                  backgroundColor: a.severity === 'danger' ? '#fef2f2' : '#fffbeb'
                }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{a.message}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {new Date(a.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tasks widget */}
        <div className="card">
          <div className="flex justify-between items-center mb-md">
            <h3 className="flex items-center gap-sm mt-0"><Activity size={20} color="var(--primary-color)" /> Pending Tasks</h3>
          </div>
          <div className="flex-col gap-sm">
            {tasks.map(t => (
              <div key={t.id} className="flex justify-between items-center" style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex items-center gap-md">
                  <div style={{ 
                    width: 32, height: 32, 
                    borderRadius: '50%', 
                    backgroundColor: t.task.includes('Irrigate') ? '#dbeafe' : '#d1fae5', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                  }}>
                    {t.task.includes('Irrigate') ? <Droplets size={16} color="var(--accent-color)" /> : <Sprout size={16} color="var(--primary-color)" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t.task}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.crop} • Due {t.due}</div>
                  </div>
                </div>
                <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }}><ChevronRight size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Advisory Context Widget */}
        <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
          <div className="flex justify-between items-center mb-md">
            <h3 className="flex items-center gap-sm mt-0"><Activity size={20} color="var(--primary-color)" /> Advisory Services</h3>
          </div>
          <div className="flex-col gap-sm">
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
              Your Extension Officer is connected. You can see their expert recommendations directly on each crop card in the "My Crops" section.
            </p>
            <Link to="/dashboard/crops" className="btn btn-secondary w-full justify-center mt-md" style={{ fontSize: '0.85rem' }}>
              Check for Advice <ChevronRight size={16} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FarmerHome;
