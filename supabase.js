import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── USUÁRIOS ────────────────────────────────────────────────────────────────

export async function criarUsuario(dados) {
  const { data, error } = await supabase
    .from("usuarios")
    .insert([{
      nome: dados.nome,
      cpf: dados.cpf,
      telefone: dados.telefone,
      email: dados.email,
      plano: "free",
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function buscarUsuarioPorCPF(cpf) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("cpf", cpf)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function buscarUsuarioPorId(id) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*, cronogramas(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function listarUsuarios() {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*, questoes_historico(count), simulados(count)")
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return data;
}

// ─── CRONOGRAMA ───────────────────────────────────────────────────────────────

export async function salvarCronograma(usuarioId, cronograma) {
  // Upsert: atualiza se já existe, insere se não existe
  const { data, error } = await supabase
    .from("cronogramas")
    .upsert([{
      usuario_id: usuarioId,
      meta: cronograma.meta,
      horas_dia: cronograma.horasDia,
      dias_semana: cronograma.diasSemana,
      materias: cronograma.materias,
      data_prova: cronograma.dataProva || null,
    }], { onConflict: "usuario_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function buscarCronograma(usuarioId) {
  const { data, error } = await supabase
    .from("cronogramas")
    .select("*")
    .eq("usuario_id", usuarioId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

// ─── QUESTÕES ─────────────────────────────────────────────────────────────────

export async function salvarQuestao(usuarioId, questao) {
  const { data, error } = await supabase
    .from("questoes_historico")
    .insert([{
      usuario_id: usuarioId,
      materia: questao.materia,
      banca: questao.banca,
      dificuldade: questao.dificuldade,
      enunciado: questao.enunciado,
      gabarito: questao.gabarito,
      resposta_aluno: questao.respostaAluno,
      acertou: questao.acertou,
      tempo_segundos: questao.tempoSegundos || 0,
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function buscarHistoricoQuestoes(usuarioId, limite = 50) {
  const { data, error } = await supabase
    .from("questoes_historico")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("criado_em", { ascending: false })
    .limit(limite);
  if (error) throw error;
  return data || [];
}

export async function buscarEstatisticasQuestoes(usuarioId) {
  const { data, error } = await supabase
    .from("questoes_historico")
    .select("materia, acertou")
    .eq("usuario_id", usuarioId);
  if (error) throw error;

  const total = data.length;
  const acertos = data.filter((q) => q.acertou).length;
  const porMateria = {};
  data.forEach((q) => {
    if (!porMateria[q.materia]) porMateria[q.materia] = { total: 0, acertos: 0 };
    porMateria[q.materia].total++;
    if (q.acertou) porMateria[q.materia].acertos++;
  });
  return { total, acertos, taxa: total ? Math.round((acertos / total) * 100) : 0, porMateria };
}

// ─── SIMULADOS ────────────────────────────────────────────────────────────────

export async function salvarSimulado(usuarioId, resultado) {
  const { data, error } = await supabase
    .from("simulados")
    .insert([{
      usuario_id: usuarioId,
      tipo: resultado.tipo,
      total_questoes: resultado.totalQuestoes,
      acertos: resultado.acertos,
      nota: resultado.nota,
      tempo_minutos: resultado.tempoMinutos || 0,
      respostas: resultado.respostas || [],
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function buscarSimulados(usuarioId) {
  const { data, error } = await supabase
    .from("simulados")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return data || [];
}

// ─── SESSÕES DE ESTUDO ────────────────────────────────────────────────────────

export async function registrarSessaoEstudo(usuarioId, questoesRespondidas, acertos, tempoMinutos) {
  const hoje = new Date().toISOString().split("T")[0];

  // Tenta atualizar sessão do dia, se não existir cria nova
  const { data: existing } = await supabase
    .from("sessoes_estudo")
    .select("*")
    .eq("usuario_id", usuarioId)
    .eq("data", hoje)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from("sessoes_estudo")
      .update({
        questoes_respondidas: existing.questoes_respondidas + questoesRespondidas,
        acertos: existing.acertos + acertos,
        tempo_minutos: existing.tempo_minutos + tempoMinutos,
      })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("sessoes_estudo")
      .insert([{
        usuario_id: usuarioId,
        data: hoje,
        questoes_respondidas: questoesRespondidas,
        acertos: acertos,
        tempo_minutos: tempoMinutos,
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function buscarSessoesUltimos7Dias(usuarioId) {
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - 6);
  const { data, error } = await supabase
    .from("sessoes_estudo")
    .select("*")
    .eq("usuario_id", usuarioId)
    .gte("data", dataInicio.toISOString().split("T")[0])
    .order("data", { ascending: true });
  if (error) throw error;
  return data || [];
}

// ─── SESSÃO LOCAL (substitui localStorage) ───────────────────────────────────

export function salvarSessaoLocal(usuario) {
  localStorage.setItem("aprovadv_usuario", JSON.stringify(usuario));
}

export function getSessaoLocal() {
  try { return JSON.parse(localStorage.getItem("aprovadv_usuario")); }
  catch { return null; }
}

export function limparSessaoLocal() {
  localStorage.removeItem("aprovadv_usuario");
}
