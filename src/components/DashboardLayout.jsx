import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Sprout, Tractor, Bell, BarChart2, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'My Farms', path: '/dashboard/farms', icon: <Tractor size={20} /> },
    { name: 'Crops', path: '/dashboard/crops', icon: <Sprout size={20} /> },
    { name: 'Alerts', path: '/dashboard/alerts', icon: <Bell size={20} /> },
    { name: 'Reports', path: '/dashboard/reports', icon: <BarChart2 size={20} /> },
  ];

  return (
    <div className="dashboard-layout">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header flex justify-between items-center">
          <h2 className="flex items-center gap-sm">
            <Sprout color="var(--primary-color)" /> SFMS
          </h2>
          <button className="mobile-toggle sm:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="sidebar-nav flex-col">
          {navItems.map((item) => (
            <NavLink 
              key={item.name} 
              to={item.path} 
              end={item.path === '/dashboard'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button className="btn btn-secondary w-full justify-center" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-content">
        <header className="topbar">
          <div className="flex items-center gap-md">
            <button className="mobile-toggle" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 style={{ fontSize: '1.25rem', margin: 0, display: 'none' }} className="md-block">Farmer Portal</h1>
          </div>
          
          <div className="flex items-center gap-md">
            <button style={{ background: 'none', border: 'none', position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color="var(--text-secondary)" />
              <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--danger-color)', color: 'white', fontSize: '0.6rem', borderRadius: '50%', padding: '0.1rem 0.3rem', fontWeight: 'bold' }}>3</span>
            </button>
            <div className="flex items-center gap-sm" style={{ cursor: 'pointer' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span style={{ fontWeight: 500 }} className="hidden md-block">{user?.name || 'User'}</span>
            </div>
          </div>
        </header>
        
        <main className="page-content bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
