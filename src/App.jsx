import React, { useState, useEffect } from 'react';
import { Login } from './pages/Login';

import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { PacientesView } from './pages/PacientesView';
import { Sidebar } from './components/Sidebar';
import { getCurrentSession, logoutNutricionista } from './services/neonAuth';

export function App() {
  const [session, setSession] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register' | 'forgot-password'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'pacientes'
  const [loading, setLoading] = useState(true);

  // Sub-roteamento para a aba de Pacientes
  const [targetPacienteId, setTargetPacienteId] = useState(null);
  const [targetPacienteView, setTargetPacienteView] = useState('list'); // 'list' | 'form' | 'profile'
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Checa sessão persistida no LocalStorage ao carregar
    const activeSession = getCurrentSession();
    if (activeSession) {
      setSession(activeSession);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (user) => {
    setSession({ user });
    setActiveTab('dashboard');
  };

  const handleRegisterSuccess = (user) => {
    setSession({ user });
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    logoutNutricionista();
    setSession(null);
    setAuthView('login');
  };

  const handleOpenPacienteProfile = (pacienteId) => {
    setTargetPacienteId(pacienteId);
    setTargetPacienteView('profile');
    setActiveTab('pacientes');
  };

  const handleOpenNovoPaciente = () => {
    setTargetPacienteId(null);
    setTargetPacienteView('form');
    setActiveTab('pacientes');
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)' }} />
      </div>
    );
  }

  // Se o usuário estiver autenticado, renderiza a estrutura com o Menu Lateral fixo e Área Principal
  if (session) {
    return (
      <div className="app-layout">
        {/* Menu Lateral Fixo com logo Viva Nutri no topo */}
        <Sidebar
          currentTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'pacientes') {
              setTargetPacienteId(null);
              setTargetPacienteView('list');
            }
            setActiveTab(tab);
          }}
          user={session.user}
          onLogout={handleLogout}
        />

        {/* Área Principal de Conteúdo */}
        <main className="app-main-content">
          {activeTab === 'dashboard' ? (
            <Dashboard
              key={`dashboard-${refreshKey}`}
              user={session.user}
              onNavigateToPacientes={() => {
                setTargetPacienteId(null);
                setTargetPacienteView('list');
                setActiveTab('pacientes');
              }}
              onSelectPaciente={handleOpenPacienteProfile}
              onOpenNovoPaciente={handleOpenNovoPaciente}
            />
          ) : (
            <PacientesView
              key={`pacientes-${refreshKey}`}
              user={session.user}
              initialPacienteId={targetPacienteId}
              initialView={targetPacienteView}
              onClearInitialSelection={() => {
                setTargetPacienteId(null);
                setTargetPacienteView('list');
              }}
            />
          )}
        </main>
      </div>
    );
  }

  // Telas de Autenticação
  if (authView === 'register') {
    return (
      <Register
        onSwitchToLogin={() => setAuthView('login')}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

  if (authView === 'forgot-password') {
    return (
      <ForgotPassword
        onSwitchToLogin={() => setAuthView('login')}
      />
    );
  }

  // Default login view (both patient and nutritionist)
  return (
    <Login
      onSwitchToRegister={() => setAuthView('register')}
      onSwitchToForgotPassword={() => setAuthView('forgot-password')}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}

export default App;
