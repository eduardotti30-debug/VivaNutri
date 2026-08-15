import React, { useState } from 'react';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import { Logo } from '../components/Logo';
import { sendPasswordResetEmail } from '../services/neonAuth';

export function ForgotPassword({ onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Por favor, informe seu e-mail cadastrado.');
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail({
        email,
        redirectTo: window.location.origin
      });
      setSuccess('Enviamos as instruções e o link de recuperação para o seu e-mail!');
    } catch (err) {
      setError(err.message || 'Não foi possível solicitar a recuperação de senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Logo size="large" />
          <h2 className="auth-title">Recuperar Senha</h2>
          <p className="auth-subtitle">
            Informe o e-mail associado à sua conta para receber as instruções de redefinição
          </p>
        </div>

        {error && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}
          >
            <CheckCircle2 size={18} style={{ color: '#059669', flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">E-mail cadastrado</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Enviando link...</span>
                </>
              ) : (
                <>
                  <span>Enviar instruções</span>
                  <Send size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="btn-primary"
            onClick={onSwitchToLogin}
            style={{ marginTop: '8px' }}
          >
            <ArrowLeft size={18} />
            <span>Voltar para o Login</span>
          </button>
        )}

        <div className="auth-footer">
          <span
            className="auth-link"
            onClick={onSwitchToLogin}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} />
            Voltar para o login
          </span>
        </div>
      </div>
    </div>
  );
}
