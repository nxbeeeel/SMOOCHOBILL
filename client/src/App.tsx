import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useOfflineStore } from './store/offlineStore';
import { useWebSocket } from './hooks/useWebSocket';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import POSPage from './pages/POSPage';
import OrdersPage from './pages/OrdersPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

// Components
import Layout from './components/Layout';
import OfflineIndicator from './components/OfflineIndicator';
import LoadingSpinner from './components/LoadingSpinner';

// Services
// import { initializeOfflineSync } from './services/offlineSync';

function App() {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const { isOnline, checkOnlineStatus } = useOfflineStore();
  const { connect, disconnect } = useWebSocket();

  useEffect(() => {
    // Check authentication status on app load
    checkAuth();
    
    // Check online status
    checkOnlineStatus();
    
    // Initialize offline sync - Disabled for production
    // initializeOfflineSync();
    
    // Set up online/offline event listeners
    const handleOnline = () => checkOnlineStatus();
    const handleOffline = () => checkOnlineStatus();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkAuth, checkOnlineStatus]);

  useEffect(() => {
        // Connect to WebSocket when authenticated        
    if (isAuthenticated && user && user.token) {
      connect(user.token);
    } else {
      disconnect();
    }
    
    return () => {
      disconnect();
    };
  }, [isAuthenticated, user, connect, disconnect]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-white text-lg font-medium">Loading Smoocho POS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Offline indicator */}
      {!isOnline && <OfflineIndicator isOnline={isOnline} />}
      
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <Layout>
                <DashboardPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/pos" 
          element={
            isAuthenticated ? (
              <Layout>
                <POSPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/orders" 
          element={
            isAuthenticated ? (
              <Layout>
                <OrdersPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/inventory" 
          element={
            isAuthenticated ? (
              <Layout>
                <InventoryPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/reports" 
          element={
            isAuthenticated ? (
              <Layout>
                <ReportsPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            isAuthenticated ? (
              <Layout>
                <SettingsPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Catch all route */}
        <Route 
          path="*" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
