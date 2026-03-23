import React, { useState, useEffect } from 'react';
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
import ClubSetup from './components/ClubSetup';
import RefereeDashboard from './pages/RefereeDashboard';

function App() {
  // 🌟 CENTRAL STATE: This is the source of truth for the whole app
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('currentUser')));

  // 🌟 REFRESH FUNCTION: Call this whenever localStorage is updated (Login or Logout)
  const refreshUser = () => {
    const updatedUser = JSON.parse(localStorage.getItem('currentUser'));
    setUser(updatedUser);
  };

  // AuthChecker: Redirects logged-in users away from Login/Signup pages
  const AuthChecker = ({ children }) => {
    if (user) {
      if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
      if (user.role === 'manager') return <Navigate to={user.club_id ? "/manager-dashboard" : "/club-setup"} replace />;
      if (user.role === 'referee') return <Navigate to="/referee-dashboard" replace />; 
      if (user.role === 'player') return <Navigate to={user.name ? "/player-dashboard" : "/profile-setup"} replace />;
    }
    return children;
  };

  // Manager Route Protector
  const ManagerRoute = () => {
    if (user?.role === 'manager') {
      return <ManagerDashboard clubId={user.club_id} onLogoutSuccess={refreshUser} />;
    }
    return <Navigate to="/login" replace />;
  };

  // Referee Route Protector
  const RefereeRoute = () => {
    if (user?.role === 'referee') {
      // 🌟 Pass refreshUser as onLogoutSuccess
      return <RefereeDashboard user={user} onLogoutSuccess={refreshUser} />;
    }
    return <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <div className="font-sans text-gray-900 bg-gray-50 min-h-screen">
        <Routes>
          
          {/* Default Route */}
          <Route path="/" element={<AuthChecker><Navigate to="/login" replace /></AuthChecker>} />

          {/* Authentication Flow */}
          <Route path="/login" element={<AuthChecker><LoginPage onLoginSuccess={refreshUser} /></AuthChecker>} />
          <Route path="/signup" element={<AuthChecker><SignupPage /></AuthChecker>} />
          <Route path="/verify-otp" element={<AuthChecker><OTPVerificationPage /></AuthChecker>} />
          <Route path="/create-mpin" element={<AuthChecker><CreateMPINPage /></AuthChecker>} />
          
          {/* Dashboard & Setup Routes */}
          <Route path="/club-setup" element={user?.role === 'manager' ? <ClubSetup /> : <Navigate to="/login" />} />
          <Route path="/profile-setup" element={user?.role === 'player' ? <PlayerProfileForm /> : <Navigate to="/login" />} />
          
          <Route path="/player-dashboard" element={user?.role === 'player' ? <PlayerDashboard user={user} onLogoutSuccess={refreshUser} /> : <Navigate to="/login" />} />
          
          {/* 🌟 Protected Referee Route */}
          <Route path="/referee-dashboard" element={<RefereeRoute />} />

          {/* Protected Manager Route */}
          <Route path="/manager-dashboard" element={<ManagerRoute />} />
          
          {/* Admin Dashboard */}
          <Route path="/admin-dashboard" element={user?.role === 'admin' ? <AdminDashboard user={user} onLogoutSuccess={refreshUser} /> : <Navigate to="/login" />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;