import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  RefreshCw, 
  ArrowUpRight,
  Sparkles,
  CalendarDays,
  UserCheck,
  Plus
} from 'lucide-react';
import { getDashboardData } from '../services/neonDb';

export function Dashboard({ user, onNavigateToPacientes, onSelectPaciente, onOpenNovoPaciente }) {
  const [stats, setStats] = useState({
    totalPacientes: 0,
    consultasSemana: 0,
    pacientesSemRetorno: [],
    pacientesRecentes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardData(user?.id);
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard no Neon:', err);
      setError('Não foi possível sincronizar os dados com o Neon.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.id]);

  // Formatação amigável da data atual
  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const todayCapitalized = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <div className="dashboard-content">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text-side">
          <div className="welcome-badge">
            <Sparkles size={14} />
            <span>Painel Nutricional em Tempo Real</span>
          </div>
          <h1 className="welcome-title">
            Olá, {user?.nome ? user.nome.split(' ')[0] : 'Nutricionista'}! 👋
          </h1>
          <p className="welcome-subtitle">
            {todayCapitalized} • Acompanhe o fluxo de pacientes e consultas em tempo real.
          </p>
        </div>

        <div className="welcome-actions-side">
          <button 
            onClick={fetchStats} 
            className="btn-glass"
            title="Atualizar métricas do Neon"
          >
            <RefreshCw size={16} className={loading ? 'spinning-icon' : ''} />
            <span>{loading ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
          <button 
            onClick={onOpenNovoPaciente} 
            className="btn-banner-primary"
          >
            <Plus size={18} />
            <span>Novo Paciente</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: '24px' }}>
          <AlertTriangle size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={fetchStats} className="btn-retry">Tentar novamente</button>
        </div>
      )}

      {/* 3 Main Metric Cards as requested in Prompt 3 */}
      <div className="dashboard-cards-grid">
        
        {/* CARD 1 — Total de pacientes ativos */}
        <div 
          className="metric-card metric-card-blue"
          onClick={onNavigateToPacientes}
          role="button"
          tabIndex={0}
          title="Clique para ver a lista completa de pacientes"
        >
          <div className="metric-header">
            <div className="metric-icon-box bg-blue-light">
              <Users size={26} color="var(--primary)" />
            </div>
            <span className="metric-tag">Ativos</span>
          </div>
          <div className="metric-body">
            <span className="metric-label">Total de pacientes ativos</span>
            <div className="metric-value-row">
              <h2 className="metric-number">
                {loading ? <span className="skeleton-number">--</span> : stats.totalPacientes}
              </h2>
              <span className="metric-action-hint">
                Ver todos <ArrowUpRight size={14} />
              </span>
            </div>
          </div>
          <div className="metric-footer">
            <UserCheck size={14} color="var(--primary)" />
            <span>Cadastrados no seu perfil</span>
          </div>
        </div>

        {/* CARD 2 — Consultas da semana */}
        <div className="metric-card metric-card-teal">
          <div className="metric-header">
            <div className="metric-icon-box bg-teal-light">
              <CalendarDays size={26} color="var(--accent)" />
            </div>
            <span className="metric-tag tag-teal">Semana Atual</span>
          </div>
          <div className="metric-body">
            <span className="metric-label">Consultas da semana</span>
            <div className="metric-value-row">
              <h2 className="metric-number">
                {loading ? <span className="skeleton-number">--</span> : stats.consultasSemana}
              </h2>
            </div>
          </div>
          <div className="metric-footer">
            <Clock size={14} color="var(--accent)" />
            <span>Agendadas / realizadas nesta semana</span>
          </div>
        </div>

        {/* Status resumo card auxiliar de status Neon */}
        <div className="metric-card metric-card-status">
          <div className="metric-header">
            <div className="metric-icon-box bg-green-light">
              <CheckCircle2 size={26} color="var(--success)" />
            </div>
            <span className="metric-tag tag-green">Neon PostgreSQL</span>
          </div>
          <div className="metric-body">
            <span className="metric-label">Sincronização Neon</span>
            <div className="metric-value-row">
              <h3 className="metric-status-title">100% Conectado</h3>
            </div>
          </div>
          <div className="metric-footer">
            <div className="status-dot" />
            <span>
              {lastUpdated 
                ? `Última sincronização às ${lastUpdated.toLocaleTimeString('pt-BR')}`
                : 'Conexão ativa com RLS'}
            </span>
          </div>
        </div>

      </div>

      {/* CARD 3 — Pacientes sem retorno */}
      <div className="dashboard-section-container">
        <div className="section-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 className="section-title">Pacientes sem retorno</h2>
              {stats.pacientesSemRetorno.length > 0 && (
                <span className="badge-warning-count">
                  {stats.pacientesSemRetorno.length} pendentes
                </span>
              )}
            </div>
            <p className="section-subtitle">
              Pacientes cuja última consulta foi há mais de 30 dias e que não possuem próximo retorno agendado.
            </p>
          </div>
        </div>

        <div className="card-sem-retorno-container">
          {loading ? (
            <div className="loading-box" style={{ padding: '40px 20px' }}>
              <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '32px', height: '32px' }} />
              <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Verificando consultas no banco Neon...
              </p>
            </div>
          ) : stats.pacientesSemRetorno && stats.pacientesSemRetorno.length > 0 ? (
            <div className="pacientes-sem-retorno-list">
              {stats.pacientesSemRetorno.map((paciente) => {
                const ultData = paciente.ultima_consulta 
                  ? new Date(paciente.ultima_consulta + 'T00:00:00').toLocaleDateString('pt-BR')
                  : 'Nenhuma consulta registrada';

                const dias = paciente.dias_sem_consulta || 30;

                return (
                  <div 
                    key={paciente.id} 
                    className="paciente-sem-retorno-item"
                    onClick={() => onSelectPaciente(paciente.id)}
                    role="button"
                    tabIndex={0}
                    title={`Clique para abrir o perfil de ${paciente.nome}`}
                  >
                    <div className="paciente-item-left">
                      <div className="paciente-avatar-letter">
                        {paciente.nome?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div className="paciente-info">
                        <span className="paciente-nome-link">{paciente.nome}</span>
                        <div className="paciente-meta">
                          <span className="meta-text">
                            <strong>Última consulta:</strong> {ultData}
                          </span>
                          <span className="meta-divider">•</span>
                          <span className="meta-dias-alert">
                            {dias} dias sem retorno
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="paciente-item-right">
                      <button 
                        className="btn-ver-perfil"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPaciente(paciente.id);
                        }}
                      >
                        <span>Ver Perfil</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Mensagem obrigatória caso não haja pacientes sem retorno */
            <div className="sem-retorno-empty-state">
              <div className="empty-check-icon">
                <CheckCircle2 size={36} color="var(--success)" />
              </div>
              <h3 className="empty-check-title">Nenhum paciente sem retorno no momento</h3>
              <p className="empty-check-desc">
                Excelente trabalho! Todos os seus pacientes ativos estão em acompanhamento regular ou com consultas agendadas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
