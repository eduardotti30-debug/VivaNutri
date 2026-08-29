import { neon } from '@neondatabase/serverless';

const DATABASE_URL = import.meta.env.VITE_NEON_DATABASE_URL || 'postgresql://neondb_owner:npg_KdagG3pl1XCh@ep-lively-breeze-acqd4aty-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

// Inicializa o client SQL serverless do Neon via HTTP
const sql = neon(DATABASE_URL);

/**
 * Busca estatísticas completas em tempo real para o Dashboard do nutricionista logado
 * @param {string} nutricionistaId - ID do nutricionista logado
 */
export async function getDashboardData(nutricionistaId) {
  if (!nutricionistaId) {
    return {
      totalPacientes: 0,
      consultasSemana: 0,
      pacientesSemRetorno: [],
      pacientesRecentes: []
    };
  }

  try {
    // 1. Total de pacientes ativos cadastrados pelo nutricionista
    const totalPacientesRes = await sql.query(
      'SELECT COUNT(*)::int AS total FROM pacientes WHERE nutricionista_id = $1',
      [nutricionistaId]
    );
    const totalPacientes = totalPacientesRes[0]?.total || 0;

    // 2. Consultas da semana atual (segunda-feira a domingo da semana corrente)
    const consultasSemanaRes = await sql.query(
      `SELECT COUNT(c.id)::int AS total
       FROM consultas c
       INNER JOIN pacientes p ON p.id = c.paciente_id
       WHERE p.nutricionista_id = $1
         AND c.data_consulta >= DATE_TRUNC('week', CURRENT_DATE)
         AND c.data_consulta < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'`,
      [nutricionistaId]
    );
    const consultasSemana = consultasSemanaRes[0]?.total || 0;

    // 3. Pacientes sem retorno:
    // Pacientes cuja última consulta foi há mais de 30 dias e que não possuem próximo retorno agendado (ou proximo_retorno < CURRENT_DATE)
    const pacientesSemRetornoRes = await sql.query(
      `WITH ultimas_consultas AS (
         SELECT 
           p.id,
           p.nome,
           p.whatsapp,
           p.email,
           p.created_at,
           MAX(c.data_consulta) AS ultima_consulta,
           MAX(c.proximo_retorno) AS proximo_retorno,
           COUNT(c.id)::int AS total_consultas
         FROM pacientes p
         LEFT JOIN consultas c ON c.paciente_id = p.id
         WHERE p.nutricionista_id = $1
         GROUP BY p.id, p.nome, p.whatsapp, p.email, p.created_at
       )
       SELECT 
         id,
         nome,
         whatsapp,
         email,
         ultima_consulta,
         proximo_retorno,
         total_consultas,
         COALESCE(
           CURRENT_DATE - ultima_consulta, 
           CURRENT_DATE - created_at::date
         ) AS dias_sem_consulta
       FROM ultimas_consultas
       WHERE 
         (
           ultima_consulta IS NOT NULL 
           AND ultima_consulta < CURRENT_DATE - INTERVAL '30 days'
           AND (proximo_retorno IS NULL OR proximo_retorno < CURRENT_DATE)
         )
         OR
         (
           total_consultas = 0
           AND created_at < CURRENT_DATE - INTERVAL '30 days'
           AND (proximo_retorno IS NULL OR proximo_retorno < CURRENT_DATE)
         )
       ORDER BY dias_sem_consulta DESC`,
      [nutricionistaId]
    );

    // 4. Últimos pacientes cadastrados (para visualização rápida)
    const pacientesRecentesRes = await sql.query(
      `SELECT id, nome, email, whatsapp, created_at 
       FROM pacientes 
       WHERE nutricionista_id = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [nutricionistaId]
    );

    return {
      totalPacientes,
      consultasSemana,
      pacientesSemRetorno: pacientesSemRetornoRes || [],
      pacientesRecentes: pacientesRecentesRes || []
    };
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard no Neon:', error);
    throw error;
  }
}

/**
 * Busca a lista de todos os pacientes do nutricionista
 */
export async function getPacientes(nutricionistaId) {
  if (!nutricionistaId) return [];

  try {
    const res = await sql.query(
      `SELECT 
         p.*,
         MAX(c.data_consulta) AS ultima_consulta,
         MAX(c.proximo_retorno) AS proximo_retorno,
         COUNT(c.id)::int AS total_consultas
       FROM pacientes p
       LEFT JOIN consultas c ON c.paciente_id = p.id
       WHERE p.nutricionista_id = $1
       GROUP BY p.id
       ORDER BY p.nome ASC`,
      [nutricionistaId]
    );
    return res || [];
  } catch (error) {
    console.error('Erro ao listar pacientes no Neon:', error);
    throw error;
  }
}

/**
 * Busca detalhes completos de um paciente (incluindo consultas e planos)
 */
export async function getPacienteDetails(pacienteId, nutricionistaId) {
  try {
    const pacienteRes = await sql.query(
      'SELECT * FROM pacientes WHERE id = $1 AND nutricionista_id = $2',
      [pacienteId, nutricionistaId]
    );

    if (!pacienteRes || pacienteRes.length === 0) {
      throw new Error('Paciente não encontrado.');
    }

    const consultasRes = await sql.query(
      'SELECT * FROM consultas WHERE paciente_id = $1 ORDER BY data_consulta DESC',
      [pacienteId]
    );

    const planosRes = await sql.query(
      'SELECT * FROM planos_alimentares WHERE paciente_id = $1 ORDER BY created_at DESC',
      [pacienteId]
    );

    return {
      paciente: pacienteRes[0],
      consultas: consultasRes || [],
      planos: planosRes || []
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes do paciente no Neon:', error);
    throw error;
  }
}

/**
 * Cadastra um novo paciente no Neon
 */
export async function createPaciente(pacienteData) {
  try {
    const {
      nutricionista_id,
      nome,
      data_nascimento,
      sexo,
      telefone,
      whatsapp,
      email,
      peso_inicial,
      altura,
      imc,
      objetivos,
      objetivo_texto,
      nivel_atividade,
      patologias,
      restricoes_alimentares,
      alergias,
      medicamentos,
      suplementos,
      refeicoes_por_dia,
      horario_acorda,
      horario_dorme,
      litros_agua,
      atividade_fisica,
      atividade_fisica_descricao,
      observacoes
    } = pacienteData;

    const res = await sql.query(
      `INSERT INTO pacientes (
         nutricionista_id, nome, data_nascimento, sexo, telefone, whatsapp, email,
         peso_inicial, altura, imc, objetivos, objetivo_texto, nivel_atividade,
         patologias, restricoes_alimentares, alergias, medicamentos,
         suplementos, refeicoes_por_dia, horario_acorda, horario_dorme,
         litros_agua, atividade_fisica, atividade_fisica_descricao, observacoes
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7,
         $8, $9, $10, $11, $12, $13,
         $14, $15, $16, $17,
         $18, $19, $20, $21,
         $22, $23, $24, $25
       ) RETURNING *`,
      [
        nutricionista_id, nome, data_nascimento || null, sexo || null, telefone || null, whatsapp || null, email || null,
        peso_inicial || null, altura || null, imc || null, objetivos || [], objetivo_texto || null, nivel_atividade || null,
        patologias || [], restricoes_alimentares || [], alergias || [], medicamentos || null,
        suplementos || null, refeicoes_por_dia || null, horario_acorda || null, horario_dorme || null,
        litros_agua || null, atividade_fisica ?? false, atividade_fisica_descricao || null, observacoes || null
      ]
    );

    return res[0];
  } catch (error) {
    console.error('Erro ao cadastrar paciente no Neon:', error);
    throw error;
  }
}

/**
  Atualiza os dados de um paciente existente no Neon
 */
export async function updatePaciente(pacienteId, nutricionistaId, pacienteData) {
  try {
    const {
      nome,
      data_nascimento,
      sexo,
      telefone,
      whatsapp,
      email,
      peso_inicial,
      altura,
      imc,
      objetivos,
      objetivo_texto,
      nivel_atividade,
      patologias,
      restricoes_alimentares,
      alergias,
      medicamentos,
      suplementos,
      refeicoes_por_dia,
      horario_acorda,
      horario_dorme,
      litros_agua,
      atividade_fisica,
      atividade_fisica_descricao,
      observacoes
    } = pacienteData;

    const res = await sql.query(
      `UPDATE pacientes SET
         nome = $1,
         data_nascimento = $2,
         sexo = $3,
         telefone = $4,
         whatsapp = $5,
         email = $6,
         peso_inicial = $7,
         altura = $8,
         imc = $9,
         objetivos = $10,
         objetivo_texto = $11,
         nivel_atividade = $12,
         patologias = $13,
         restricoes_alimentares = $14,
         alergias = $15,
         medicamentos = $16,
         suplementos = $17,
         refeicoes_por_dia = $18,
         horario_acorda = $19,
         horario_dorme = $20,
         litros_agua = $21,
         atividade_fisica = $22,
         atividade_fisica_descricao = $23,
         observacoes = $24
       WHERE id = $25 AND nutricionista_id = $26
       RETURNING *`,
      [
        nome, data_nascimento || null, sexo || null, telefone || null, whatsapp || null, email || null,
        peso_inicial || null, altura || null, imc || null, objetivos || [], objetivo_texto || null, nivel_atividade || null,
        patologias || [], restricoes_alimentares || [], alergias || [], medicamentos || null,
        suplementos || null, refeicoes_por_dia || null, horario_acorda || null, horario_dorme || null,
        litros_agua || null, atividade_fisica ?? false, atividade_fisica_descricao || null, observacoes || null,
        pacienteId, nutricionistaId
      ]
    );

    return res[0];
  } catch (error) {
    console.error('Erro ao atualizar paciente no Neon:', error);
    throw error;
  }
}

/**
  Deleta um paciente no Neon
 */
export async function deletePaciente(pacienteId, nutricionistaId) {
  try {
    await sql.query(
      'DELETE FROM pacientes WHERE id = $1 AND nutricionista_id = $2',
      [pacienteId, nutricionistaId]
    );
    return true;
  } catch (error) {
    console.error('Erro ao deletar paciente no Neon:', error);
    throw error;
  }
}

