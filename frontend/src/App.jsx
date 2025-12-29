import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './globals.css';
import 'aos/dist/aos.css';
import AOSWrapper from './hoc/AOSWrapper';
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
import Login from './pages/Auth/Login';
import ProtectedRoute from './components/ProtectedRoute';
import SearchPage from './pages/SearchPage';

function App() {
  return (
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <div className="flex h-screen bg-[var(--soft-purple)]">
                <Sidebar />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header />
                  
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--soft-purple)] p-6">
                    <Dashboard />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/clients" element={
            <ProtectedRoute>
              <div className="flex h-screen bg-[var(--soft-purple)]">
                <Sidebar />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header />
                  
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--soft-purple)] p-6">
                    <Clients />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <div className="flex h-screen bg-[var(--soft-purple)]">
                <Sidebar />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header />
                  
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--soft-purple)] p-6">
                    <Products />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <div className="flex h-screen bg-[var(--soft-purple)]">
                <Sidebar />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header />
                  
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--soft-purple)] p-6">
                    <PurchaseOrders />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/subscriptions" element={
            <ProtectedRoute>
              <div className="flex h-screen bg-[var(--soft-purple)]">
                <Sidebar />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header />
                  
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--soft-purple)] p-6">
                    <Subscriptions />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/billing" element={
            <ProtectedRoute>
              <div className="flex h-screen bg-[var(--soft-purple)]">
                <Sidebar />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header />
                  
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--soft-purple)] p-6">
                    <BillingManagement />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/payments" element={
            <ProtectedRoute>
              <div className="flex h-screen bg-[var(--soft-purple)]">
                <Sidebar />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header />
                  
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--soft-purple)] p-6">
                    <PaymentManagement />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <div className="flex h-screen bg-[var(--soft-purple)]">
                <Sidebar />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header />
                  
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--soft-purple)] p-6">
                    <ReportsAnalytics />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <div className="flex h-screen bg-[var(--soft-purple)]">
                <Sidebar />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header />
                  
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--soft-purple)] p-6">
                    <UserManagement />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <div className="flex h-screen bg-[var(--soft-purple)]">
                <Sidebar />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header />
                  
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--soft-purple)] p-6">
                    <Notifications />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/currency" element={
            <ProtectedRoute>
              <div className="flex h-screen bg-[var(--soft-purple)]">
                <Sidebar />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header />
                  
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--soft-purple)] p-6">
                    <CurrencyRates />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/search" element={
            <ProtectedRoute>
              <div className="flex h-screen bg-[var(--soft-purple)]">
                <Sidebar />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header />
                  
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--soft-purple)] p-6">
                    <SearchPage />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
  );
}

export default App;