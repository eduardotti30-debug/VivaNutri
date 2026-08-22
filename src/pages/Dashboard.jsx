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
  Plus,
  MessageCircle,
  TrendingUp,
  Activity,
  HeartPulse
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

  // Saudação dinâmica com base no horário
  const currentHour = new Date().getHours();
  let greeting = 'Bom dia';
  if (currentHour >= 12 && currentHour < 18) {
    greeting = 'Boa tarde';
  } else if (currentHour >= 18 || currentHour < 5) {
    greeting = 'Boa noite';
  }

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
      {/* Welcome Hero Banner */}
      <div className="welcome-banner">
        <div className="welcome-text-side">
          <div className="welcome-badge">
            <Sparkles size={14} />
            <span>Gestão Inteligente & Nutrição Clínica</span>
          </div>
          <h1 className="welcome-title">
            {greeting}, {user?.nome ? user.nome.split(' ')[0] : 'Nutricionista'}! 👋
          </h1>
          <p className="welcome-subtitle">
            {todayCapitalized} • Seus prontuários e métricas em tempo real no Neon.
          </p>
        </div>

        <div className="welcome-actions-side">
          <button 
            onClick={fetchStats} 
            className="btn-glass"
            title="Atualizar métricas do banco"
          >
            <RefreshCw size={16} className={loading ? 'spinning-icon' : ''} />
            <span>{loading ? 'Atualizando...' : 'Sincronizar'}</span>
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
          className="metric-card"
          onClick={onNavigateToPacientes}
          role="button"
          tabIndex={0}
          title="Ver todos os pacientes cadastrados"
        >
          <div className="metric-header">
            <div className="metric-icon-box bg-blue-light">
              <Users size={26} color="var(--primary)" />
            </div>
            <span className="metric-tag">
              <TrendingUp size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Ativos
            </span>
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
            <UserCheck size={15} color="var(--primary)" />
            <span>Cadastrados no seu perfil</span>
          </div>
        </div>

        {/* CARD 2 — Consultas da semana */}
        <div className="metric-card">
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
            <Clock size={15} color="var(--accent)" />
            <span>Atendimentos agendados ou concluídos</span>
          </div>
        </div>

        {/* Status resumo card auxiliar de status Neon */}
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon-box bg-green-light">
              <HeartPulse size={26} color="var(--success)" />
            </div>
            <span className="metric-tag tag-green">Neon RLS</span>
          </div>
          <div className="metric-body">
            <span className="metric-label">Banco de Dados Neon</span>
            <div className="metric-value-row">
              <h3 className="metric-status-title">100% Conectado</h3>
            </div>
          </div>
          <div className="metric-footer">
            <div className="status-dot" />
            <span>
              {lastUpdated 
                ? `Atualizado às ${lastUpdated.toLocaleTimeString('pt-BR')}`
                : 'Conexão em tempo real'}
            </span>
          </div>
        </div>

      </div>

      {/* CARD 3 — Pacientes sem retorno */}
      <div className="dashboard-section-container">
        <div className="section-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 className="section-title">Pacientes sem retorno</h2>
              {stats.pacientesSemRetorno.length > 0 && (
                <span className="badge-warning-count">
                  {stats.pacientesSemRetorno.length} necessitam atenção
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
            <div className="loading-box" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '32px', height: '32px', margin: '0 auto' }} />
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
                          <span style={{ color: '#cbd5e1' }}>•</span>
                          <span className="meta-dias-alert">
                            {dias} dias sem consulta
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="paciente-item-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {paciente.whatsapp && (
                        <a
                          href={`https://wa.me/55${paciente.whatsapp.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(paciente.nome)},%20tudo%20bem?%20Passando%20para%20acompanhar%20sua%20evolução%20nutricional.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ver-perfil"
                          style={{ borderColor: '#86efac', color: '#059669', background: '#f0fdf4' }}
                          onClick={(e) => e.stopPropagation()}
                          title="Chamar no WhatsApp"
                        >
                          <MessageCircle size={15} />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      <button 
                        className="btn-ver-perfil"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPaciente(paciente.id);
                        }}
                      >
                        <span>Prontuário</span>
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
                <CheckCircle2 size={36} color="var(--accent)" />
              </div>
              <h3 className="empty-check-title">Nenhum paciente sem retorno no momento</h3>
              <p className="empty-check-desc">
                Excelente! Todos os seus pacientes ativos estão em acompanhamento regular com retornos agendados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
