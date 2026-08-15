import React, { useState } from 'react';
import { User, Mail, Lock, Phone, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { Logo } from '../components/Logo';
import { registerNutricionista } from '../services/neonAuth';

export function Register({ onSwitchToLogin, onRegisterSuccess }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefone, setTelefone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Máscara para telefone no formato (xx) xxxxx-xxxx
  const handleTelefoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }

    setTelefone(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nome || !email || !password || !confirmPassword || !telefone) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password.length < 9) {
      setError('A senha deve ter no mínimo 9 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const result = await registerNutricionista({ nome, email, password, telefone });
      if (result.success) {
        onRegisterSuccess(result.user);
      }
    } catch (err) {
      setError(err.message || 'Erro ao efetuar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Logo size="large" />
          <h2 className="auth-title">Criar Conta</h2>
          <p className="auth-subtitle">Cadastre-se para gerenciar seus pacientes e consultas</p>
        </div>

        {error && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nome Completo</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                type="text"
                className="form-input"
                placeholder="Dra. Mariana Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">E-mail</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                className="form-input"
                placeholder="mariana@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Telefone Celular</label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={18} />
              <input
                type="text"
                className="form-input"
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={handleTelefoneChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Senha (mínimo 9 caracteres)</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input has-toggle"
                placeholder="Mínimo de 9 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Senha</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Repita a senha criada"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner" />
                <span>Criando conta...</span>
              </>
            ) : (
              <>
                <span>Criar conta</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Já tem conta?</span>
          <span className="auth-link" onClick={onSwitchToLogin}>
            Faça login
          </span>
        </div>
      </div>
    </div>
  );
}
