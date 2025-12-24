import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './globals.css';
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
                    <AOSWrapper>
                      <div data-aos="fade-up" data-aos-duration="800" className="shadow-3d">
                        <Dashboard />
                      </div>
                    </AOSWrapper>
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
                    <AOSWrapper>
                      <div data-aos="fade-up" className="shadow-3d">
                        <Clients />
                      </div>
                    </AOSWrapper>
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
                    <AOSWrapper>
                      <div data-aos="fade-up" className="shadow-3d">
                        <Products />
                      </div>
                    </AOSWrapper>
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
                    <AOSWrapper>
                      <div data-aos="fade-up" className="shadow-3d">
                        <PurchaseOrders />
                      </div>
                    </AOSWrapper>
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
                    <AOSWrapper>
                      <div data-aos="fade-up" className="shadow-3d">
                        <Subscriptions />
                      </div>
                    </AOSWrapper>
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
                    <AOSWrapper>
                      <div data-aos="fade-up" className="shadow-3d">
                        <BillingManagement />
                      </div>
                    </AOSWrapper>
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
                    <AOSWrapper>
                      <div data-aos="fade-up" className="shadow-3d">
                        <PaymentManagement />
                      </div>
                    </AOSWrapper>
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
                    <AOSWrapper>
                      <div data-aos="fade-up" className="shadow-3d">
                        <ReportsAnalytics />
                      </div>
                    </AOSWrapper>
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
                    <AOSWrapper>
                      <div data-aos="fade-up" className="shadow-3d">
                        <UserManagement />
                      </div>
                    </AOSWrapper>
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
                    <AOSWrapper>
                      <div data-aos="fade-up" className="shadow-3d">
                        <Notifications />
                      </div>
                    </AOSWrapper>
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
                    <AOSWrapper>
                      <div data-aos="fade-up" className="shadow-3d">
                        <CurrencyRates />
                      </div>
                    </AOSWrapper>
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
