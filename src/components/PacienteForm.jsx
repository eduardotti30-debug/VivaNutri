import React, { useState, useEffect } from 'react';
import { User, Activity, Clock, CheckCircle2, AlertCircle, Save, ArrowLeft, Plus, X } from 'lucide-react';

export function PacienteForm({ initialData = null, onSave, onCancel, loading = false, error = null }) {
  const [activeTab, setActiveTab] = useState('pessoal'); // 'pessoal' | 'clinico' | 'habitos'

  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    sexo: 'Feminino',
    telefone: '',
    whatsapp: '',
    email: '',
    
    // Clínico
    peso_inicial: '',
    altura: '',
    objetivos: [],
    objetivo_texto: '',
    nivel_atividade: 'Moderadamente ativo',
    patologias: [],
    patologias_extra: '',
    restricoes_alimentares: [],
    restricoes_extra: '',
    alergias: [],
    alergias_extra: '',
    medicamentos: '',
    suplementos: '',
    
    // Hábitos
    refeicoes_por_dia: '4',
    horario_acorda: '07:00',
    horario_dorme: '23:00',
    litros_agua: '2.5',
    atividade_fisica: false,
    atividade_fisica_descricao: '',
    observacoes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome || '',
        data_nascimento: initialData.data_nascimento || '',
        sexo: initialData.sexo || 'Feminino',
        telefone: initialData.telefone || '',
        whatsapp: initialData.whatsapp || '',
        email: initialData.email || '',
        peso_inicial: initialData.peso_inicial !== null && initialData.peso_inicial !== undefined ? String(initialData.peso_inicial) : '',
        altura: initialData.altura !== null && initialData.altura !== undefined ? String(initialData.altura) : '',
        objetivos: Array.isArray(initialData.objetivos) ? initialData.objetivos : [],
        objetivo_texto: initialData.objetivo_texto || '',
        nivel_atividade: initialData.nivel_atividade || 'Moderadamente ativo',
        patologias: Array.isArray(initialData.patologias) ? initialData.patologias : [],
        patologias_extra: '',
        restricoes_alimentares: Array.isArray(initialData.restricoes_alimentares) ? initialData.restricoes_alimentares : [],
        restricoes_extra: '',
        alergias: Array.isArray(initialData.alergias) ? initialData.alergias : [],
        alergias_extra: '',
        medicamentos: initialData.medicamentos || '',
        suplementos: initialData.suplementos || '',
        refeicoes_por_dia: initialData.refeicoes_por_dia ? String(initialData.refeicoes_por_dia) : '4',
        horario_acorda: initialData.horario_acorda || '07:00',
        horario_dorme: initialData.horario_dorme || '23:00',
        litros_agua: initialData.litros_agua ? String(initialData.litros_agua) : '2.5',
        atividade_fisica: Boolean(initialData.atividade_fisica),
        atividade_fisica_descricao: initialData.atividade_fisica_descricao || '',
        observacoes: initialData.observacoes || ''
      });
    }
  }, [initialData]);

  // Handler genérico de campos
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Formatação de telefone / WhatsApp
  const handlePhoneFormat = (fieldName, value) => {
    let val = value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 6) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    } else if (val.length > 2) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    } else if (val.length > 0) {
      val = `(${val}`;
    }
    setFormData((prev) => ({ ...prev, [fieldName]: val }));
  };

  // Formatação de horário ao sair do campo (blur) ou ao alterar
  const formatTimeStr = (strVal) => {
    if (!strVal) return '';
    const digits = strVal.replace(/\D/g, '');
    if (!digits) return strVal;
    if (digits.length === 1 || digits.length === 2) {
      let h = parseInt(digits, 10);
      if (h > 23) h = 23;
      return `${String(h).padStart(2, '0')}:00`;
    }
    if (digits.length === 3) {
      let h = parseInt(digits.slice(0, 1), 10);
      let m = parseInt(digits.slice(1), 10);
      if (m > 59) m = 59;
      return `0${h}:${String(m).padStart(2, '0')}`;
    }
    if (digits.length >= 4) {
      let h = parseInt(digits.slice(0, 2), 10);
      let m = parseInt(digits.slice(2, 4), 10);
      if (h > 23) h = 23;
      if (m > 59) m = 59;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    return strVal;
  };

  const handleTimeBlur = (fieldName) => {
    const raw = formData[fieldName];
    const formatted = formatTimeStr(raw);
    setFormData((prev) => ({ ...prev, [fieldName]: formatted }));
  };

  // Cálculo da Idade
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

  // Cálculo do IMC (peso em kg / (altura em m)^2)
  const getIMCInfo = () => {
    const peso = parseFloat(formData.peso_inicial);
    let alturaCm = parseFloat(formData.altura);
    if (!peso || !alturaCm || isNaN(peso) || isNaN(alturaCm)) return null;

    // Se a altura for informada em metros por engano (ex: 1.70), converte para cm
    if (alturaCm < 3) {
      alturaCm = alturaCm * 100;
    }

    const alturaM = alturaCm / 100;
    const imc = peso / (alturaM * alturaM);
    let classificacao = '';

    if (imc < 18.5) classificacao = 'Abaixo do peso';
    else if (imc < 24.9) classificacao = 'Peso normal (Eutrofia)';
    else if (imc < 29.9) classificacao = 'Sobrepeso';
    else if (imc < 34.9) classificacao = 'Obesidade Grau I';
    else if (imc < 39.9) classificacao = 'Obesidade Grau II';
    else classificacao = 'Obesidade Grau III';

    return {
      valor: imc.toFixed(1),
      classificacao
    };
  };

  const imcData = getIMCInfo();

  // Multi-select toggle helper
  const toggleArrayItem = (fieldName, item) => {
    setFormData((prev) => {
      const list = prev[fieldName] || [];
      if (item === 'Nenhum') {
        return { ...prev, [fieldName]: ['Nenhum'] };
      }
      const filteredList = list.filter((i) => i !== 'Nenhum');
      if (filteredList.includes(item)) {
        return { ...prev, [fieldName]: filteredList.filter((i) => i !== item) };
      } else {
        return { ...prev, [fieldName]: [...filteredList, item] };
      }
    });
  };

  const handleAddExtraItem = (fieldName, extraStateKey) => {
    const val = formData[extraStateKey]?.trim();
    if (!val) return;
    setFormData((prev) => {
      const list = (prev[fieldName] || []).filter((i) => i !== 'Nenhum');
      if (!list.includes(val)) {
        return {
          ...prev,
          [fieldName]: [...list, val],
          [extraStateKey]: ''
        };
      }
      return { ...prev, [extraStateKey]: '' };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      alert('O campo Nome Completo é obrigatório.');
      setActiveTab('pessoal');
      return;
    }

    // Preparar payload final
    let alturaCm = formData.altura ? parseFloat(formData.altura) : null;
    if (alturaCm && alturaCm < 3) {
      alturaCm = alturaCm * 100;
    }

    const payload = {
      nome: formData.nome.trim(),
      data_nascimento: formData.data_nascimento || null,
      sexo: formData.sexo,
      telefone: formData.telefone.trim() || null,
      whatsapp: formData.whatsapp.trim() || null,
      email: formData.email.trim() || null,
      peso_inicial: formData.peso_inicial ? parseFloat(formData.peso_inicial) : null,
      altura: alturaCm,
      imc: imcData ? parseFloat(imcData.valor) : null,
      objetivos: formData.objetivos,
      objetivo_texto: formData.objetivo_texto.trim() || null,
      nivel_atividade: formData.nivel_atividade,
      patologias: formData.patologias,
      restricoes_alimentares: formData.restricoes_alimentares,
      alergias: formData.alergias,
      medicamentos: formData.medicamentos.trim() || null,
      suplementos: formData.suplementos.trim() || null,
      refeicoes_por_dia: formData.refeicoes_por_dia ? parseInt(formData.refeicoes_por_dia, 10) : null,
      horario_acorda: formatTimeStr(formData.horario_acorda),
      horario_dorme: formatTimeStr(formData.horario_dorme),
      litros_agua: formData.litros_agua ? parseFloat(formData.litros_agua) : null,
      atividade_fisica: formData.atividade_fisica,
      atividade_fisica_descricao: formData.atividade_fisica ? formData.atividade_fisica_descricao.trim() : null,
      observacoes: formData.observacoes.trim() || null
    };

    onSave(payload);
  };

  const idadeCalculada = getAge(formData.data_nascimento);

  // Opções pré-definidas
  const listaObjetivos = ['Emagrecer', 'Ganhar massa', 'Controlar diabetes', 'Saúde geral', 'Performance esportiva', 'Reeducação alimentar'];
  const listaNiveis = ['Sedentário', 'Levemente ativo', 'Moderadamente ativo', 'Muito ativo', 'Extremamente ativo'];
  const listaPatologias = ['Diabetes', 'Hipertensão', 'Hipotireoidismo', 'Hipertireoidismo', 'Síndrome do ovário policístico', 'Doença celíaca', 'Colesterol alto'];
  const listaRestricoes = ['Lactose', 'Glúten', 'Açúcar', 'Carne vermelha', 'Frutos do mar'];
  const listaAlergias = ['Amendoim', 'Leite', 'Ovo', 'Soja', 'Trigo', 'Frutos do mar'];

  return (
    <div className="paciente-form-card">
      {/* Dynamic Header */}
      <div className="form-header-bar">
        <button type="button" onClick={onCancel} className="btn-back">
          <ArrowLeft size={18} />
          <span>Voltar para Listagem</span>
        </button>
        <h2 className="form-page-title">
          {initialData ? `Editar Paciente — ${formData.nome || ''}` : 'Cadastro de Novo Paciente'}
        </h2>
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="form-tabs-bar">
        <button
          type="button"
          className={`form-tab-btn ${activeTab === 'pessoal' ? 'active' : ''}`}
          onClick={() => setActiveTab('pessoal')}
        >
          <User size={18} />
          <span>1. Dados Pessoais</span>
        </button>
        <button
          type="button"
          className={`form-tab-btn ${activeTab === 'clinico' ? 'active' : ''}`}
          onClick={() => setActiveTab('clinico')}
        >
          <Activity size={18} />
          <span>2. Avaliação Clínica</span>
        </button>
        <button
          type="button"
          className={`form-tab-btn ${activeTab === 'habitos' ? 'active' : ''}`}
          onClick={() => setActiveTab('habitos')}
        >
          <Clock size={18} />
          <span>3. Rotina & Hábitos</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-content-area">
        {/* ABA 1: PESSOAL */}
        {activeTab === 'pessoal' && (
          <div className="tab-pane">
            <h3 className="tab-pane-title">Informações Pessoais & Contatos</h3>
            <div className="form-grid">
              <div className="form-group span-2">
                <label className="form-label">Nome Completo *</label>
                <input
                  type="text"
                  name="nome"
                  required
                  className="form-input"
                  placeholder="Ex: Maria Eduarda da Silva"
                  value={formData.nome}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Data de Nascimento</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="date"
                    name="data_nascimento"
                    className="form-input"
                    value={formData.data_nascimento}
                    onChange={handleChange}
                  />
                  {idadeCalculada !== null && (
                    <span className="badge-age">{idadeCalculada} anos</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Sexo</label>
                <select
                  name="sexo"
                  className="form-input"
                  value={formData.sexo}
                  onChange={handleChange}
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
                  name="telefone"
                  className="form-input"
                  placeholder="(00) 0000-0000"
                  value={formData.telefone}
                  onChange={(e) => handlePhoneFormat('telefone', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp</label>
                <input
                  type="text"
                  name="whatsapp"
                  className="form-input"
                  placeholder="(00) 00000-0000"
                  value={formData.whatsapp}
                  onChange={(e) => handlePhoneFormat('whatsapp', e.target.value)}
                />
              </div>

              <div className="form-group span-2">
                <label className="form-label">E-mail</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="exemplo@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: CLÍNICO */}
        {activeTab === 'clinico' && (
          <div className="tab-pane">
            <h3 className="tab-pane-title">Medidas, Objetivos & Condições Clínicas</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Peso Atual (kg)</label>
                <div className="input-suffix-wrapper">
                  <input
                    type="number"
                    step="0.1"
                    name="peso_inicial"
                    className="form-input"
                    placeholder="Ex: 70"
                    value={formData.peso_inicial}
                    onChange={handleChange}
                  />
                  <span className="input-suffix">kg</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Altura (cm)</label>
                <div className="input-suffix-wrapper">
                  <input
                    type="number"
                    step="1"
                    name="altura"
                    className="form-input"
                    placeholder="Ex: 168"
                    value={formData.altura}
                    onChange={handleChange}
                  />
                  <span className="input-suffix">cm</span>
                </div>
              </div>

              {/* IMC Calculado Automaticamente */}
              <div className="form-group span-2">
                <label className="form-label">IMC (Índice de Massa Corporal)</label>
                <div className="imc-display-box">
                  {imcData ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span className="imc-value-highlight">{imcData.valor} <small>kg/m²</small></span>
                      <span className="imc-badge-status">{imcData.classificacao}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Calculado automaticamente pelo sistema
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Preencha o Peso e a Altura acima para calcular o IMC automaticamente.
                    </span>
                  )}
                </div>
              </div>

              {/* Objetivos */}
              <div className="form-group span-2">
                <label className="form-label">Objetivos Nutricionais (múltipla escolha)</label>
                <div className="chip-selector-group">
                  {listaObjetivos.map((obj) => {
                    const isSelected = formData.objetivos.includes(obj);
                    return (
                      <button
                        key={obj}
                        type="button"
                        className={`chip-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleArrayItem('objetivos', obj)}
                      >
                        {isSelected && <CheckCircle2 size={14} />}
                        <span>{obj}</span>
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  name="objetivo_texto"
                  className="form-input"
                  style={{ marginTop: '10px' }}
                  placeholder="Outro objetivo ou observação específica sobre a meta..."
                  value={formData.objetivo_texto}
                  onChange={handleChange}
                />
              </div>

              {/* Nível de Atividade Física */}
              <div className="form-group span-2">
                <label className="form-label">Nível de Atividade Física</label>
                <select
                  name="nivel_atividade"
                  className="form-input"
                  value={formData.nivel_atividade}
                  onChange={handleChange}
                >
                  {listaNiveis.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Patologias */}
              <div className="form-group span-2">
                <label className="form-label">Patologias ou Condições de Saúde</label>
                <div className="chip-selector-group">
                  <button
                    type="button"
                    className={`chip-btn ${formData.patologias.includes('Nenhum') ? 'selected' : ''}`}
                    onClick={() => toggleArrayItem('patologias', 'Nenhum')}
                  >
                    Nenhum
                  </button>
                  {listaPatologias.map((pat) => {
                    const isSelected = formData.patologias.includes(pat);
                    return (
                      <button
                        key={pat}
                        type="button"
                        className={`chip-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleArrayItem('patologias', pat)}
                      >
                        {isSelected && <CheckCircle2 size={14} />}
                        <span>{pat}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="add-extra-row">
                  <input
                    type="text"
                    name="patologias_extra"
                    className="form-input"
                    placeholder="Outra patologia/condição..."
                    value={formData.patologias_extra}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="btn-add-chip"
                    onClick={() => handleAddExtraItem('patologias', 'patologias_extra')}
                  >
                    <Plus size={16} /> Adicionar
                  </button>
                </div>
              </div>

              {/* Restrições Alimentares */}
              <div className="form-group span-2">
                <label className="form-label">Restrições Alimentares</label>
                <div className="chip-selector-group">
                  <button
                    type="button"
                    className={`chip-btn ${formData.restricoes_alimentares.includes('Nenhum') ? 'selected' : ''}`}
                    onClick={() => toggleArrayItem('restricoes_alimentares', 'Nenhum')}
                  >
                    Nenhum
                  </button>
                  {listaRestricoes.map((rest) => {
                    const isSelected = formData.restricoes_alimentares.includes(rest);
                    return (
                      <button
                        key={rest}
                        type="button"
                        className={`chip-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleArrayItem('restricoes_alimentares', rest)}
                      >
                        {isSelected && <CheckCircle2 size={14} />}
                        <span>{rest}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="add-extra-row">
                  <input
                    type="text"
                    name="restricoes_extra"
                    className="form-input"
                    placeholder="Outra restrição alimentando..."
                    value={formData.restricoes_extra}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="btn-add-chip"
                    onClick={() => handleAddExtraItem('restricoes_alimentares', 'restricoes_extra')}
                  >
                    <Plus size={16} /> Adicionar
                  </button>
                </div>
              </div>

              {/* Alergias Alimentares */}
              <div className="form-group span-2">
                <label className="form-label">Alergias Alimentares</label>
                <div className="chip-selector-group">
                  <button
                    type="button"
                    className={`chip-btn ${formData.alergias.includes('Nenhum') ? 'selected' : ''}`}
                    onClick={() => toggleArrayItem('alergias', 'Nenhum')}
                  >
                    Nenhum
                  </button>
                  {listaAlergias.map((alerg) => {
                    const isSelected = formData.alergias.includes(alerg);
                    return (
                      <button
                        key={alerg}
                        type="button"
                        className={`chip-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleArrayItem('alergias', alerg)}
                      >
                        {isSelected && <CheckCircle2 size={14} />}
                        <span>{alerg}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="add-extra-row">
                  <input
                    type="text"
                    name="alergias_extra"
                    className="form-input"
                    placeholder="Outra alergia alimentando..."
                    value={formData.alergias_extra}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="btn-add-chip"
                    onClick={() => handleAddExtraItem('alergias', 'alergias_extra')}
                  >
                    <Plus size={16} /> Adicionar
                  </button>
                </div>
              </div>

              {/* Medicamentos & Suplementos */}
              <div className="form-group">
                <label className="form-label">Medicamentos Contínuos</label>
                <textarea
                  name="medicamentos"
                  rows="2"
                  className="form-input"
                  placeholder="Ex: Papanicolau, Anticoncepcional, Losartana 50mg..."
                  value={formData.medicamentos}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Suplementos em Uso</label>
                <textarea
                  name="suplementos"
                  rows="2"
                  className="form-input"
                  placeholder="Ex: Whey Protein, Creatina 5g, Vitamina D3 2000UI..."
                  value={formData.suplementos}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: HÁBITOS */}
        {activeTab === 'habitos' && (
          <div className="tab-pane">
            <h3 className="tab-pane-title">Rotina Diária & Estilo de Vida</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Refeições por dia</label>
                <input
                  type="number"
                  name="refeicoes_por_dia"
                  min="1"
                  max="10"
                  className="form-input"
                  placeholder="Ex: 4"
                  value={formData.refeicoes_por_dia}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Água por dia</label>
                <div className="input-suffix-wrapper">
                  <input
                    type="number"
                    step="0.1"
                    name="litros_agua"
                    className="form-input"
                    placeholder="Ex: 2.5"
                    value={formData.litros_agua}
                    onChange={handleChange}
                  />
                  <span className="input-suffix">litros</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Horário que acorda</label>
                <input
                  type="text"
                  name="horario_acorda"
                  className="form-input"
                  placeholder="Ex: 6 ou 630 → 06:30"
                  value={formData.horario_acorda}
                  onChange={handleChange}
                  onBlur={() => handleTimeBlur('horario_acorda')}
                />
                <span className="field-hint">Digite apenas o número (ex: 6 ou 630) que o sistema converte para 06:30</span>
              </div>

              <div className="form-group">
                <label className="form-label">Horário que dorme</label>
                <input
                  type="text"
                  name="horario_dorme"
                  className="form-input"
                  placeholder="Ex: 23 ou 2230 → 22:30"
                  value={formData.horario_dorme}
                  onChange={handleChange}
                  onBlur={() => handleTimeBlur('horario_dorme')}
                />
                <span className="field-hint">Digite apenas o número (ex: 23 ou 2230) que o sistema converte para 22:30</span>
              </div>

              {/* Atividade Física */}
              <div className="form-group span-2">
                <label className="form-label">Pratica atividade física?</label>
                <div className="toggle-switch-wrapper">
                  <label className="switch-radio">
                    <input
                      type="radio"
                      name="atividade_fisica_radio"
                      checked={formData.atividade_fisica === true}
                      onChange={() => setFormData((prev) => ({ ...prev, atividade_fisica: true }))}
                    />
                    <span>Sim</span>
                  </label>
                  <label className="switch-radio">
                    <input
                      type="radio"
                      name="atividade_fisica_radio"
                      checked={formData.atividade_fisica === false}
                      onChange={() => setFormData((prev) => ({ ...prev, atividade_fisica: false }))}
                    />
                    <span>Não</span>
                  </label>
                </div>
              </div>

              {formData.atividade_fisica && (
                <div className="form-group span-2 animated-fade-in">
                  <label className="form-label">Qual atividade e frequência semanal?</label>
                  <input
                    type="text"
                    name="atividade_fisica_descricao"
                    className="form-input"
                    placeholder="Ex: Musculação 4x na semana e corrida aos sábados"
                    value={formData.atividade_fisica_descricao}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="form-group span-2">
                <label className="form-label">Observações Gerais</label>
                <textarea
                  name="observacoes"
                  rows="3"
                  className="form-input"
                  placeholder="Histórico complementar, preferências alimentares, estilo de vida..."
                  value={formData.observacoes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="form-footer-actions">
          <div style={{ display: 'flex', gap: '10px' }}>
            {activeTab !== 'pessoal' && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  if (activeTab === 'habitos') setActiveTab('clinico');
                  else if (activeTab === 'clinico') setActiveTab('pessoal');
                }}
              >
                Aba Anterior
              </button>
            )}
            {activeTab !== 'habitos' && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  if (activeTab === 'pessoal') setActiveTab('clinico');
                  else if (activeTab === 'clinico') setActiveTab('habitos');
                }}
              >
                Próxima Aba →
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: 'auto', padding: '12px 28px' }}>
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Salvando Paciente...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{initialData ? 'Salvar Alterações' : 'Cadastrar Paciente'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
