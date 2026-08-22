import React from 'react';
import { Logo } from './Logo';
import { LayoutDashboard, Users, LogOut, UserCircle2, ChevronRight } from 'lucide-react';

export function Sidebar({ currentTab, onSelectTab, user, onLogout }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Visão geral e métricas'
    },
    {
      id: 'pacientes',
      label: 'Pacientes',
      icon: Users,
      description: 'Gestão de prontuários'
    }
  ];

  return (
    <aside className="sidebar-container">
      {/* Top Brand Logo */}
      <div className="sidebar-header">
        <Logo size="small" />
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-nav-section">
        <span className="sidebar-section-title">Menu Principal</span>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={item.description}
              >
                <div className="sidebar-nav-icon-box">
                  <Icon size={20} />
                </div>
                <div className="sidebar-nav-text">
                  <span className="sidebar-nav-label">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} className="sidebar-nav-arrow" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Logout at Bottom */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="sidebar-user-avatar">
            <UserCircle2 size={34} color="var(--primary)" />
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name" title={user?.nome || 'Nutricionista'}>
              {user?.nome || 'Nutricionista'}
            </span>
            <span className="sidebar-user-email" title={user?.email || 'nutri@vivanutri.com'}>
              {user?.email || 'nutri@vivanutri.com'}
            </span>
          </div>
        </div>

        <button onClick={onLogout} className="sidebar-logout-btn" title="Encerrar sessão">
          <LogOut size={18} />
          <span>Sair do sistema</span>
        </button>
      </div>
    </aside>
  );
}
