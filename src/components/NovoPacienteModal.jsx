import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createPaciente } from '../services/neonDb';

export function NovoPacienteModal({ nutricionistaId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    data_nascimento: '',
    sexo: 'Feminino',
    peso_inicial: '',
    altura: '',
    objetivos: '',
    restricoes_alimentares: '',
    observacoes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 6) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    } else if (val.length > 2) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    } else if (val.length > 0) {
      val = `(${val}`;
    }
    setFormData((prev) => ({ ...prev, whatsapp: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      setError('Por favor, informe o nome do paciente.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        nutricionista_id: nutricionistaId,
        nome: formData.nome.trim(),
        email: formData.email.trim() || null,
        whatsapp: formData.whatsapp.trim() || null,
        data_nascimento: formData.data_nascimento || null,
        sexo: formData.sexo,
        peso_inicial: formData.peso_inicial ? parseFloat(formData.peso_inicial) : null,
        altura: formData.altura ? parseFloat(formData.altura) : null,
        objetivos: formData.objetivos ? formData.objetivos.split(',').map(s => s.trim()) : [],
        restricoes_alimentares: formData.restricoes_alimentares ? formData.restricoes_alimentares.split(',').map(s => s.trim()) : [],
        observacoes: formData.observacoes.trim() || null
      };

      const newPac = await createPaciente(payload);
      onSuccess(newPac);
      onClose();
    } catch (err) {
      console.error('Erro ao cadastrar paciente:', err);
      setError(err.message || 'Erro ao cadastrar paciente no Neon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar-icon-box" style={{ background: '#e0f2fe' }}>
              <UserPlus size={22} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
                Cadastrar Novo Paciente
              </h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Os dados serão salvos em tempo real no banco Neon
              </span>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="alert-error" style={{ marginBottom: '16px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Nome Completo *</label>
              <input
                type="text"
                name="nome"
                required
                className="form-input"
                style={{ paddingLeft: '14px' }}
                placeholder="Ex: Maria Eduarda Silva"
                value={formData.nome}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp</label>
              <input
                type="text"
                name="whatsapp"
                className="form-input"
                style={{ paddingLeft: '14px' }}
                placeholder="(00) 00000-0000"
                value={formData.whatsapp}
                onChange={handlePhoneChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                name="email"
                className="form-input"
                style={{ paddingLeft: '14px' }}
                placeholder="paciente@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Data de Nascimento</label>
              <input
                type="date"
                name="data_nascimento"
                className="form-input"
                style={{ paddingLeft: '14px' }}
                value={formData.data_nascimento}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sexo</label>
              <select
                name="sexo"
                className="form-input"
                style={{ paddingLeft: '14px' }}
                value={formData.sexo}
                onChange={handleChange}
              >
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Peso Inicial (kg)</label>
              <input
                type="number"
                step="0.1"
                name="peso_inicial"
                className="form-input"
                style={{ paddingLeft: '14px' }}
                placeholder="Ex: 68.5"
                value={formData.peso_inicial}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Altura (m)</label>
              <input
                type="number"
                step="0.01"
                name="altura"
                className="form-input"
                style={{ paddingLeft: '14px' }}
                placeholder="Ex: 1.65"
                value={formData.altura}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Objetivos (separados por vírgula)</label>
              <input
                type="text"
                name="objetivos"
                className="form-input"
                style={{ paddingLeft: '14px' }}
                placeholder="Ex: Emagrecimento, Ganho de massa muscular, Reeducação alimentar"
                value={formData.objetivos}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Restrições / Alergias Alimentares</label>
              <input
                type="text"
                name="restricoes_alimentares"
                className="form-input"
                style={{ paddingLeft: '14px' }}
                placeholder="Ex: Intolerância a lactose, Sem glúten"
                value={formData.restricoes_alimentares}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Observações Adicionais</label>
              <textarea
                name="observacoes"
                rows="2"
                className="form-input"
                style={{ paddingLeft: '14px', resize: 'vertical' }}
                placeholder="Histórico clínico relevante, medicamentos ou hábitos..."
                value={formData.observacoes}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0', marginTop: '16px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Salvando no Neon...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Cadastrar Paciente</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
