import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LiveMap from './pages/LiveMap';
import Merchants from './pages/Merchants';
import MerchantLayout from './components/MerchantLayout';
import MerchantDashboard from './pages/merchant/MerchantDashboard';
import MenuManager from './pages/merchant/MenuManager';
import MerchantRegister from './pages/MerchantRegister';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {

  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to={user?.role === 'merchant' ? '/merchant' : '/'} replace />;

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register-merchant" element={<MerchantRegister />} />

          {/* Admin Routes */}
          <Route path="/" element={
            <ProtectedRoute role="admin">
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="map" element={<LiveMap />} />
            <Route path="merchants" element={<Merchants />} />
            <Route path="orders" element={<div className="p-4">Orders Page (Coming Soon)</div>} />
            <Route path="couriers" element={<div className="p-4">Couriers Page (Coming Soon)</div>} />
            <Route path="settings" element={<div className="p-4">Settings Page (Coming Soon)</div>} />
          </Route>

          {/* Merchant Routes */}
          <Route path="/merchant" element={
            <ProtectedRoute role="merchant">
              <MerchantLayout />
            </ProtectedRoute>
          }>
            <Route index element={<MerchantDashboard />} />
            <Route path="menu" element={<MenuManager />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


export default App;


