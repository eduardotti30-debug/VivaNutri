import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, Phone, Mail, Calendar, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { getPacientes } from '../services/neonDb';

export function PacientesView({ user, onSelectPaciente, onOpenNovoPaciente }) {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPacientes(user?.id);
      setPacientes(data);
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err);
      setError('Erro ao conectar ao Neon para listar os pacientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const filteredPacientes = pacientes.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.nome?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.whatsapp?.includes(term)
    );
  });

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestão de Pacientes</h1>
          <p className="page-subtitle">Consulte prontuários, cadastros e históricos clínicos em tempo real.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={loadData} className="btn-icon-refresh" title="Atualizar dados">
            <RefreshCw size={18} className={loading ? 'spinning-icon' : ''} />
          </button>
          <button onClick={onOpenNovoPaciente} className="btn-primary" style={{ width: 'auto', padding: '12px 20px' }}>
            <UserPlus size={18} />
            <span>Novo Paciente</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-card">
        <div className="input-wrapper" style={{ flex: 1 }}>
          <Search size={18} className="input-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por nome, e-mail ou WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="search-count-badge">
          {filteredPacientes.length} {filteredPacientes.length === 1 ? 'paciente' : 'pacientes'}
        </span>
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: '24px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={loadData} className="btn-retry">Tentar novamente</button>
        </div>
      )}

      {/* List / Table */}
      {loading ? (
        <div className="loading-box">
          <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '36px', height: '36px' }} />
          <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Buscando pacientes no Neon...</p>
        </div>
      ) : filteredPacientes.length > 0 ? (
        <div className="pacientes-table-container">
          <table className="pacientes-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Contato</th>
                <th>Objetivo Principal</th>
                <th>Última Consulta</th>
                <th>Status Retorno</th>
                <th style={{ textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredPacientes.map((p) => {
                const hasRetorno = p.proximo_retorno;
                const ultData = p.ultima_consulta 
                  ? new Date(p.ultima_consulta + 'T00:00:00').toLocaleDateString('pt-BR') 
                  : 'Nenhuma';

                return (
                  <tr key={p.id} onClick={() => onSelectPaciente(p.id)} className="table-row-clickable">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="table-avatar">
                          {p.nome?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div>
                          <span className="table-paciente-nome">{p.nome}</span>
                          <span className="table-paciente-sub">
                            {p.sexo || 'Não inf.'} {p.data_nascimento ? `• ${new Date().getFullYear() - new Date(p.data_nascimento).getFullYear()} anos` : ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.85rem' }}>
                        {p.whatsapp && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)' }}>
                            <Phone size={12} /> {p.whatsapp}
                          </span>
                        )}
                        {p.email && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                            <Mail size={12} /> {p.email}
                          </span>
                        )}
                        {!p.whatsapp && !p.email && <span style={{ color: 'var(--text-muted)' }}>Sem contato</span>}
                      </div>
                    </td>
                    <td>
                      <span className="tag-pill">
                        {p.objetivos && p.objetivos.length > 0 ? p.objetivos[0] : (p.objetivo_texto || 'Geral')}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>
                        {ultData}
                      </span>
                    </td>
                    <td>
                      {hasRetorno ? (
                        <span className="badge-tag badge-success">
                          {new Date(p.proximo_retorno + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      ) : (
                        <span className="badge-tag badge-warning">Sem retorno</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-table-action" title="Abrir prontuário">
                        <span>Ver Perfil</span>
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state-card">
          <div className="empty-state-icon">
            <Users size={32} />
          </div>
          <h3>{search ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}</h3>
          <p>
            {search 
              ? 'Tente buscar com outro nome ou termo.' 
              : 'Cadastre o seu primeiro paciente para começar a gerenciar consultas e planos.'}
          </p>
          {!search && (
            <button onClick={onOpenNovoPaciente} className="btn-primary" style={{ width: 'auto', padding: '12px 24px', margin: '0 auto' }}>
              <UserPlus size={18} />
              <span>Cadastrar Primeiro Paciente</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
