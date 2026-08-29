import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Edit3, Trash2, Phone, Mail, Calendar, User, Activity, Clock, 
  AlertCircle, CheckCircle2, RefreshCw, FileText, Heart, Plus, X,
  TrendingDown, TrendingUp, Sparkles, Scale, Percent, Compass, ChevronRight
} from 'lucide-react';
import { getPacienteDetails, updatePaciente, deletePaciente, createConsulta } from '../services/neonDb';

export function PacientePerfilView({ pacienteId, nutricionistaId, onBack, onRefreshData }) {
  const [loading, setLoading] = useState(true);
  const [pacienteData, setPacienteData] = useState(null);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tabs do Perfil: 'dados' | 'consultas' | 'planos'
  const [activeSection, setActiveSection] = useState('dados');

  // Sub-abas de dados do paciente (Seção 1): 'pessoal' | 'clinico' | 'habitos'
  const [dadosTab, setDadosTab] = useState('pessoal');

  // Estado do formulário editável inline de Dados do Paciente
  const [formData, setFormData] = useState({});
  const [savingDados, setSavingDados] = useState(false);
  const [dadosSuccess, setDadosSuccess] = useState(false);

  // Modal Nova Consulta
  const [showConsultaModal, setShowConsultaModal] = useState(false);
  const [savingConsulta, setSavingConsulta] = useState(false);
  const [consultaSuccess, setConsultaSuccess] = useState(false);
  const [consultaForm, setConsultaForm] = useState({
    data_consulta: new Date().toISOString().split('T')[0],
    peso: '',
    cintura: '',
    quadril: '',
    percentual_gordura: '',
    observacoes: '',
    proximo_retorno: ''
  });

  // Modal / Visualização de Plano Alimentar do Histórico
  const [selectedPlano, setSelectedPlano] = useState(null);

  const loadData = async () => {
    if (!pacienteId || !nutricionistaId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getPacienteDetails(pacienteId, nutricionistaId);
      setPacienteData(data);
      if (data?.paciente) {
        initFormData(data.paciente);
      }
    } catch (err) {
      console.error('Erro ao carregar prontuário do paciente:', err);
      setError('Não foi possível carregar as informações do paciente no Neon.');
    } finally {
      setLoading(false);
    }
  };

  const initFormData = (p) => {
    setFormData({
      nome: p.nome || '',
      data_nascimento: p.data_nascimento || '',
      sexo: p.sexo || 'Feminino',
      telefone: p.telefone || '',
      whatsapp: p.whatsapp || '',
      email: p.email || '',

      peso_inicial: p.peso_inicial !== null && p.peso_inicial !== undefined ? String(p.peso_inicial) : '',
      altura: p.altura !== null && p.altura !== undefined ? String(p.altura) : '',
      objetivos: Array.isArray(p.objetivos) ? p.objetivos : [],
      objetivo_texto: p.objetivo_texto || '',
      nivel_atividade: p.nivel_atividade || 'Moderadamente ativo',
      patologias: Array.isArray(p.patologias) ? p.patologias : [],
      patologias_extra: '',
      restricoes_alimentares: Array.isArray(p.restricoes_alimentares) ? p.restricoes_alimentares : [],
      restricoes_extra: '',
      alergias: Array.isArray(p.alergias) ? p.alergias : [],
      alergias_extra: '',
      medicamentos: p.medicamentos || '',
      suplementos: p.suplementos || '',

      refeicoes_por_dia: p.refeicoes_por_dia !== null && p.refeicoes_por_dia !== undefined ? String(p.refeicoes_por_dia) : '4',
      horario_acorda: p.horario_acorda || '07:00',
      horario_dorme: p.horario_dorme || '23:00',
      litros_agua: p.litros_agua !== null && p.litros_agua !== undefined ? String(p.litros_agua) : '2.5',
      atividade_fisica: Boolean(p.atividade_fisica),
      atividade_fisica_descricao: p.atividade_fisica_descricao || '',
      observacoes: p.observacoes || ''
    });
  };

  useEffect(() => {
    loadData();
  }, [pacienteId, nutricionistaId]);

  // Cálculo de Idade
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

  // Cálculo automático do IMC a partir do peso e altura do form
  const calcImc = (pesoStr, alturaStr) => {
    const p = parseFloat(String(pesoStr).replace(',', '.'));
    const a = parseFloat(String(alturaStr).replace(',', '.'));
    if (!p || !a || p <= 0 || a <= 0) return null;
    const altMetros = a > 3 ? a / 100 : a;
    const res = p / (altMetros * altMetros);
    return isFinite(res) ? res.toFixed(1) : null;
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => {
      const arr = prev[field] || [];
      if (arr.includes(item)) {
        return { ...prev, [field]: arr.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...arr, item] };
      }
    });
  };

  // Salvar alterações de Dados do Paciente (Seção 1)
  const handleSaveDados = async (e) => {
    if (e) e.preventDefault();
    if (!formData.nome || !formData.nome.trim()) {
      setError('O nome completo é obrigatório.');
      return;
    }

    try {
      setSavingDados(true);
      setError(null);

      const imcVal = calcImc(formData.peso_inicial, formData.altura);

      const payload = {
        nome: formData.nome.trim(),
        data_nascimento: formData.data_nascimento || null,
        sexo: formData.sexo || null,
        telefone: formData.telefone || null,
        whatsapp: formData.whatsapp || null,
        email: formData.email || null,

        peso_inicial: formData.peso_inicial ? parseFloat(String(formData.peso_inicial).replace(',', '.')) : null,
        altura: formData.altura ? parseFloat(String(formData.altura).replace(',', '.')) : null,
        imc: imcVal ? parseFloat(imcVal) : null,
        objetivos: formData.objetivos || [],
        objetivo_texto: formData.objetivo_texto || null,
        nivel_atividade: formData.nivel_atividade || null,
        patologias: formData.patologias || [],
        restricoes_alimentares: formData.restricoes_alimentares || [],
        alergias: formData.alergias || [],
        medicamentos: formData.medicamentos || null,
        suplementos: formData.suplementos || null,

        refeicoes_por_dia: formData.refeicoes_por_dia ? parseInt(formData.refeicoes_por_dia, 10) : null,
        horario_acorda: formData.horario_acorda || null,
        horario_dorme: formData.horario_dorme || null,
        litros_agua: formData.litros_agua ? parseFloat(String(formData.litros_agua).replace(',', '.')) : null,
        atividade_fisica: Boolean(formData.atividade_fisica),
        atividade_fisica_descricao: formData.atividade_fisica ? formData.atividade_fisica_descricao : null,
        observacoes: formData.observacoes || null
      };

      await updatePaciente(pacienteId, nutricionistaId, payload);
      setDadosSuccess(true);
      await loadData();
      if (onRefreshData) onRefreshData();
      setTimeout(() => setDadosSuccess(false), 4000);
    } catch (err) {
      console.error('Erro ao atualizar paciente:', err);
      setError(err.message || 'Erro ao salvar alterações do paciente.');
    } finally {
      setSavingDados(false);
    }
  };

  // Salvar Nova Consulta (Seção 2)
  const handleSaveConsulta = async (e) => {
    e.preventDefault();
    if (!consultaForm.data_consulta) {
      setError('A data da consulta é obrigatória.');
      return;
    }
    if (!consultaForm.peso) {
      setError('O peso na consulta é obrigatório.');
      return;
    }

    try {
      setSavingConsulta(true);
      setError(null);

      const payload = {
        paciente_id: pacienteId,
        data_consulta: consultaForm.data_consulta,
        peso: parseFloat(String(consultaForm.peso).replace(',', '.')),
        cintura: consultaForm.cintura ? parseFloat(String(consultaForm.cintura).replace(',', '.')) : null,
        quadril: consultaForm.quadril ? parseFloat(String(consultaForm.quadril).replace(',', '.')) : null,
        percentual_gordura: consultaForm.percentual_gordura ? parseFloat(String(consultaForm.percentual_gordura).replace(',', '.')) : null,
        observacoes: consultaForm.observacoes || null,
        proximo_retorno: consultaForm.proximo_retorno || null
      };

      await createConsulta(payload);
      setShowConsultaModal(false);
      setConsultaSuccess(true);
      setConsultaForm({
        data_consulta: new Date().toISOString().split('T')[0],
        peso: '',
        cintura: '',
        quadril: '',
        percentual_gordura: '',
        observacoes: '',
        proximo_retorno: ''
      });
      await loadData();
      if (onRefreshData) onRefreshData();
      setTimeout(() => setConsultaSuccess(false), 4000);
    } catch (err) {
      console.error('Erro ao registrar consulta:', err);
      setError(err.message || 'Erro ao registrar nova consulta.');
    } finally {
      setSavingConsulta(false);
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
      <div className="view-container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="spinner" style={{ borderTopColor: 'var(--primary)', margin: '0 auto 16px auto', width: '36px', height: '36px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Carregando prontuário do paciente no Neon...</p>
      </div>
    );
  }

  const p = pacienteData?.paciente || {};
  const consultas = (pacienteData?.consultas || []).slice().sort((a, b) => new Date(b.data_consulta) - new Date(a.data_consulta));
  const planos = pacienteData?.planos || [];
  const ageVal = getAge(p.data_nascimento);

  // Preparação de dados para o Gráfico de Evolução de Peso
  // Ordem cronológica crescente para a linha do gráfico
  const pesoTimeline = [];
  if (p.peso_inicial && p.created_at) {
    pesoTimeline.push({
      data: p.created_at.split('T')[0],
      peso: parseFloat(p.peso_inicial),
      label: 'Inicial'
    });
  }
  const consultasAsc = [...consultas].sort((a, b) => new Date(a.data_consulta) - new Date(b.data_consulta));
  consultasAsc.forEach(c => {
    if (c.peso) {
      pesoTimeline.push({
        data: c.data_consulta,
        peso: parseFloat(c.peso),
        label: new Date(c.data_consulta + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      });
    }
  });

  const minPeso = pesoTimeline.length > 0 ? Math.min(...pesoTimeline.map(d => d.peso)) - 2 : 0;
  const maxPeso = pesoTimeline.length > 0 ? Math.max(...pesoTimeline.map(d => d.peso)) + 2 : 100;
  const pesoRange = Math.max(maxPeso - minPeso, 1);

  return (
    <div className="view-container">
      {/* Top Header Navigation */}
      <div className="perfil-top-nav">
        <button onClick={onBack} className="btn-back">
          <ArrowLeft size={18} />
          <span>Voltar para Lista de Pacientes</span>
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleDelete} disabled={isDeleting} className="btn-danger-outline">
            <Trash2 size={16} />
            <span>{isDeleting ? 'Excluindo...' : 'Excluir Paciente'}</span>
          </button>
        </div>
      </div>

      {dadosSuccess && (
        <div className="alert-success" style={{ marginBottom: '20px' }}>
          <CheckCircle2 size={18} />
          <span>Alterações do paciente salvas com sucesso no Neon!</span>
        </div>
      )}

      {consultaSuccess && (
        <div className="alert-success" style={{ marginBottom: '20px' }}>
          <CheckCircle2 size={18} />
          <span>Nova consulta registrada com sucesso! Gráfico e histórico atualizados.</span>
        </div>
      )}

      {error && (
        <div className="alert-error" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Header Banner */}
      <div className="perfil-header-card">
        <div className="perfil-avatar">
          {p.nome?.charAt(0).toUpperCase() || 'P'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 className="perfil-nome">{p.nome}</h1>
            {p.sexo && <span className="badge-tag">{p.sexo}</span>}
            {ageVal !== null && <span className="badge-tag badge-info">{ageVal} anos</span>}
            {p.peso_inicial && <span className="badge-tag badge-success">{p.peso_inicial} kg</span>}
          </div>
          <p className="perfil-sub">
            Cadastrado em {p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : 'Data recente'} • {consultas.length} {consultas.length === 1 ? 'consulta registrada' : 'consultas registradas'}
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
            <span>WhatsApp</span>
          </a>
        )}
      </div>

      {/* Navegação entre as 3 Seções Principais (Prompt 5) */}
      <div className="perfil-main-tabs" style={{
        display: 'flex',
        background: '#ffffff',
        padding: '6px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '28px',
        gap: '8px'
      }}>
        <button
          type="button"
          onClick={() => setActiveSection('dados')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 18px',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: activeSection === 'dados' ? 'var(--primary)' : 'transparent',
            color: activeSection === 'dados' ? '#ffffff' : 'var(--text-muted)',
            boxShadow: activeSection === 'dados' ? 'var(--shadow-glow-primary)' : 'none'
          }}
        >
          <User size={18} />
          <span>1. Dados do Paciente</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('consultas')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 18px',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: activeSection === 'consultas' ? 'var(--primary)' : 'transparent',
            color: activeSection === 'consultas' ? '#ffffff' : 'var(--text-muted)',
            boxShadow: activeSection === 'consultas' ? 'var(--shadow-glow-primary)' : 'none'
          }}
        >
          <Calendar size={18} />
          <span>2. Consultas ({consultas.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('planos')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 18px',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: activeSection === 'planos' ? 'var(--primary)' : 'transparent',
            color: activeSection === 'planos' ? '#ffffff' : 'var(--text-muted)',
            boxShadow: activeSection === 'planos' ? 'var(--shadow-glow-primary)' : 'none'
          }}
        >
          <FileText size={18} />
          <span>3. Planos Alimentares</span>
        </button>
      </div>

      {/* =========================================================================
          SEÇÃO 1: DADOS DO PACIENTE (EDITÁVEIS INLINE COM 3 ABAS)
          ========================================================================= */}
      {activeSection === 'dados' && (
        <div className="perfil-box" style={{ padding: '32px' }}>
          {/* Sub-abas: Pessoal, Clínico, Hábitos */}
          <div style={{
            display: 'flex',
            gap: '12px',
            borderBottom: '2px solid #e2e8f0',
            paddingBottom: '12px',
            marginBottom: '28px'
          }}>
            <button
              type="button"
              onClick={() => setDadosTab('pessoal')}
              style={{
                background: dadosTab === 'pessoal' ? 'var(--primary-light)' : 'transparent',
                color: dadosTab === 'pessoal' ? 'var(--primary)' : 'var(--text-muted)',
                border: 'none',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <User size={16} />
              <span>Aba 1 — Pessoal</span>
            </button>

            <button
              type="button"
              onClick={() => setDadosTab('clinico')}
              style={{
                background: dadosTab === 'clinico' ? 'var(--primary-light)' : 'transparent',
                color: dadosTab === 'clinico' ? 'var(--primary)' : 'var(--text-muted)',
                border: 'none',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Activity size={16} />
              <span>Aba 2 — Clínico</span>
            </button>

            <button
              type="button"
              onClick={() => setDadosTab('habitos')}
              style={{
                background: dadosTab === 'habitos' ? 'var(--primary-light)' : 'transparent',
                color: dadosTab === 'habitos' ? 'var(--primary)' : 'var(--text-muted)',
                border: 'none',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Clock size={16} />
              <span>Aba 3 — Hábitos</span>
            </button>
          </div>

          <form onSubmit={handleSaveDados}>
            {/* ABA 1 — PESSOAL */}
            {dadosTab === 'pessoal' && (
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Nome Completo *</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    value={formData.nome || ''}
                    onChange={(e) => handleFieldChange('nome', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Data de Nascimento {getAge(formData.data_nascimento) !== null && `(${getAge(formData.data_nascimento)} anos)`}
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    value={formData.data_nascimento || ''}
                    onChange={(e) => handleFieldChange('data_nascimento', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sexo</label>
                  <select
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    value={formData.sexo || 'Feminino'}
                    onChange={(e) => handleFieldChange('sexo', e.target.value)}
                  >
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    placeholder="(00) 00000-0000"
                    value={formData.telefone || ''}
                    onChange={(e) => handleFieldChange('telefone', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    placeholder="(00) 00000-0000"
                    value={formData.whatsapp || ''}
                    onChange={(e) => handleFieldChange('whatsapp', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">E-mail</label>
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    placeholder="paciente@email.com"
                    value={formData.email || ''}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* ABA 2 — CLÍNICO */}
            {dadosTab === 'clinico' && (
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Peso Atual (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    placeholder="Ex: 70.5"
                    value={formData.peso_inicial || ''}
                    onChange={(e) => handleFieldChange('peso_inicial', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Altura (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    placeholder="Ex: 175"
                    value={formData.altura || ''}
                    onChange={(e) => handleFieldChange('altura', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">IMC Calculado (Automático)</label>
                  <div style={{
                    padding: '13px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: '#f1f5f9',
                    fontWeight: 800,
                    color: 'var(--primary-dark)',
                    border: '1.5px solid #e2e8f0'
                  }}>
                    {calcImc(formData.peso_inicial, formData.altura) ? `${calcImc(formData.peso_inicial, formData.altura)} kg/m²` : 'Preencha peso e altura'}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nível de Atividade Física</label>
                  <select
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    value={formData.nivel_atividade || 'Sedentário'}
                    onChange={(e) => handleFieldChange('nivel_atividade', e.target.value)}
                  >
                    <option value="Sedentário">Sedentário</option>
                    <option value="Levemente ativo">Levemente ativo</option>
                    <option value="Moderadamente ativo">Moderadamente ativo</option>
                    <option value="Muito ativo">Muito ativo</option>
                    <option value="Extremamente ativo">Extremamente ativo</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Objetivos</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    {['Emagrecer', 'Ganhar massa', 'Controlar diabetes', 'Saúde geral', 'Performance esportiva', 'Reeducação alimentar'].map((obj) => (
                      <button
                        key={obj}
                        type="button"
                        onClick={() => toggleArrayItem('objetivos', obj)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: formData.objetivos?.includes(obj) ? '1px solid var(--primary)' : '1px solid #cbd5e1',
                          background: formData.objetivos?.includes(obj) ? 'var(--primary-light)' : '#ffffff',
                          color: formData.objetivos?.includes(obj) ? 'var(--primary-dark)' : 'var(--text-muted)'
                        }}
                      >
                        {obj}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    placeholder="Outro objetivo específico..."
                    value={formData.objetivo_texto || ''}
                    onChange={(e) => handleFieldChange('objetivo_texto', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Patologias ou Condições de Saúde</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    {['Diabetes', 'Hipertensão', 'Hipotireoidismo', 'Hipertireoidismo', 'Síndrome do ovário policístico', 'Doença celíaca', 'Colesterol alto'].map((pat) => (
                      <button
                        key={pat}
                        type="button"
                        onClick={() => toggleArrayItem('patologias', pat)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: formData.patologias?.includes(pat) ? '1px solid var(--primary)' : '1px solid #cbd5e1',
                          background: formData.patologias?.includes(pat) ? 'var(--primary-light)' : '#ffffff',
                          color: formData.patologias?.includes(pat) ? 'var(--primary-dark)' : 'var(--text-muted)'
                        }}
                      >
                        {pat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Restrições e Alergias</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    {['Lactose', 'Glúten', 'Açúcar', 'Carne vermelha', 'Frutos do mar', 'Amendoim', 'Leite', 'Ovo', 'Soja', 'Trigo'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleArrayItem('restricoes_alimentares', item)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: formData.restricoes_alimentares?.includes(item) ? '1px solid var(--primary)' : '1px solid #cbd5e1',
                          background: formData.restricoes_alimentares?.includes(item) ? 'var(--primary-light)' : '#ffffff',
                          color: formData.restricoes_alimentares?.includes(item) ? 'var(--primary-dark)' : 'var(--text-muted)'
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Medicamentos Contínuos</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    placeholder="Ex: Losartana 50mg"
                    value={formData.medicamentos || ''}
                    onChange={(e) => handleFieldChange('medicamentos', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Suplementos em Uso</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    placeholder="Ex: Whey, Creatina, Vitamina D"
                    value={formData.suplementos || ''}
                    onChange={(e) => handleFieldChange('suplementos', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* ABA 3 — HÁBITOS */}
            {dadosTab === 'habitos' && (
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Quantas refeições faz por dia</label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    value={formData.refeicoes_por_dia || ''}
                    onChange={(e) => handleFieldChange('refeicoes_por_dia', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Quantidade de água por dia (litros)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    placeholder="Ex: 2.5"
                    value={formData.litros_agua || ''}
                    onChange={(e) => handleFieldChange('litros_agua', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Horário que acorda</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    placeholder="Ex: 06:30"
                    value={formData.horario_acorda || ''}
                    onChange={(e) => handleFieldChange('horario_acorda', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Horário que dorme</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    placeholder="Ex: 23:00"
                    value={formData.horario_dorme || ''}
                    onChange={(e) => handleFieldChange('horario_dorme', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Pratica atividade física?</label>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('atividade_fisica', true)}
                      style={{
                        padding: '10px 24px',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: formData.atividade_fisica ? 'var(--primary)' : '#f1f5f9',
                        color: formData.atividade_fisica ? '#ffffff' : 'var(--text-muted)'
                      }}
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('atividade_fisica', false)}
                      style={{
                        padding: '10px 24px',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: !formData.atividade_fisica ? 'var(--primary)' : '#f1f5f9',
                        color: !formData.atividade_fisica ? '#ffffff' : 'var(--text-muted)'
                      }}
                    >
                      Não
                    </button>
                  </div>
                  {formData.atividade_fisica && (
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '16px' }}
                      placeholder="Qual atividade e frequência semanal (ex: Musculação 4x na semana)?"
                      value={formData.atividade_fisica_descricao || ''}
                      onChange={(e) => handleFieldChange('atividade_fisica_descricao', e.target.value)}
                    />
                  )}
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Observações Gerais</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    style={{ paddingLeft: '16px', height: 'auto', resize: 'vertical' }}
                    placeholder="Informações adicionais do paciente..."
                    value={formData.observacoes || ''}
                    onChange={(e) => handleFieldChange('observacoes', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Botão Salvar Alterações */}
            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={savingDados}
                style={{ width: 'auto', minWidth: '220px' }}
              >
                {savingDados ? (
                  <>
                    <div className="spinner" />
                    <span>Salvando no Neon...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          SEÇÃO 2: CONSULTAS (GRÁFICO DE EVOLUÇÃO + HISTÓRICO + MODAL)
          ========================================================================= */}
      {activeSection === 'consultas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header da Seção de Consultas */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>
                Evolução & Consultas
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                Acompanhe o peso, medidas corporais e retornos agendados
              </p>
            </div>
            <button
              onClick={() => setShowConsultaModal(true)}
              className="btn-primary"
              style={{ width: 'auto' }}
            >
              <Plus size={18} />
              <span>Nova Consulta</span>
            </button>
          </div>

          {/* Gráfico de Evolução de Peso */}
          <div className="perfil-box" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={22} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>
                  Gráfico de Evolução de Peso (kg)
                </h3>
              </div>
              {pesoTimeline.length > 1 && (
                <span className="badge-tag badge-success">
                  {pesoTimeline[pesoTimeline.length - 1].peso < pesoTimeline[0].peso ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TrendingDown size={14} /> {(pesoTimeline[0].peso - pesoTimeline[pesoTimeline.length - 1].peso).toFixed(1)} kg eliminados
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TrendingUp size={14} /> +{(pesoTimeline[pesoTimeline.length - 1].peso - pesoTimeline[0].peso).toFixed(1)} kg ganhos
                    </span>
                  )}
                </span>
              )}
            </div>

            {pesoTimeline.length === 0 ? (
              <div style={{
                height: '180px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px dashed #cbd5e1',
                color: 'var(--text-muted)'
              }}>
                <Scale size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                <span style={{ fontWeight: 700 }}>Nenhuma consulta registrada ainda</span>
                <span style={{ fontSize: '0.85rem' }}>Clique em "Nova Consulta" para registrar o primeiro acompanhamento.</span>
              </div>
            ) : (
              <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid var(--border)' }}>
                {/* SVG Line Chart */}
                <svg viewBox="0 0 700 200" style={{ width: '100%', height: '200px', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Linhas de Grade */}
                  {[0.25, 0.5, 0.75].map((factor, idx) => (
                    <line
                      key={idx}
                      x1="40"
                      y1={170 - 130 * factor}
                      x2="680"
                      y2={170 - 130 * factor}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {/* Curva / Linha */}
                  {(() => {
                    const points = pesoTimeline.map((item, idx) => {
                      const x = pesoTimeline.length === 1 ? 360 : 60 + (idx * (600 / (pesoTimeline.length - 1)));
                      const normalized = (item.peso - minPeso) / pesoRange;
                      const y = 160 - (normalized * 120);
                      return { x, y, ...item };
                    });

                    const pathD = points.reduce((acc, p, idx) => {
                      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
                    }, '');

                    const areaD = `${pathD} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`;

                    return (
                      <>
                        <path d={areaD} fill="url(#weightGrad)" />
                        <path d={pathD} fill="none" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                        {points.map((pt, idx) => (
                          <g key={idx}>
                            <circle cx={pt.x} cy={pt.y} r="6" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
                            <text
                              x={pt.x}
                              y={pt.y - 12}
                              textAnchor="middle"
                              fill="#075985"
                              fontSize="12"
                              fontWeight="800"
                            >
                              {pt.peso} kg
                            </text>
                            <text
                              x={pt.x}
                              y="195"
                              textAnchor="middle"
                              fill="#64748b"
                              fontSize="11"
                              fontWeight="600"
                            >
                              {pt.label}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>
            )}
          </div>

          {/* Lista de Consultas (Cronológica Decrescente) */}
          <div className="perfil-box" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>
                Histórico de Consultas
              </h3>
              <span className="badge-count">{consultas.length} registradas</span>
            </div>

            {consultas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <Calendar size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
                <p style={{ fontWeight: 600 }}>Nenhuma consulta cadastrada ainda para este paciente.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {consultas.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '18px 22px',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border)',
                      background: '#ffffff',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Calendar size={18} />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-dark)' }}>
                          {new Date(c.data_consulta + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {c.proximo_retorno ? (
                        <span className="badge-tag badge-success">
                          Próximo Retorno: {new Date(c.proximo_retorno + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      ) : (
                        <span className="badge-tag badge-warning">Sem retorno agendado</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', fontSize: '0.9rem', color: '#475569' }}>
                      {c.peso && (
                        <span>
                          <strong style={{ color: 'var(--text-main)' }}>Peso:</strong> {c.peso} kg
                        </span>
                      )}
                      {c.cintura && (
                        <span>
                          <strong style={{ color: 'var(--text-main)' }}>Cintura:</strong> {c.cintura} cm
                        </span>
                      )}
                      {c.quadril && (
                        <span>
                          <strong style={{ color: 'var(--text-main)' }}>Quadril:</strong> {c.quadril} cm
                        </span>
                      )}
                      {c.percentual_gordura && (
                        <span>
                          <strong style={{ color: 'var(--text-main)' }}>% Gordura:</strong> {c.percentual_gordura}%
                        </span>
                      )}
                    </div>

                    {c.observacoes && (
                      <div style={{
                        marginTop: '4px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: '#f8fafc',
                        fontSize: '0.875rem',
                        color: '#334155',
                        borderLeft: '3px solid var(--primary)'
                      }}>
                        "{c.observacoes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SEÇÃO 3: PLANOS ALIMENTARES (PROMPT 5 REQUIREMENT)
          ========================================================================= */}
      {activeSection === 'planos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            boxShadow: 'var(--shadow-glow-primary)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Sparkles size={24} color="#bae6fd" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>Planos Alimentares Inteligentes</h2>
              </div>
              <p style={{ margin: 0, color: '#e0f2fe', fontSize: '0.95rem', maxWidth: '560px' }}>
                Gere dietas e cardápios personalizados a partir do perfil clínico, hábitos e cálculo calórico do paciente.
              </p>
            </div>

            <button
              type="button"
              className="btn-primary"
              style={{
                width: 'auto',
                background: '#ffffff',
                color: 'var(--primary-dark)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                fontWeight: 800
              }}
              onClick={() => alert('A funcionalidade de geração de Plano Alimentar com IA será ativada no Prompt 6.')}
            >
              <Sparkles size={18} color="var(--primary)" />
              <span>Gerar Plano Alimentar</span>
            </button>
          </div>

          {/* Histórico de Planos Salvos */}
          <div className="perfil-box" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>
                Histórico de Planos Salvos
              </h3>
              <span className="badge-count">{planos.length} planos</span>
            </div>

            {planos.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 0',
                background: '#f8fafc',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px dashed #cbd5e1',
                color: 'var(--text-muted)'
              }}>
                <FileText size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
                <p style={{ fontWeight: 700, margin: 0 }}>Nenhum plano alimentar gerado ainda</p>
                <p style={{ fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Os planos e dietas criados para este paciente ficarão organizados aqui.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {planos.map((plano) => (
                  <div
                    key={plano.id}
                    onClick={() => setSelectedPlano(plano)}
                    style={{
                      padding: '18px 22px',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border)',
                      background: '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {plano.titulo || 'Plano Alimentar Personalizado'}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Gerado em {new Date(plano.created_at).toLocaleDateString('pt-BR')} • {plano.calorias_alvo ? `${plano.calorias_alvo} kcal` : 'Calorias balanceadas'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={18} color="var(--primary)" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: NOVA CONSULTA (PROMPT 5 REQUIREMENT)
          ========================================================================= */}
      {showConsultaModal && (
        <div className="modal-backdrop" onClick={() => setShowConsultaModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={22} color="var(--primary)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>
                  Nova Consulta / Retorno
                </h3>
              </div>
              <button onClick={() => setShowConsultaModal(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveConsulta}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Data da Consulta *</label>
                  <input
                    type="date"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    value={consultaForm.data_consulta}
                    onChange={(e) => setConsultaForm({ ...consultaForm, data_consulta: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Peso Atual (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      style={{ paddingLeft: '16px' }}
                      placeholder="Ex: 72.4"
                      value={consultaForm.peso}
                      onChange={(e) => setConsultaForm({ ...consultaForm, peso: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">% de Gordura (opcional)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      style={{ paddingLeft: '16px' }}
                      placeholder="Ex: 18.5"
                      value={consultaForm.percentual_gordura}
                      onChange={(e) => setConsultaForm({ ...consultaForm, percentual_gordura: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Cintura (cm) (opcional)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-input"
                      style={{ paddingLeft: '16px' }}
                      placeholder="Ex: 82"
                      value={consultaForm.cintura}
                      onChange={(e) => setConsultaForm({ ...consultaForm, cintura: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quadril (cm) (opcional)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-input"
                      style={{ paddingLeft: '16px' }}
                      placeholder="Ex: 98"
                      value={consultaForm.quadril}
                      onChange={(e) => setConsultaForm({ ...consultaForm, quadril: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Próximo Retorno (opcional)</label>
                  <input
                    type="date"
                    className="form-input"
                    style={{ paddingLeft: '16px' }}
                    value={consultaForm.proximo_retorno}
                    onChange={(e) => setConsultaForm({ ...consultaForm, proximo_retorno: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Observações da Consulta</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    style={{ paddingLeft: '16px', height: 'auto', resize: 'vertical' }}
                    placeholder="Feedback da dieta, queixas, adaptações realizadas..."
                    value={consultaForm.observacoes}
                    onChange={(e) => setConsultaForm({ ...consultaForm, observacoes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowConsultaModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={savingConsulta}
                  style={{ width: 'auto' }}
                >
                  {savingConsulta ? (
                    <>
                      <div className="spinner" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar Consulta</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VISUALIZAR PLANO ALIMENTAR SELECIONADO
          ========================================================================= */}
      {selectedPlano && (
        <div className="modal-backdrop" onClick={() => setSelectedPlano(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={22} color="var(--primary)" />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-dark)', margin: 0 }}>
                    {selectedPlano.titulo || 'Plano Alimentar'}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Criado em {new Date(selectedPlano.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedPlano(null)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                fontSize: '0.925rem',
                lineHeight: 1.6,
                color: 'var(--text-main)',
                border: '1px solid var(--border)'
              }}>
                {selectedPlano.conteudo || 'Conteúdo do plano alimentar sem texto cadastrado.'}
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setSelectedPlano(null)} className="btn-secondary">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
