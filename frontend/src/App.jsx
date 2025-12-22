import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Products from './pages/Products';
import PurchaseOrders from './pages/PurchaseOrders';
import Subscriptions from './pages/Subscriptions';
import BillingManagement from './pages/BillingManagement';
import PaymentManagement from './pages/PaymentManagement';
import CurrencyRates from './pages/CurrencyRates';
import ReportsAnalytics from './pages/ReportsAnalytics';
import UserManagement from './pages/UserManagement';
import Notifications from './pages/Notifications';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/products" element={<Products />} />
              <Route path="/orders" element={<PurchaseOrders />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/billing" element={<BillingManagement />} />
              <Route path="/payments" element={<PaymentManagement />} />
              <Route path="/reports" element={<ReportsAnalytics />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/currency" element={<CurrencyRates />} />
              {/* Add other routes as needed */}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
