import React from 'react';
import { Logo } from '../components/Logo';
import { LogOut, Users, Calendar, FileText, Activity, ShieldCheck } from 'lucide-react';

export function Dashboard({ user, onLogout }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2e8f0',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <Logo size="small" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontWeight: 700, color: 'var(--primary-dark)', fontSize: '0.95rem' }}>
              {user?.nome || 'Nutricionista'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {user?.email || 'nutri@vivanutri.com'}
            </span>
          </div>

          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.color = '#475569';
            }}
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px 32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Welcome Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '32px 40px',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px' }}>
              Bem-vinda de volta, {user?.nome?.split(' ')[0] || 'Nutricionista'}! 👋
            </h2>
            <p style={{ opacity: 0.9, fontSize: '1rem', maxWidth: '600px' }}>
              Sua sessão do <strong>Neon Auth</strong> está ativa e com <strong>RLS configurado</strong> no banco PostgreSQL.
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}
        >
          <div style={cardStyle}>
            <div style={{ ...iconBoxStyle, background: '#e0f2fe', color: '#0284c7' }}>
              <Users size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pacientes Ativos</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>--</h3>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ ...iconBoxStyle, background: '#ccfbf1', color: '#0d9488' }}>
              <Calendar size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Consultas do Mês</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>--</h3>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ ...iconBoxStyle, background: '#fef3c7', color: '#d97706' }}>
              <FileText size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Planos Criados</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>--</h3>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ ...iconBoxStyle, background: '#dcfce7', color: '#16a34a' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Neon Auth RLS</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#16a34a', marginTop: '4px' }}>Habilitado</h3>
            </div>
          </div>
        </div>

        {/* Empty State Banner */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '48px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#f1f5f9',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              marginBottom: '16px'
            }}
          >
            <Activity size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            Pronta para iniciar os atendimentos?
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 24px auto' }}>
            Autenticação concluída com sucesso! Os próximos módulos permitirão cadastrar pacientes e planejar dietas.
          </p>
        </div>
      </main>
    </div>
  );
}

const cardStyle = {
  background: '#ffffff',
  padding: '20px 24px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  boxShadow: 'var(--shadow-sm)'
};

const iconBoxStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};
