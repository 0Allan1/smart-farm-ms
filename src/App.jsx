import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Layouts
import DashboardLayout from './components/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerHome from './pages/FarmerHome';
import Farms from './pages/Farms';
import Crops from './pages/Crops';
import FarmDetail from './pages/FarmDetail';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import ExtensionDashboard from './pages/ExtensionDashboard';
import ExtensionFarmerView from './pages/ExtensionFarmerView';
import AdminDashboard from './pages/AdminDashboard';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard Routes wrapper */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<FarmerHome />} />
              <Route path="farms" element={<Farms />} />
              <Route path="farms/:farmId" element={<FarmDetail />} />
              <Route path="crops" element={<Crops />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="reports" element={<Reports />} />
            </Route>
            
            <Route path="/extension" element={<ExtensionDashboard />} />
            <Route path="/dashboard/farmer/:farmerId" element={<DashboardLayout />}>
              <Route index element={<ExtensionFarmerView />} />
            </Route>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
