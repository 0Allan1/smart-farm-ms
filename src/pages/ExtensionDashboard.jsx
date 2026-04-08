import React, { useState } from 'react';
import { Search, MapPin, Users, Download, LogOut, ChevronRight, Contact, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ExtensionDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFarmers = async () => {
    try {
      const data = await api.get('/access/managed');
      setFarmers(data);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFarmers();
  }, []);

  const handleExportAggregate = async () => {
    try {
      const data = await api.get('/reports/aggregate');
      
      if (data.length === 0) {
        alert('No data available to export.');
        return;
      }

      // Flatten data for CSV
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Farmer Name,Crop Name,Variation,Farm,Plot Location,Planted Date,Status,Activity Type,Activity Notes,Date\n";
      
      data.forEach(crop => {
        const farmerName = crop.farm.farmer.name;
        if (crop.activities.length === 0) {
          csvContent += `${farmerName},${crop.name},${crop.variation || ''},${crop.farm.name},${crop.farm.location},${new Date(crop.plantedDate).toLocaleDateString()},${crop.status},N/A,N/A,N/A\n`;
        } else {
          crop.activities.forEach(act => {
            csvContent += `${farmerName},${crop.name},${crop.variation || ''},${crop.farm.name},${crop.farm.location},${new Date(crop.plantedDate).toLocaleDateString()},${crop.status},${act.type},${act.notes || ''},${new Date(act.createdAt).toLocaleDateString()}\n`;
          });
        }
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `officer_aggregate_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    setRedeeming(true);
    try {
      await api.post('/access/redeem', { code: shareCode });
      alert('Access request sent to farmer! They must approve it before you can see their data.');
      setShowModal(false);
      setShareCode('');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setRedeeming(false);
    }
  };

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.farms[0]?.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      {/* Sidebar specific for Extension Officer */}
      <aside className="sidebar open">
        <div className="sidebar-header">
          <h2 className="flex items-center gap-sm">
            <Contact color="var(--primary-color)" /> SFMS
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Extension Portal</div>
        </div>
        <nav className="sidebar-nav flex-col">
          <div className="nav-item active">
            <Users size={20} />
            <span>My Farmers</span>
          </div>
          <div className="nav-item" onClick={handleExportAggregate} style={{ cursor: 'pointer' }}>
            <Download size={20} />
            <span>Aggregate Reports</span>
          </div>
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button className="btn btn-secondary w-full justify-center" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-content" style={{ backgroundColor: 'var(--bg-color)' }}>
        <header className="topbar">
          <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Extension Officer Dashboard</h1>
          <div className="flex items-center gap-sm">
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              O
            </div>
            <span style={{ fontWeight: 500 }}>Officer Profile</span>
          </div>
        </header>

        <main className="page-content animate-fade-in flex-col gap-lg">
          <div className="flex justify-between items-center mb-md">
            <div>
              <h2 style={{ margin: 0 }}>Assigned Farmers</h2>
              <p style={{ color: 'var(--text-secondary)' }}>View and search farmers who have granted you access.</p>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="form-group" style={{ maxWidth: '400px', position: 'relative' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search by name or village..." 
                style={{ paddingLeft: '2.5rem' }} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '0.75rem', top: '0.75rem' }} />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: '0.75rem', top: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Farmer Name</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Location</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Total Farms</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Last Active</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading farmers...</td></tr>
                ) : filteredFarmers.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No farmers match your search "{searchTerm}".</td></tr>
                ) : (
                  filteredFarmers.map(farmer => (
                    <tr key={farmer.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background var(--transition-fast)' }} className="hover:bg-slate-50">
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{farmer.name}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div className="flex items-center gap-xs text-secondary">
                          <MapPin size={16}/> {farmer.farms[0]?.location || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}><span className="badge badge-info">{farmer.farms.length} Plots</span></td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>
                        {farmer.farms.reduce((acc, f) => acc + (f._count?.crops || 0), 0)} Crops
                      </td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.3rem 0.5rem' }}
                          onClick={() => navigate(`/dashboard/farmer/${farmer.id}`)}
                        >
                          View <ChevronRight size={16}/>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExtensionDashboard;
