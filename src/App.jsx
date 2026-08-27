import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LinkProvider } from './context/LinkContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateLink from './pages/CreateLink';
import MyLinks from './pages/MyLinks';
import Analytics from './pages/Analytics';
import Earnings from './pages/Earnings';
import Profile from './pages/Profile';
import './App.scss';

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if current route is an auth route
  const isAuthRoute = ['/login', '/register'].includes(location.pathname);

  // If authenticated and not on an auth route, show dashboard layouts
  const showDashboardLayout = isAuthenticated && !isAuthRoute;

  return (
    <div className={showDashboardLayout ? 'app-container' : ''}>
      {showDashboardLayout && (
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      )}
      
      <div className={showDashboardLayout ? 'main-layout' : ''}>
        {showDashboardLayout && (
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        )}
        
        <main className={showDashboardLayout ? 'content-wrapper' : ''}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-link"
              element={
                <ProtectedRoute>
                  <CreateLink />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-links"
              element={
                <ProtectedRoute>
                  <MyLinks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/earnings"
              element={
                <ProtectedRoute>
                  <Earnings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LinkProvider>
          <AppContent />
        </LinkProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
