import React, { useState, useEffect } from 'react';
import { X, Calendar, Phone, Mail, User, Clock, AlertCircle, Plus, FileText, CheckCircle2 } from 'lucide-react';
import { getPacienteDetails } from '../services/neonDb';

export function PacienteDetailModal({ pacienteId, nutricionistaId, onClose, onRefreshData }) {
  const [loading, setLoading] = useState(true);
  const [pacienteData, setPacienteData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      if (!pacienteId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getPacienteDetails(pacienteId, nutricionistaId);
        setPacienteData(data);
      } catch (err) {
        console.error('Erro ao carregar detalhes do paciente:', err);
        setError('Não foi possível carregar os dados completos do paciente.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [pacienteId, nutricionistaId]);

  if (!pacienteId) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar-icon-box">
              <User size={22} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
                {pacienteData?.paciente?.nome || 'Perfil do Paciente'}
              </h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Prontuário e histórico de atendimentos
              </span>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {loading && (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <div className="spinner" style={{ borderTopColor: 'var(--primary)', margin: '0 auto 16px auto', width: '32px', height: '32px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Carregando dados do Neon...</p>
            </div>
          )}

          {error && (
            <div className="alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {!loading && pacienteData && (
            <div>
              {/* Informações Básicas */}
              <div className="detail-section">
                <h4 className="detail-section-title">Dados Pessoais & Contato</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Nome Completo</span>
                    <span className="detail-val">{pacienteData.paciente.nome || '--'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">WhatsApp / Telefone</span>
                    <span className="detail-val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} color="var(--accent)" />
                      {pacienteData.paciente.whatsapp ? (
                        <a 
                          href={`https://wa.me/55${pacienteData.paciente.whatsapp.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
                        >
                          {pacienteData.paciente.whatsapp}
                        </a>
                      ) : '--'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">E-mail</span>
                    <span className="detail-val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} color="var(--text-muted)" />
                      {pacienteData.paciente.email || '--'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Data de Nascimento</span>
                    <span className="detail-val">
                      {pacienteData.paciente.data_nascimento 
                        ? new Date(pacienteData.paciente.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR') 
                        : '--'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Peso Inicial</span>
                    <span className="detail-val">{pacienteData.paciente.peso_inicial ? `${pacienteData.paciente.peso_inicial} kg` : '--'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Altura</span>
                    <span className="detail-val">{pacienteData.paciente.altura ? `${pacienteData.paciente.altura} m` : '--'}</span>
                  </div>
                </div>
              </div>

              {/* Objetivos e Estilo de Vida */}
              <div className="detail-section">
                <h4 className="detail-section-title">Objetivos e Rotina</h4>
                <div className="detail-grid">
                  <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                    <span className="detail-label">Objetivos</span>
                    <span className="detail-val">
                      {pacienteData.paciente.objetivos && pacienteData.paciente.objetivos.length > 0
                        ? pacienteData.paciente.objetivos.join(', ')
                        : (pacienteData.paciente.objetivo_texto || 'Não informado')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Restrições / Alergias</span>
                    <span className="detail-val">
                      {pacienteData.paciente.restricoes_alimentares?.length > 0 
                        ? pacienteData.paciente.restricoes_alimentares.join(', ')
                        : 'Nenhuma restrição cadastrada'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Nível de Atividade</span>
                    <span className="detail-val">{pacienteData.paciente.nivel_atividade || 'Não informado'}</span>
                  </div>
                </div>
              </div>

              {/* Histórico de Consultas */}
              <div className="detail-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 className="detail-section-title" style={{ margin: 0 }}>Histórico de Consultas</h4>
                  <span className="badge-count">{pacienteData.consultas?.length || 0} registradas</span>
                </div>

                {pacienteData.consultas && pacienteData.consultas.length > 0 ? (
                  <div className="consultas-history-list">
                    {pacienteData.consultas.map((c) => (
                      <div key={c.id} className="consulta-history-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={16} color="var(--primary)" />
                            {new Date(c.data_consulta + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                          {c.proximo_retorno ? (
                            <span className="badge-tag">
                              Retorno: {new Date(c.proximo_retorno + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </span>
                          ) : (
                            <span className="badge-tag badge-warning">Sem retorno agendado</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {c.peso && <span><strong>Peso:</strong> {c.peso} kg</span>}
                          {c.percentual_gordura && <span><strong>% Gordura:</strong> {c.percentual_gordura}%</span>}
                          {c.cintura && <span><strong>Cintura:</strong> {c.cintura} cm</span>}
                        </div>
                        {c.observacoes && (
                          <p style={{ marginTop: '8px', fontSize: '0.85rem', color: '#475569', fontStyle: 'italic' }}>
                            "{c.observacoes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-mini-box">
                    <Calendar size={20} color="var(--text-muted)" />
                    <span>Nenhuma consulta registrada para este paciente ainda.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Fechar
          </button>
          {pacienteData?.paciente?.whatsapp && (
            <a
              href={`https://wa.me/55${pacienteData.paciente.whatsapp.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(pacienteData.paciente.nome)},%20tudo%20bem?%20Gostaria%20de%20agendar%20sua%20próxima%20consulta%20nutricional.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <Phone size={16} />
              <span>Contatar via WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
