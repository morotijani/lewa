import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LiveMap from './pages/LiveMap';
import Merchants from './pages/Merchants';
import MerchantLayout from './components/MerchantLayout';
import MerchantDashboard from './pages/merchant/MerchantDashboard';
import MenuManager from './pages/merchant/MenuManager';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="map" element={<LiveMap />} />
          <Route path="merchants" element={<Merchants />} />
          <Route path="orders" element={<div className="p-4">Orders Page (Coming Soon)</div>} />
          <Route path="couriers" element={<div className="p-4">Couriers Page (Coming Soon)</div>} />
          <Route path="settings" element={<div className="p-4">Settings Page (Coming Soon)</div>} />
        </Route>

        {/* Merchant Routes */}
        <Route path="/merchant" element={<MerchantLayout />}>
          <Route index element={<MerchantDashboard />} />
          <Route path="menu" element={<MenuManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;


