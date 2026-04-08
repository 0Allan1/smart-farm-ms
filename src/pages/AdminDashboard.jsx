import React, { useState, useEffect } from 'react';
import { Shield, Users, Server, Activity, Settings, Database, MessageSquare, LogOut, Search, Sprout, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('health'); // 'health', 'users', 'broadcast', 'config', 'backups'
  const [stats, setStats] = useState(null);
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [officerForm, setOfficerForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [provisioning, setProvisioning] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'health') {
          const data = await api.get('/admin/stats');
          setStats(data);
        } else if (activeTab === 'users') {
          const data = await api.get('/admin/users');
          setUserList(data);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [activeTab]);

  const handleProvisionOfficer = async (e) => {
    e.preventDefault();
    setProvisioning(true);
    try {
      await api.post('/admin/officers', officerForm);
      setShowProvisionModal(false);
      setOfficerForm({ name: '', phone: '', email: '', password: '' });
      // Refresh user list
      const data = await api.get('/admin/users');
      setUserList(data);
      alert('Extension Officer account successfully provisioned!');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setProvisioning(false);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'health':
        return renderSystemHealth();
      case 'users':
        return renderUserManagement();
      case 'broadcast':
      case 'config':
      case 'backups':
        return renderPlaceholder();
      default:
        return renderSystemHealth();
    }
  };

  const renderSystemHealth = () => (
    <div className="animate-fade-in flex-col gap-lg">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        
        <div className="card flex-col gap-sm" style={{ borderLeft: '4px solid var(--primary-color)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Registered Users</div>
          <div className="flex items-end gap-sm">
            <span style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{loading ? '...' : stats?.totalUsers || 0}</span>
            <span style={{ color: 'var(--primary-color)' }}>Accounts</span>
          </div>
        </div>

        <div className="card flex-col gap-sm" style={{ borderLeft: '4px solid var(--accent-color)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Active Crops</div>
          <div className="flex items-end gap-sm">
            <span style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{loading ? '...' : stats?.activeCrops || 0}</span>
            <span style={{ color: 'var(--text-secondary)' }}>System Wide</span>
          </div>
        </div>

        <div className="card flex-col gap-sm" style={{ borderLeft: '4px solid var(--danger-color)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>System Alerts Generated</div>
          <div className="flex items-end gap-sm">
            <span style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{loading ? '...' : stats?.systemAlerts || 0}</span>
            <span style={{ color: 'var(--primary-color)' }}>Total</span>
          </div>
        </div>

        <div className="card flex-col gap-sm" style={{ borderLeft: '4px solid var(--secondary-color)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Personnel Ratio</div>
          <div className="flex items-end gap-sm">
            <span style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>
              {loading ? '...' : `${stats?.totalFarmers || 0} : ${stats?.totalOfficers || 0}`}
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>(FMR : EXT)</span>
          </div>
        </div>

      </div>

      <div className="card mt-md">
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Recent System Audit Logs (Mock Data)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '0.5rem' }}>Timestamp</th>
              <th style={{ padding: '0.5rem' }}>User / IP</th>
              <th style={{ padding: '0.5rem' }}>Action</th>
              <th style={{ padding: '0.5rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { time: '14:32:11', user: 'Admin (192.168.1.1)', action: 'Viewed Admin Dashboard', status: 'Success' },
              { time: '14:28:40', user: 'System', action: 'Polled OpenWeather API', status: 'Success' },
              { time: '13:05:22', user: 'farmer2 (10.0.0.5)', action: 'User Registration', status: 'Success' },
            ].map((log, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>{log.time}</td>
                <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{log.user}</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>{log.action}</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>
                  <span className={`badge ${log.status === 'Success' ? 'badge-success' : 'badge-danger'}`}>{log.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="animate-fade-in flex-col gap-lg">
      <div className="flex justify-between items-center mb-md">
        <div>
          <h2 style={{ margin: 0 }}>Registered Personnel</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage farmers and extension officers.</p>
        </div>
        <div className="flex gap-sm">
           <div className="relative">
             <Search size={18} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-secondary)' }} />
             <input type="text" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="Search users..." />
           </div>
          <button className="btn btn-primary" onClick={() => setShowProvisionModal(true)}>
            <Users size={16} /> Provision Officer
          </button>
        </div>
      </div>

      {/* Provision Officer Modal */}
      {showProvisionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 480 }}>
            <h2 className="mb-sm" style={{ marginTop: 0 }}>Provision Extension Officer</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Create an official account for a verified government agricultural extension officer.
            </p>
            <form onSubmit={handleProvisionOfficer} className="flex-col gap-md">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" placeholder="e.g. Amina Uwase" value={officerForm.name} onChange={e => setOfficerForm({...officerForm, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" className="form-input" placeholder="e.g. 078xxxxxxx" value={officerForm.phone} onChange={e => setOfficerForm({...officerForm, phone: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email (Optional)</label>
                <input type="email" className="form-input" placeholder="officer@minagri.gov.rw" value={officerForm.email} onChange={e => setOfficerForm({...officerForm, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Temporary Password</label>
                <input type="password" className="form-input" placeholder="Set a secure temporary password" value={officerForm.password} onChange={e => setOfficerForm({...officerForm, password: e.target.value})} required />
              </div>
              <div className="flex gap-sm justify-end mt-md">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProvisionModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={provisioning}>
                  {provisioning ? 'Provisioning...' : 'Create Officer Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Contact</th>
              <th style={{ padding: '1rem' }}>Role</th>
              <th style={{ padding: '1rem' }}>Joined Date</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Stats</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-xl">Loading users...</td></tr>
            ) : userList.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-xl">No users found in the system.</td></tr>
            ) : (
              userList.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover:bg-slate-50">
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{u.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <div>{u.phone}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email || '-'}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${u.role === 'Admin' ? 'bg-indigo-100 text-indigo-800' : u.role === 'Extension Officer' ? 'bg-blue-100 text-blue-800' : 'badge-success'}`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                     {u.role === 'Farmer' ? (
                       <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u._count.farms} Plots</span>
                     ) : u.role === 'Extension Officer' ? (
                       <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u._count.shareCodes} Access Codes</span>
                     ) : (
                       '-'
                     )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPlaceholder = () => (
    <div className="card py-xl text-center flex-col items-center gap-md animate-fade-in">
      <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <Shield size={32} color="var(--text-secondary)" />
      </div>
      <div>
        <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Advanced Module</h2>
        <p style={{ color: 'var(--text-secondary)' }}>This administrative function is scheduled for a future update phase.</p>
      </div>
      <button className="btn btn-secondary" onClick={() => setActiveTab('health')}>Return to Overview</button>
    </div>
  );

  return (
    <div className="dashboard-layout">
      {/* Admin Sidebar */}
      <aside className="sidebar open" style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
        <div className="sidebar-header" style={{ borderBottomColor: '#1e293b' }}>
          <h2 className="flex items-center gap-sm" style={{ color: 'white' }}>
            <Shield color="var(--primary-color)" /> SFMS Admin
          </h2>
        </div>
        <nav className="sidebar-nav flex-col" style={{ color: '#94a3b8' }}>
          
          <div 
            className={`nav-item ${activeTab === 'health' ? 'active' : 'hover:text-white'}`} 
            style={activeTab === 'health' ? { color: 'white', backgroundColor: 'rgba(255,255,255,0.1)', borderRightColor: 'white' } : { cursor: 'pointer', color: '#94a3b8' }}
            onClick={() => setActiveTab('health')}
          >
            <Activity size={20} /> <span>System Health</span>
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'users' ? 'active' : 'hover:text-white'}`} 
            style={activeTab === 'users' ? { color: 'white', backgroundColor: 'rgba(255,255,255,0.1)', borderRightColor: 'white' } : { cursor: 'pointer', color: '#94a3b8' }}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} /> <span>User Management</span>
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'broadcast' ? 'active' : 'hover:text-white'}`} 
            style={activeTab === 'broadcast' ? { color: 'white', backgroundColor: 'rgba(255,255,255,0.1)', borderRightColor: 'white' } : { cursor: 'pointer', color: '#94a3b8' }}
            onClick={() => setActiveTab('broadcast')}
          >
            <MessageSquare size={20} /> <span>Broadcast Alerts</span>
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'config' ? 'active' : 'hover:text-white'}`} 
            style={activeTab === 'config' ? { color: 'white', backgroundColor: 'rgba(255,255,255,0.1)', borderRightColor: 'white' } : { cursor: 'pointer', color: '#94a3b8' }}
            onClick={() => setActiveTab('config')}
          >
            <Settings size={20} /> <span>API Config</span>
          </div>
          
          <div 
            className={`nav-item ${activeTab === 'backups' ? 'active' : 'hover:text-white'}`} 
            style={activeTab === 'backups' ? { color: 'white', backgroundColor: 'rgba(255,255,255,0.1)', borderRightColor: 'white' } : { cursor: 'pointer', color: '#94a3b8' }}
            onClick={() => setActiveTab('backups')}
          >
            <Database size={20} /> <span>Backups</span>
          </div>

        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid #1e293b' }}>
          <button className="btn w-full justify-center" style={{ backgroundColor: '#1e293b', color: 'white' }} onClick={() => navigate('/login')}>
            <LogOut size={16} /> Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-content bg-slate-100">
        <header className="topbar">
          <h1 style={{ fontSize: '1.25rem', margin: 0, textTransform: 'capitalize' }}>
            {activeTab === 'health' ? 'System Health & Overview' : activeTab.replace(/([A-Z])/g, ' $1').trim()}
          </h1>
          <div className="flex items-center gap-sm">
            <span className="badge badge-success">System Online</span>
          </div>
        </header>

        <main className="page-content">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
