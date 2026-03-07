import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import all pages
import SignupPage from './pages/SignupPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import CreateMPINPage from './pages/CreateMPINPage';
import LoginPage from './pages/LoginPage';
import PlayerProfileForm from './pages/PlayerProfileForm';
import PlayerDashboard from './pages/PlayerDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="font-sans text-gray-900 bg-gray-50 min-h-screen">
        <Routes>
          {/* Default Route redirects to Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Authentication Flow */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-otp" element={<OTPVerificationPage />} />
          <Route path="/create-mpin" element={<CreateMPINPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Player Routes */}
          {/* Note: In a production app, you would wrap these in a <ProtectedRoute> component */}
          <Route path="/profile-setup" element={<PlayerProfileForm />} />
          <Route path="/player-dashboard" element={<PlayerDashboard />} />

          {/* Staff Routes */}
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;