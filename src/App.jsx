import React, { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { getCurrentSession, logoutNutricionista } from './services/neonAuth';

export function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState('login'); // 'login' | 'register' | 'dashboard'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Checa sessão persistida no LocalStorage ao carregar
    const activeSession = getCurrentSession();
    if (activeSession) {
      setSession(activeSession);
      setView('dashboard');
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (user) => {
    setSession({ user });
    setView('dashboard');
  };

  const handleRegisterSuccess = (user) => {
    setSession({ user });
    setView('dashboard');
  };

  const handleLogout = () => {
    logoutNutricionista();
    setSession(null);
    setView('login');
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)' }} />
      </div>
    );
  }

  // Redirecionamento automático: Se já estiver logado, não permite telas de login/cadastro
  if (session && view !== 'dashboard') {
    return <Dashboard user={session.user} onLogout={handleLogout} />;
  }

  if (view === 'dashboard') {
    return <Dashboard user={session?.user} onLogout={handleLogout} />;
  }

  if (view === 'register') {
    return (
      <Register
        onSwitchToLogin={() => setView('login')}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

  return (
    <Login
      onSwitchToRegister={() => setView('register')}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}

export default App;
