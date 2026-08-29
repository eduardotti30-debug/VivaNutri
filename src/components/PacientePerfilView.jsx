import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Edit3, Trash2, Phone, Mail, Calendar, User, Activity, Clock, 
  AlertCircle, CheckCircle2, RefreshCw, FileText, Heart, Plus 
} from 'lucide-react';
import { getPacienteDetails, updatePaciente, deletePaciente } from '../services/neonDb';
import { PacienteForm } from './PacienteForm';

export function PacientePerfilView({ pacienteId, nutricionistaId, onBack, onRefreshData }) {
  const [loading, setLoading] = useState(true);
  const [pacienteData, setPacienteData] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    if (!pacienteId || !nutricionistaId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getPacienteDetails(pacienteId, nutricionistaId);
      setPacienteData(data);
    } catch (err) {
      console.error('Erro ao carregar prontuário do paciente:', err);
      setError('Não foi possível carregar as informações do paciente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [pacienteId, nutricionistaId]);

  const handleSaveEdit = async (updatedFields) => {
    try {
      setLoading(true);
      setError(null);
      await updatePaciente(pacienteId, nutricionistaId, updatedFields);
      setSaveSuccess(true);
      setIsEditing(false);
      await loadData();
      if (onRefreshData) onRefreshData();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Erro ao atualizar paciente:', err);
      setError(err.message || 'Erro ao salvar alterações do paciente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmName = window.prompt(`Para confirmar a exclusão, digite o nome do paciente abaixo:\n"${pacienteData?.paciente?.nome}"`);
    if (confirmName !== pacienteData?.paciente?.nome) {
      if (confirmName !== null) alert('Nome digitado não confere. Exclusão cancelada.');
      return;
    }

    try {
      setIsDeleting(true);
      await deletePaciente(pacienteId, nutricionistaId);
      if (onRefreshData) onRefreshData();
      onBack();
    } catch (err) {
      console.error('Erro ao deletar paciente:', err);
      alert('Erro ao excluir o paciente. Tente novamente.');
      setIsDeleting(false);
    }
  };

  if (loading && !pacienteData) {
    return (
      <div className="view-container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <div className="spinner" style={{ borderTopColor: 'var(--primary)', margin: '0 auto 16px auto', width: '36px', height: '36px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Buscando prontuário no Neon...</p>
      </div>
    );
  }

  if (isEditing && pacienteData?.paciente) {
    return (
      <PacienteForm
        initialData={pacienteData.paciente}
        onSave={handleSaveEdit}
        onCancel={() => setIsEditing(false)}
        loading={loading}
        error={error}
      />
    );
  }

  const p = pacienteData?.paciente || {};
  const consultas = pacienteData?.consultas || [];

  // Idade
  const getAge = (dob) => {
    if (!dob) return null;
    const birth = new Date(dob + 'T00:00:00');
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  const ageVal = getAge(p.data_nascimento);

  return (
    <div className="view-container">
      {/* Top Header Navigation */}
      <div className="perfil-top-nav">
        <button onClick={onBack} className="btn-back">
          <ArrowLeft size={18} />
          <span>Voltar para Lista de Pacientes</span>
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setIsEditing(true)} className="btn-secondary">
            <Edit3 size={16} />
            <span>Editar Prontuário</span>
          </button>
          <button onClick={handleDelete} disabled={isDeleting} className="btn-danger-outline">
            <Trash2 size={16} />
            <span>{isDeleting ? 'Excluindo...' : 'Excluir Paciente'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="alert-success" style={{ marginBottom: '20px' }}>
          <CheckCircle2 size={18} />
          <span>Informações do paciente atualizadas com sucesso!</span>
        </div>
      )}

      {error && (
        <div className="alert-error" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Card Header */}
      <div className="perfil-header-card">
        <div className="perfil-avatar">
          {p.nome?.charAt(0).toUpperCase() || 'P'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 className="perfil-nome">{p.nome}</h1>
            {p.sexo && <span className="badge-tag">{p.sexo}</span>}
            {ageVal !== null && <span className="badge-tag badge-info">{ageVal} anos</span>}
          </div>
          <p className="perfil-sub">
            Cadastrado em {p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : 'Data recente'}
          </p>
        </div>

        {p.whatsapp && (
          <a
            href={`https://wa.me/55${p.whatsapp.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(p.nome)},%20tudo%20bem?`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
            style={{ textDecoration: 'none' }}
          >
            <Phone size={18} />
            <span>Contato WhatsApp</span>
          </a>
        )}
      </div>

      {/* Grid of Sections */}
      <div className="perfil-sections-grid">
        {/* Section 1: Dados Pessoais & Contato */}
        <div className="perfil-box">
          <div className="perfil-box-header">
            <User size={20} color="var(--primary)" />
            <h3>Dados Pessoais & Contato</h3>
          </div>
          <div className="perfil-box-body">
            <div className="info-row">
              <span className="info-label">Nome Completo:</span>
              <span className="info-val">{p.nome || '--'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Data de Nascimento:</span>
              <span className="info-val">
                {p.data_nascimento 
                  ? `${new Date(p.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR')} ${ageVal !== null ? `(${ageVal} anos)` : ''}`
                  : '--'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Sexo:</span>
              <span className="info-val">{p.sexo || '--'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Telefone:</span>
              <span className="info-val">{p.telefone || '--'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">WhatsApp:</span>
              <span className="info-val">{p.whatsapp || '--'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">E-mail:</span>
              <span className="info-val">{p.email || '--'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Avaliação Clínica & IMC */}
        <div className="perfil-box">
          <div className="perfil-box-header">
            <Activity size={20} color="var(--primary)" />
            <h3>Avaliação Clínica & IMC</h3>
          </div>
          <div className="perfil-box-body">
            <div className="info-row">
              <span className="info-label">Peso Atual:</span>
              <span className="info-val">{p.peso_inicial ? `${p.peso_inicial} kg` : '--'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Altura:</span>
              <span className="info-val">{p.altura ? `${p.altura} cm` : '--'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">IMC Calculado:</span>
              <span className="info-val">
                {p.imc ? (
                  <span className="badge-tag badge-success">{p.imc} kg/m²</span>
                ) : (
                  '--'
                )}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Objetivos:</span>
              <span className="info-val">
                {p.objetivos && p.objetivos.length > 0 ? p.objetivos.join(', ') : (p.objetivo_texto || '--')}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Nível de Atividade:</span>
              <span className="info-val">{p.nivel_atividade || '--'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Patologias / Condições:</span>
              <span className="info-val">
                {p.patologias && p.patologias.length > 0 ? p.patologias.join(', ') : 'Nenhuma'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Restrições Alimentares:</span>
              <span className="info-val">
                {p.restricoes_alimentares && p.restricoes_alimentares.length > 0 ? p.restricoes_alimentares.join(', ') : 'Nenhuma'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Alergias Alimentares:</span>
              <span className="info-val">
                {p.alergias && p.alergias.length > 0 ? p.alergias.join(', ') : 'Nenhuma'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Medicamentos Contínuos:</span>
              <span className="info-val">{p.medicamentos || 'Nenhum'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Suplementos em Uso:</span>
              <span className="info-val">{p.suplementos || 'Nenhum'}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Hábitos & Estilo de Vida */}
        <div className="perfil-box span-2">
          <div className="perfil-box-header">
            <Clock size={20} color="var(--primary)" />
            <h3>Hábitos & Estilo de Vida</h3>
          </div>
          <div className="perfil-box-body form-grid">
            <div className="info-row">
              <span className="info-label">Refeições/dia:</span>
              <span className="info-val">{p.refeicoes_por_dia ? `${p.refeicoes_por_dia} refeições` : '--'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Ingestão de Água:</span>
              <span className="info-val">{p.litros_agua ? `${p.litros_agua} litros` : '--'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Horário que Acorda:</span>
              <span className="info-val">{p.horario_acorda || '--'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Horário que Dorme:</span>
              <span className="info-val">{p.horario_dorme || '--'}</span>
            </div>
            <div className="info-row span-2">
              <span className="info-label">Atividade Física:</span>
              <span className="info-val">
                {p.atividade_fisica ? (
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                    Sim {p.atividade_fisica_descricao ? `— ${p.atividade_fisica_descricao}` : ''}
                  </span>
                ) : (
                  'Não pratica regularmente'
                )}
              </span>
            </div>
            <div className="info-row span-2">
              <span className="info-label">Observações Gerais:</span>
              <span className="info-val">{p.observacoes || 'Nenhuma observação cadastrada.'}</span>
            </div>
          </div>
        </div>

        {/* Section 4: Histórico de Consultas */}
        <div className="perfil-box span-2">
          <div className="perfil-box-header">
            <Calendar size={20} color="var(--primary)" />
            <h3>Histórico de Consultas</h3>
            <span className="badge-count" style={{ marginLeft: 'auto' }}>
              {consultas.length} {consultas.length === 1 ? 'consulta' : 'consultas'}
            </span>
          </div>
          <div className="perfil-box-body">
            {consultas.length > 0 ? (
              <div className="consultas-history-list">
                {consultas.map((c) => (
                  <div key={c.id} className="consulta-history-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={16} color="var(--primary)" />
                        {new Date(c.data_consulta + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                      {c.proximo_retorno ? (
                        <span className="badge-tag badge-success">
                          Retorno: {new Date(c.proximo_retorno + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      ) : (
                        <span className="badge-tag badge-warning">Sem retorno agendado</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {c.peso && <span><strong>Peso:</strong> {c.peso} kg</span>}
                      {c.percentual_gordura && <span><strong>% Gordura:</strong> {c.percentual_gordura}%</span>}
                    </div>
                    {c.observacoes && (
                      <p style={{ marginTop: '6px', fontSize: '0.85rem', color: '#475569', fontStyle: 'italic' }}>
                        "{c.observacoes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-mini-box">
                <Calendar size={20} color="var(--text-muted)" />
                <span>Nenhuma consulta cadastrada para este paciente ainda.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
