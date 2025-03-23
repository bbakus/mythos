import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Login from './components/login';
import Dashboard from './components/dashboard';
import Inventory from './components/inventory';
import DeckBuilder from './components/deck-builder';
import Marketplace from './components/marketplace';
import Arena from './components/arena';
import FontLoader from './components/FontLoader';
import './App.css';

// Protected route component that redirects to login if not authenticated
function ProtectedRoute({ children }) {
  const location = useLocation();
  
  // Check if we have user data in the location state
  const isAuthenticated = location.state && location.state.user;
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated, but save the attempted path
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <div className="App">
        <FontLoader />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            <>
              <div className="background-container"></div>
              <div className="login-background">
                <img src="https://preview.redd.it/im-just-in-awe-of-these-epic-fantasy-landscapes-v0-b6w2jk2n27w91.png?width=2304&format=png&auto=webp&s=811341863b534bf90d8e4b3423fcc1fbf0aa06a9"/>
              </div>
              <Login />
            </>
          } />
          
          {/* Protected routes - require authentication */}
          <Route path="/users/:userId/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/users/:userId/inventory" element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          } />
          
          <Route path="/users/:userId/deck-builder" element={
            <ProtectedRoute>
              <DeckBuilder />
            </ProtectedRoute>
          } />
          
          <Route path="/users/:userId/marketplace" element={
            <ProtectedRoute>
              <Marketplace />
            </ProtectedRoute>
          } />
          
          <Route path="/users/:userId/arena" element={
            <ProtectedRoute>
              <Arena />
            </ProtectedRoute>
          } />
          
          {/* Fallback route */}
          <Route path="/" element={<Navigate replace to="/login" />} />
          
          {/* Redirect old routes to new ones with user ID */}
          <Route path="/dashboard" element={<Navigate to="/login" replace />} />
          <Route path="/inventory" element={<Navigate to="/login" replace />} />
          <Route path="/deck-builder" element={<Navigate to="/login" replace />} />
          <Route path="/marketplace" element={<Navigate to="/login" replace />} />
          <Route path="/arena" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
