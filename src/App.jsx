import React, { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { PacientesView } from './pages/PacientesView';
import { Sidebar } from './components/Sidebar';
import { PacienteDetailModal } from './components/PacienteDetailModal';
import { NovoPacienteModal } from './components/NovoPacienteModal';
import { getCurrentSession, logoutNutricionista } from './services/neonAuth';

export function App() {
  const [session, setSession] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register' | 'forgot-password'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'pacientes'
  const [loading, setLoading] = useState(true);

  // Modais
  const [selectedPacienteId, setSelectedPacienteId] = useState(null);
  const [isNovoPacienteOpen, setIsNovoPacienteOpen] = useState(false);
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
    setSelectedPacienteId(pacienteId);
  };

  const handlePacienteCreated = () => {
    setRefreshKey((prev) => prev + 1);
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
          onSelectTab={setActiveTab}
          user={session.user}
          onLogout={handleLogout}
        />

        {/* Área Principal de Conteúdo */}
        <main className="app-main-content">
          {activeTab === 'dashboard' ? (
            <Dashboard
              key={`dashboard-${refreshKey}`}
              user={session.user}
              onNavigateToPacientes={() => setActiveTab('pacientes')}
              onSelectPaciente={handleOpenPacienteProfile}
              onOpenNovoPaciente={() => setIsNovoPacienteOpen(true)}
            />
          ) : (
            <PacientesView
              key={`pacientes-${refreshKey}`}
              user={session.user}
              onSelectPaciente={handleOpenPacienteProfile}
              onOpenNovoPaciente={() => setIsNovoPacienteOpen(true)}
            />
          )}
        </main>

        {/* Modal de Detalhes / Perfil do Paciente */}
        {selectedPacienteId && (
          <PacienteDetailModal
            pacienteId={selectedPacienteId}
            nutricionistaId={session.user?.id}
            onClose={() => setSelectedPacienteId(null)}
            onRefreshData={handlePacienteCreated}
          />
        )}

        {/* Modal para Cadastro de Novo Paciente */}
        {isNovoPacienteOpen && (
          <NovoPacienteModal
            nutricionistaId={session.user?.id}
            onClose={() => setIsNovoPacienteOpen(false)}
            onSuccess={handlePacienteCreated}
          />
        )}
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

  return (
    <Login
      onSwitchToRegister={() => setAuthView('register')}
      onSwitchToForgotPassword={() => setAuthView('forgot-password')}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}

export default App;
