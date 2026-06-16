import React, { useState } from 'react';
import LandingPage from './components/LandingPage.jsx';
import LoginRegister from './components/LoginRegister.jsx';
import UserDashboard from './components/UserDashboard.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import DoctorDashboard from './components/DoctorDashboard.jsx';

function App() {
  const [view, setView] = useState('landing');
  const [sessionUser, setSessionUser] = useState(null);

  const handleAuth = (user) => {
    setSessionUser(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    setSessionUser(null);
    setView('landing');
  };

  return (
    <>
      {view === 'landing' && <LandingPage onNavigate={setView} />}
      {view === 'auth' && <LoginRegister onAuthSuccess={handleAuth} onBack={() => setView('landing')} />}
      {view === 'dashboard' && sessionUser && (
        sessionUser.role === 'admin' 
          ? <AdminDashboard user={sessionUser} onLogout={handleLogout} />
          : sessionUser.role === 'doctor'
          ? <DoctorDashboard user={sessionUser} onLogout={handleLogout} />
          : <UserDashboard user={sessionUser} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;