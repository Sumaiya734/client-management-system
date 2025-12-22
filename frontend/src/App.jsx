import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Clients from './pages/ClientManagement/Clients';
import Products from './pages/Products&Pricing/Products';
import PurchaseOrders from './pages/PurchaseOrders/index';
import Subscriptions from './pages/Subscriptions/index';
import BillingManagement from './pages/BillingManagement/index';
import PaymentManagement from './pages/PaymentManagement/index';
import CurrencyRates from './pages/Currency&Rates/index';
import ReportsAnalytics from './pages/Reports&Analytics/index';
import UserManagement from './pages/UserManagement/index';
import Notifications from './pages/Notifications/index';

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
