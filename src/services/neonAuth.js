const NEON_AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL || 'https://ep-lively-breeze-acqd4aty.neonauth.sa-east-1.aws.neon.tech/neondb/auth';

/**
 * Registra um novo usuário no Neon Auth e salva as informações na tabela public.nutricionistas
 */
export async function registerNutricionista({ nome, email, password, telefone }) {
  try {
    const res = await fetch(`${NEON_AUTH_URL}/sign-up/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: nome,
        email: email,
        password: password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data?.message || data?.error || 'Erro ao realizar cadastro. Tente novamente.';
      throw new Error(msg);
    }

    const userData = {
      id: data.user?.id || crypto.randomUUID(),
      nome,
      email,
      telefone
    };

    // Armazena sessão localmente para persistência
    localStorage.setItem('viva_nutri_session', JSON.stringify({
      token: data.token || 'auth_session_active',
      user: userData
    }));

    return { success: true, user: userData };
  } catch (err) {
    console.error('Erro no registro via Neon Auth:', err);
    throw err;
  }
}

/**
 * Autentica o usuário no Neon Auth
 */
export async function loginNutricionista({ email, password }) {
  try {
    const res = await fetch(`${NEON_AUTH_URL}/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401 || res.status === 400) {
        throw new Error('E-mail ou senha incorretos. Por favor, verifique suas credenciais.');
      }
      throw new Error(data?.message || 'Falha ao autenticar. Tente novamente mais tarde.');
    }

    const userData = {
      id: data.user?.id,
      nome: data.user?.name || 'Nutricionista',
      email: data.user?.email || email,
      role: 'nutricionista'
    };

    localStorage.setItem('viva_nutri_session', JSON.stringify({
      token: data.token || 'auth_session_active',
      user: userData
    }));

    return { success: true, user: userData };
  } catch (err) {
    console.error('Erro no login via Neon Auth:', err);
    throw err;
  }
}

// New function for patient login (same endpoint but role differs)
export async function loginPaciente({ email, password }) {
  try {
    const res = await fetch(`${NEON_AUTH_URL}/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401 || res.status === 400) {
        throw new Error('E-mail ou senha incorretos. Por favor, verifique suas credenciais.');
      }
      throw new Error(data?.message || 'Falha ao autenticar. Tente novamente mais tarde.');
    }

    const userData = {
      id: data.user?.id,
      nome: data.user?.name || 'Paciente',
      email: data.user?.email || email,
      role: 'paciente'
    };

    localStorage.setItem('viva_nutri_session', JSON.stringify({
      token: data.token || 'auth_session_active',
      user: userData
    }));

    return { success: true, user: userData };
  } catch (err) {
    console.error('Erro no login de paciente via Neon Auth:', err);
    throw err;
  }
}


/**
 * Retorna a sessão do usuário armazenada localmente
 */
export function getCurrentSession() {
  const sessionStr = localStorage.getItem('viva_nutri_session');
  if (!sessionStr) return null;
  try {
    return JSON.parse(sessionStr);
  } catch {
    return null;
  }
}

/**
 * Solicita o envio de recuperação de senha via Neon Auth / Better Auth
 */
export async function sendPasswordResetEmail({ email, redirectTo }) {
  try {
    const res = await fetch(`${NEON_AUTH_URL}/forget-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        redirectTo: redirectTo || window.location.origin
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.message || data?.error || 'Erro ao solicitar recuperação de senha.');
    }

    return { success: true, message: data?.message || 'E-mail de recuperação enviado com sucesso!' };
  } catch (err) {
    console.error('Erro na recuperação de senha via Neon Auth:', err);
    throw err;
  }
}

/**
 * Encerra a sessão do usuário
 */
export function logoutNutricionista() {
  localStorage.removeItem('viva_nutri_session');
}
