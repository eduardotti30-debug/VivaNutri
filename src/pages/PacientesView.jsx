import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, Phone, Mail, Calendar, ChevronRight, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getPacientes, createPaciente } from '../services/neonDb';
import { PacienteForm } from '../components/PacienteForm';
import { PacientePerfilView } from '../components/PacientePerfilView';

export function PacientesView({ user, initialPacienteId = null, initialView = 'list', onClearInitialSelection }) {
  const [currentView, setCurrentView] = useState(initialView); // 'list' | 'form' | 'profile'
  const [selectedPacienteId, setSelectedPacienteId] = useState(initialPacienteId);
  
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (initialPacienteId) {
      setSelectedPacienteId(initialPacienteId);
      setCurrentView('profile');
    } else if (initialView) {
      setCurrentView(initialView);
    }
  }, [initialPacienteId, initialView]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPacientes(user?.id);
      setPacientes(data);
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err);
      setError('Erro ao conectar ao banco Neon para listar os pacientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  // Handler para cadastrar novo paciente pelo formulário em 3 abas
  const handleSaveNovoPaciente = async (formDataPayload) => {
    try {
      setSaving(true);
      setError(null);
      const payload = {
        ...formDataPayload,
        nutricionista_id: user?.id
      };

      const newPac = await createPaciente(payload);

      setSuccessMessage(`Paciente "${newPac.nome}" cadastrado com sucesso!`);
      await loadData();

      // Redireciona para o perfil do paciente recém cadastrado
      setSelectedPacienteId(newPac.id);
      setCurrentView('profile');

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Erro ao cadastrar paciente:', err);
      setError(err.message || 'Erro ao cadastrar paciente no banco de dados Neon.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenProfile = (id) => {
    setSelectedPacienteId(id);
    setCurrentView('profile');
  };

  const handleBackToList = () => {
    setSelectedPacienteId(null);
    setCurrentView('list');
    if (onClearInitialSelection) onClearInitialSelection();
    loadData();
  };

  // 1. VIEW: FORMULÁRIO DE CADASTRO
  if (currentView === 'form') {
    return (
      <div className="view-container">
        <PacienteForm
          initialData={null}
          onSave={handleSaveNovoPaciente}
          onCancel={handleBackToList}
          loading={saving}
          error={error}
        />
      </div>
    );
  }

  // 2. VIEW: PERFIL / PRONTUÁRIO DO PACIENTE
  if (currentView === 'profile' && selectedPacienteId) {
    return (
      <PacientePerfilView
        pacienteId={selectedPacienteId}
        nutricionistaId={user?.id}
        onBack={handleBackToList}
        onRefreshData={loadData}
      />
    );
  }

  // 3. VIEW: LISTAGEM DE PACIENTES
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
      {/* Toast / Mensagem de Sucesso */}
      {successMessage && (
        <div className="alert-success" style={{ marginBottom: '20px' }}>
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestão de Pacientes</h1>
          <p className="page-subtitle">Consulte prontuários, cadastre novos pacientes e edite cadastros.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={loadData} className="btn-icon-refresh" title="Atualizar dados">
            <RefreshCw size={18} className={loading ? 'spinning-icon' : ''} />
          </button>
          <button
            onClick={() => setCurrentView('form')}
            className="btn-primary"
            style={{ width: 'auto', padding: '12px 20px' }}
          >
            <UserPlus size={18} />
            <span>Novo Paciente</span>
          </button>
        </div>
      </div>

      {/* Campo de busca por nome no topo da listagem */}
      <div className="search-card">
        <div className="input-wrapper" style={{ flex: 1 }}>
          <Search size={18} className="input-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar paciente por nome..."
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

      {/* Listagem de Pacientes */}
      {loading ? (
        <div className="loading-box">
          <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: '36px', height: '36px' }} />
          <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Carregando pacientes do Neon...</p>
        </div>
      ) : filteredPacientes.length > 0 ? (
        <div className="pacientes-table-container">
          <table className="pacientes-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Objetivo Principal</th>
                <th>Última Consulta</th>
                <th style={{ textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredPacientes.map((p) => {
                const ultData = p.ultima_consulta 
                  ? new Date(p.ultima_consulta + 'T00:00:00').toLocaleDateString('pt-BR') 
                  : 'Nenhuma consulta';

                const objText = p.objetivos && p.objetivos.length > 0 
                  ? p.objetivos[0] 
                  : (p.objetivo_texto || 'Saúde Geral');

                return (
                  <tr key={p.id} onClick={() => handleOpenProfile(p.id)} className="table-row-clickable">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="table-avatar">
                          {p.nome?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div>
                          <span className="table-paciente-nome">{p.nome}</span>
                          <span className="table-paciente-sub">
                            {p.sexo || 'Não inf.'} {p.whatsapp ? `• ${p.whatsapp}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="tag-pill">
                        {objText}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>
                        {ultData}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-table-action" title="Abrir perfil do paciente">
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
        /* Se não houver pacientes cadastrados, exibir a mensagem "Nenhum paciente cadastrado ainda" */
        <div className="empty-state-card">
          <div className="empty-state-icon">
            <Users size={32} />
          </div>
          <h3>
            {search ? 'Nenhum paciente encontrado com essa busca' : 'Nenhum paciente cadastrado ainda'}
          </h3>
          <p>
            {search 
              ? 'Tente ajustar os termos de busca para encontrar o paciente.' 
              : 'Clique no botão abaixo para realizar o seu primeiro cadastro de paciente.'}
          </p>
          {!search && (
            <button
              onClick={() => setCurrentView('form')}
              className="btn-primary"
              style={{ width: 'auto', padding: '12px 24px', margin: '0 auto' }}
            >
              <UserPlus size={18} />
              <span>Cadastrar Primeiro Paciente</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
