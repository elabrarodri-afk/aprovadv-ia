import { useState, useEffect, useRef, useCallback } from "react";
import { salvarSimulado, getSessaoLocal } from "./supabase";

// ─── THEME ───────────────────────────────────────────────
const T = {
  bg: "#0A0B0F",
  bgCard: "#12131A",
  bgHover: "#181924",
  bgSurface: "#1A1B26",
  border: "#1E2030",
  borderLight: "#2A2D42",
  text: "#E8E9F0",
  textMuted: "#6B7094",
  textDim: "#4A4E6A",
  accent: "#D72638",
  accentLight: "#FF4F5E",
  accentGlow: "rgba(215, 38, 56, 0.15)",
  accentGlowStrong: "rgba(215, 38, 56, 0.25)",
  green: "#34D399",
  greenBg: "rgba(52, 211, 153, 0.08)",
  greenBorder: "rgba(52, 211, 153, 0.25)",
  red: "#F87171",
  redBg: "rgba(248, 113, 113, 0.08)",
  redBorder: "rgba(248, 113, 113, 0.25)",
  amber: "#FBBF24",
  amberBg: "rgba(251, 191, 36, 0.08)",
  amberBorder: "rgba(251, 191, 36, 0.25)",
  blue: "#60A5FA",
  blueBg: "rgba(96, 165, 250, 0.08)",
  cyan: "#22D3EE",
  cyanBg: "rgba(34, 211, 238, 0.08)",
  cyanBorder: "rgba(34, 211, 238, 0.25)",
};

// ─── AREAS 2ª FASE ──────────────────────────────────────
const AREAS_2FASE = [
  { id: "civil", nome: "Direito Civil", icon: "📜", pecas: ["Petição Inicial", "Contestação", "Recurso de Apelação", "Embargos de Declaração", "Agravo de Instrumento"] },
  { id: "penal", nome: "Direito Penal", icon: "🔒", pecas: ["Habeas Corpus", "Recurso em Sentido Estrito", "Apelação Criminal", "Resposta à Acusação", "Revisão Criminal"] },
  { id: "trabalho", nome: "Direito do Trabalho", icon: "👷", pecas: ["Reclamação Trabalhista", "Contestação Trabalhista", "Recurso Ordinário", "Mandado de Segurança", "Embargos de Declaração"] },
  { id: "constitucional", nome: "Direito Constitucional", icon: "⚖", pecas: ["Mandado de Segurança", "Habeas Data", "Ação Popular", "ADI", "Reclamação Constitucional"] },
  { id: "administrativo", nome: "Direito Administrativo", icon: "🏛", pecas: ["Mandado de Segurança", "Ação Civil Pública", "Ação de Improbidade", "Recurso Administrativo", "Ação Anulatória"] },
  { id: "tributario", nome: "Direito Tributário", icon: "💰", pecas: ["Mandado de Segurança", "Ação Declaratória", "Ação Anulatória de Débito", "Embargos à Execução Fiscal", "Exceção de Pré-executividade"] },
  { id: "empresarial", nome: "Direito Empresarial", icon: "🏢", pecas: ["Pedido de Falência", "Recuperação Judicial", "Ação de Dissolução", "Embargos do Devedor", "Habilitação de Crédito"] },
];

// ─── CONFIG PRESETS ──────────────────────────────────────
const EXAM_PRESETS = [
  {
    id: "oab",
    title: "OAB — 1ª Fase",
    subtitle: "Exame de Ordem · 80 questões objetivas",
    icon: "⚖",
    phase: 1,
    questions: 80,
    duration: 300,
    materias: [
      { nome: "Ética Profissional", qtd: 8 },
      { nome: "Direito Constitucional", qtd: 8 },
      { nome: "Direito Civil", qtd: 8 },
      { nome: "Direito Penal", qtd: 8 },
      { nome: "Direito do Trabalho", qtd: 7 },
      { nome: "Direito Processual Civil", qtd: 8 },
      { nome: "Direito Processual Penal", qtd: 7 },
      { nome: "Direito Administrativo", qtd: 7 },
      { nome: "Direito Tributário", qtd: 6 },
      { nome: "Direito Empresarial", qtd: 5 },
      { nome: "Direitos Humanos", qtd: 4 },
      { nome: "Direito Ambiental", qtd: 4 },
    ],
    banca: "FGV",
    aprovacao: 50,
    color: T.accent,
  },
  {
    id: "oab2",
    title: "OAB — 2ª Fase",
    subtitle: "Prático-profissional · Questões discursivas + Peça processual",
    icon: "📝",
    phase: 2,
    duration: 300,
    banca: "FGV",
    color: T.cyan,
  },
  {
    id: "oab-mini",
    title: "OAB — 1ª Fase Rápida",
    subtitle: "20 questões · Treino diário",
    icon: "⚡",
    phase: 1,
    questions: 20,
    duration: 75,
    materias: [
      { nome: "Ética Profissional", qtd: 2 },
      { nome: "Direito Constitucional", qtd: 3 },
      { nome: "Direito Civil", qtd: 3 },
      { nome: "Direito Penal", qtd: 3 },
      { nome: "Direito Processual Civil", qtd: 3 },
      { nome: "Direito Administrativo", qtd: 2 },
      { nome: "Direito do Trabalho", qtd: 2 },
      { nome: "Direito Tributário", qtd: 2 },
    ],
    banca: "FGV",
    aprovacao: 50,
    color: T.amber,
  },
  {
    id: "magistratura",
    title: "Concurso — Magistratura",
    subtitle: "30 questões · Nível avançado",
    icon: "🏛",
    phase: 1,
    questions: 30,
    duration: 120,
    materias: [
      { nome: "Direito Constitucional", qtd: 5 },
      { nome: "Direito Civil", qtd: 5 },
      { nome: "Direito Processual Civil", qtd: 5 },
      { nome: "Direito Penal", qtd: 5 },
      { nome: "Direito Processual Penal", qtd: 4 },
      { nome: "Direito Administrativo", qtd: 3 },
      { nome: "Direito Tributário", qtd: 3 },
    ],
    banca: "CESPE/CEBRASPE",
    aprovacao: 70,
    color: T.blue,
  },
  {
    id: "custom",
    title: "Simulado Personalizado",
    subtitle: "Monte seu próprio simulado",
    icon: "✦",
    phase: 1,
    questions: 10,
    duration: 40,
    materias: [{ nome: "Direito Constitucional", qtd: 10 }],
    banca: "FGV",
    aprovacao: 50,
    color: T.green,
  },
];

// ─── CLAUDE API ──────────────────────────────────────────
async function askClaude(systemPrompt, userPrompt, maxTokens = 1000) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + import.meta.env.VITE_OPENAI_KEY },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: maxTokens,
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function generateBatchQuestions(materia, qtd, banca) {
  const sys = `Você é um gerador de questões jurídicas para OAB e concursos. Responda APENAS com JSON válido (sem markdown, sem backticks). Gere um array de ${qtd} questões. Estrutura:
[{"enunciado":"texto","alternativas":[{"letra":"A","texto":"..."},{"letra":"B","texto":"..."},{"letra":"C","texto":"..."},{"letra":"D","texto":"..."}],"gabarito":"A","tema":"subtema"}]
Cada questão deve ter temas DIFERENTES. Questões realistas no estilo ${banca}.`;
  const user = `Gere ${qtd} questões de ${materia}, estilo banca ${banca}. Temas variados. Responda SOMENTE com JSON.`;
  const raw = await askClaude(sys, user);
  try {
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return Array.from({ length: qtd }, (_, i) => ({
      enunciado: `[Erro ao gerar questão ${i + 1} de ${materia}]`,
      alternativas: [{ letra: "A", texto: "A" }, { letra: "B", texto: "B" }, { letra: "C", texto: "C" }, { letra: "D", texto: "D" }],
      gabarito: "A", tema: materia,
    }));
  }
}

// ─── 2ª FASE AI FUNCTIONS ────────────────────────────────
async function generate2FaseExam(area) {
  const sys = `Você é um elaborador de provas da OAB 2ª Fase, área ${area.nome}. Responda APENAS com JSON (sem markdown/backticks).
Gere um exame completo da 2ª fase com:
1) 4 questões discursivas (cada uma vale 1.25 pontos, total 5.0)
2) 1 caso prático para elaboração de peça processual (vale 5.0 pontos)

Estrutura JSON:
{
  "questoes_discursivas": [
    {
      "numero": 1,
      "enunciado": "enunciado completo e detalhado da questão discursiva com caso concreto",
      "tema": "subtema da área",
      "pontuacao": 1.25,
      "criterios": ["critério de correção 1", "critério 2", "critério 3", "critério 4"]
    }
  ],
  "peca_profissional": {
    "caso": "narrativa completa e detalhada do caso concreto (mínimo 3 parágrafos com fatos, datas, nomes fictícios, valores, situação processual)",
    "tipo_peca_esperada": "tipo da peça processual que deve ser elaborada",
    "pontuacao": 5.0,
    "criterios": [
      {"criterio": "Endereçamento correto", "peso": 0.5},
      {"criterio": "Qualificação das partes", "peso": 0.3},
      {"criterio": "Fatos e fundamentação jurídica", "peso": 1.5},
      {"criterio": "Pedidos adequados", "peso": 1.0},
      {"criterio": "Linguagem técnica e formatação", "peso": 0.7},
      {"criterio": "Tese jurídica correta", "peso": 1.0}
    ]
  }
}

O caso da peça deve ser COMPLETO e realista, com todos os fatos necessários para o candidato elaborar a peça.`;
  const user = `Gere um exame completo da OAB 2ª Fase, área: ${area.nome}. O caso da peça prático-profissional deve ser bem detalhado e realista. SOMENTE JSON.`;
  const raw = await askClaude(sys, user, 2000);
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  catch { throw new Error("Erro ao gerar prova."); }
}

async function gradeDiscursiva(questao, resposta) {
  const sys = `Você é um corretor da OAB 2ª Fase. Corrija a resposta discursiva. Responda APENAS com JSON (sem markdown/backticks):
{"nota":0.0,"nota_maxima":${questao.pontuacao},"feedback_geral":"avaliação geral 2 parágrafos","criterios_avaliados":[{"criterio":"nome","atendido":true,"comentario":"explicação"}],"resposta_modelo":"resposta ideal 1-2 parágrafos","pontos_fortes":["..."],"pontos_fracos":["..."],"sugestoes":["..."]}
Seja rigoroso mas justo.`;
  const user = `Questão: ${questao.enunciado}\nCritérios: ${questao.criterios.join("; ")}\n\nResposta do candidato:\n${resposta}\n\nCorrija. SOMENTE JSON.`;
  const raw = await askClaude(sys, user, 1500);
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  catch { return { nota: 0, nota_maxima: questao.pontuacao, feedback_geral: raw, criterios_avaliados: [], resposta_modelo: "", pontos_fortes: [], pontos_fracos: [], sugestoes: [] }; }
}

async function gradePeca(pecaInfo, texto) {
  const sys = `Você é um corretor da OAB 2ª Fase, especialista em peças processuais. Corrija a peça. Responda APENAS com JSON (sem markdown/backticks):
{"nota":0.0,"nota_maxima":5.0,"tipo_peca_identificada":"tipo","peca_correta":true,"feedback_geral":"3 parágrafos detalhados","criterios_avaliados":[{"criterio":"nome","nota":0.0,"nota_maxima":0.5,"comentario":"avaliação"}],"estrutura":{"enderecamento":{"presente":true,"correto":true,"comentario":"..."},"qualificacao":{"presente":true,"correto":true,"comentario":"..."},"fatos":{"presente":true,"adequado":true,"comentario":"..."},"fundamentacao":{"presente":true,"adequada":true,"comentario":"..."},"pedidos":{"presente":true,"adequados":true,"comentario":"..."},"fechamento":{"presente":true,"correto":true,"comentario":"..."}},"pontos_fortes":["..."],"pontos_fracos":["..."],"sugestoes":["..."],"nota_pratica":"avaliação de chance real de aprovação"}
Se a peça estiver errada (tipo errado), nota máxima é 0. Rigor de corretor FGV.`;
  const user = `Caso: ${pecaInfo.caso}\nPeça esperada: ${pecaInfo.tipo_peca_esperada}\nCritérios:\n${pecaInfo.criterios.map(c => `- ${c.criterio} (${c.peso}pt)`).join("\n")}\n\nPeça do candidato:\n${texto}\n\nCorrija detalhadamente. SOMENTE JSON.`;
  const raw = await askClaude(sys, user, 2000);
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  catch { return { nota: 0, nota_maxima: 5, feedback_geral: raw, criterios_avaliados: [], estrutura: {}, pontos_fortes: [], pontos_fracos: [], sugestoes: [], nota_pratica: "", peca_correta: false, tipo_peca_identificada: "?" }; }
}

// ─── UTILITY ─────────────────────────────────────────────
function formatTime(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function ProgressRing({ value, size = 100, stroke = 6, color = T.accent, children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c - (value / 100) * c;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.border} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>{children}</div>
    </div>
  );
}

const CSS = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
* { box-sizing: border-box; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: ${T.borderLight}; border-radius: 3px; }
textarea { font-family: 'DM Sans', sans-serif; }
textarea:focus { outline: none; border-color: ${T.accent}66 !important; }
`;

// ─── EXAM SELECT ─────────────────────────────────────────
function ExamSelect({ onStart, onStart2Fase }) {
  const [hov, setHov] = useState(null);
  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>△</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>Simulados</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: T.textMuted }}>Escolha um modelo de prova e teste seu conhecimento em condições reais</p>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 28 }}>
        <span style={{ padding: "6px 16px", borderRadius: 20, background: T.accentGlow, border: `1px solid ${T.accent}33`, fontSize: 12, fontWeight: 600, color: T.accentLight }}>1ª Fase — Objetiva</span>
        <span style={{ padding: "6px 16px", borderRadius: 20, background: T.cyanBg, border: `1px solid ${T.cyanBorder}`, fontSize: 12, fontWeight: 600, color: T.cyan }}>2ª Fase — Prático-Profissional</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {EXAM_PRESETS.map((p) => {
          const h = hov === p.id, is2 = p.phase === 2;
          return (
            <button key={p.id} onClick={() => is2 ? onStart2Fase(p) : onStart(p)}
              onMouseEnter={() => setHov(p.id)} onMouseLeave={() => setHov(null)}
              style={{
                background: T.bgCard, border: `1px solid ${h ? p.color + "55" : T.border}`,
                borderRadius: 16, padding: "28px 24px", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                transition: "all 0.25s ease", transform: h ? "translateY(-3px)" : "none",
                boxShadow: h ? `0 12px 40px ${p.color}15` : "none",
                position: "relative", overflow: "hidden",
                gridColumn: is2 ? "1 / -1" : "auto",
              }}>
              {h && <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle, ${p.color}18, transparent)`, pointerEvents: "none" }} />}
              <div style={{ display: is2 ? "flex" : "block", alignItems: "flex-start", gap: 16 }}>
                <div style={{ fontSize: is2 ? 36 : 32, marginBottom: is2 ? 0 : 14, flexShrink: 0 }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.text }}>{p.title}</h3>
                    {is2 && <span style={{ padding: "2px 8px", borderRadius: 5, background: T.cyanBg, border: `1px solid ${T.cyanBorder}`, fontSize: 10, fontWeight: 700, color: T.cyan }}>NOVO</span>}
                  </div>
                  <p style={{ margin: "0 0 14px", fontSize: 12, color: T.textMuted }}>{p.subtitle}</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {is2 ? (
                      <>
                        <span style={{ padding: "4px 10px", borderRadius: 6, background: T.bgSurface, border: `1px solid ${T.border}`, fontSize: 11, color: T.textMuted }}>4 questões discursivas</span>
                        <span style={{ padding: "4px 10px", borderRadius: 6, background: T.bgSurface, border: `1px solid ${T.border}`, fontSize: 11, color: T.textMuted }}>1 peça processual</span>
                        <span style={{ padding: "4px 10px", borderRadius: 6, background: T.bgSurface, border: `1px solid ${T.border}`, fontSize: 11, color: T.textMuted }}>5h de prova</span>
                        <span style={{ padding: "4px 10px", borderRadius: 6, background: T.cyanBg, border: `1px solid ${T.cyanBorder}`, fontSize: 11, fontWeight: 600, color: T.cyan }}>Correção por IA</span>
                      </>
                    ) : (
                      <>
                        <span style={{ padding: "4px 10px", borderRadius: 6, background: T.bgSurface, border: `1px solid ${T.border}`, fontSize: 11, color: T.textMuted }}>{p.questions} questões</span>
                        <span style={{ padding: "4px 10px", borderRadius: 6, background: T.bgSurface, border: `1px solid ${T.border}`, fontSize: 11, color: T.textMuted }}>{Math.floor(p.duration / 60)}h{p.duration % 60 > 0 ? ` ${p.duration % 60}min` : ""}</span>
                        <span style={{ padding: "4px 10px", borderRadius: 6, background: T.bgSurface, border: `1px solid ${T.border}`, fontSize: 11, color: T.textMuted }}>{p.banca}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 2ª FASE: AREA SELECT ────────────────────────────────
function AreaSelect({ onSelect, onBack }) {
  const [hov, setHov] = useState(null);
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
      <button onClick={onBack} style={{ marginBottom: 20, padding: "8px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>← Voltar</button>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>📝</div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>OAB — 2ª Fase</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: T.textMuted }}>Escolha sua área de concentração</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {AREAS_2FASE.map((a) => (
          <button key={a.id} onClick={() => onSelect(a)} onMouseEnter={() => setHov(a.id)} onMouseLeave={() => setHov(null)}
            style={{ background: T.bgCard, border: `1px solid ${hov === a.id ? T.cyan + "55" : T.border}`, borderRadius: 14, padding: "20px", cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "all 0.2s ease", transform: hov === a.id ? "translateY(-2px)" : "none" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{a.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>{a.nome}</div>
            <div style={{ fontSize: 11, color: T.textDim }}>Peças: {a.pecas.slice(0, 3).join(", ")}...</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 2ª FASE: EXAM ───────────────────────────────────────
function Fase2Exam({ area, examData, onFinish }) {
  const [tab, setTab] = useState("q1");
  const [resp, setResp] = useState({ q1: "", q2: "", q3: "", q4: "", peca: "" });
  const [timeLeft, setTimeLeft] = useState(300 * 60);
  const [showConfirm, setShowConfirm] = useState(false);
  const [wc, setWc] = useState({ q1: 0, q2: 0, q3: 0, q4: 0, peca: 0 });
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => { setTimeLeft((t) => { if (t <= 1) { clearInterval(timerRef.current); onFinish(resp); return 0; } return t - 1; }); }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const update = (k, v) => { setResp((p) => ({ ...p, [k]: v })); setWc((p) => ({ ...p, [k]: v.trim().split(/\s+/).filter(Boolean).length })); };
  const tabs = [{ id: "q1", l: "Q1", f: "Questão 1" }, { id: "q2", l: "Q2", f: "Questão 2" }, { id: "q3", l: "Q3", f: "Questão 3" }, { id: "q4", l: "Q4", f: "Questão 4" }, { id: "peca", l: "Peça", f: "Peça Prático-Profissional" }];
  const tw = timeLeft < 1800, tc = timeLeft < 600;
  const isPeca = tab === "peca";
  const qIdx = isPeca ? -1 : parseInt(tab[1]) - 1;
  const cq = isPeca ? null : examData.questoes_discursivas[qIdx];
  const allDone = Object.values(resp).every((v) => v.trim().length > 10);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: 260, background: T.bgCard, borderRight: `1px solid ${T.border}`, position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 18px", borderBottom: `1px solid ${T.border}`, background: tc ? T.redBg : tw ? T.amberBg : "transparent" }}>
          <div style={{ fontSize: 10, color: T.textDim, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Tempo Restante</div>
          <div style={{ fontSize: 28, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: tc ? T.red : tw ? T.amber : T.text, animation: tc ? "blink 1s ease infinite" : "none" }}>{formatTime(timeLeft)}</div>
        </div>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.cyan }}>{area.icon} {area.nome}</div>
          <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>OAB 2ª Fase · Nota mínima: 6.0</div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
          {tabs.map((t) => {
            const a = tab === t.id, done = resp[t.id]?.trim().length > 10;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, border: "none", fontFamily: "inherit", background: a ? T.accentGlow : "transparent", color: a ? T.text : T.textMuted, fontSize: 13, fontWeight: a ? 600 : 400, cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: done ? T.greenBg : a ? T.accentGlow : T.bgSurface, border: `1px solid ${done ? T.greenBorder : a ? T.accent + "33" : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: done ? T.green : a ? T.accent : T.textDim }}>
                  {done ? "✓" : t.l}
                </div>
                <div>
                  <div>{t.f}</div>
                  {wc[t.id] > 0 && <div style={{ fontSize: 10, color: T.textDim }}>{wc[t.id]} palavras</div>}
                </div>
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "14px 18px", borderTop: `1px solid ${T.border}` }}>
          <button onClick={() => setShowConfirm(true)} style={{ width: "100%", padding: "12px", borderRadius: 10, border: allDone ? "none" : `1px solid ${T.border}`, background: allDone ? `linear-gradient(135deg, ${T.accent}, ${T.accentLight})` : "transparent", color: allDone ? "#fff" : T.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: allDone ? `0 4px 20px ${T.accentGlowStrong}` : "none" }}>
            Finalizar Prova
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 260, flex: 1, padding: "28px 36px 60px", maxWidth: 860 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: isPeca ? T.cyanBg : T.accentGlow, border: `1px solid ${isPeca ? T.cyanBorder : T.accent + "33"}`, color: isPeca ? T.cyan : T.accentLight }}>
            {isPeca ? "Peça Prático-Profissional" : `Questão ${qIdx + 1} de 4`}
          </span>
          <span style={{ fontSize: 12, color: T.textDim }}>{isPeca ? "Vale 5.0 pontos" : `Vale ${cq?.pontuacao} ponto${cq?.pontuacao > 1 ? "s" : ""}`}</span>
        </div>

        {isPeca ? (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ background: T.bgCard, border: `1px solid ${T.cyanBorder}`, borderRadius: 16, padding: "28px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${T.cyan}10, transparent)`, pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: T.cyanBg, border: `1px solid ${T.cyanBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: T.cyan }}>📋</div>
                <div><div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Caso Prático</div><div style={{ fontSize: 11, color: T.textMuted }}>Leia atentamente e elabore a peça processual adequada</div></div>
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.85, color: T.text, whiteSpace: "pre-wrap" }}>{examData.peca_profissional.caso}</p>
            </div>
            <div style={{ background: T.amberBg, border: `1px solid ${T.amberBorder}`, borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", gap: 10 }}>
              <span style={{ fontSize: 16 }}>💡</span>
              <div style={{ fontSize: 12, lineHeight: 1.6, color: T.textMuted }}>
                <strong style={{ color: T.amber }}>Dica:</strong> Identifique a peça adequada. Inclua: endereçamento, qualificação, fatos, fundamentação, pedidos e fechamento.
              </div>
            </div>
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>Critérios de Correção:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {examData.peca_profissional.criterios.map((c, i) => (
                  <span key={i} style={{ padding: "4px 10px", borderRadius: 6, background: T.bgSurface, border: `1px solid ${T.border}`, fontSize: 11, color: T.textMuted }}>{c.criterio} ({c.peso}pt)</span>
                ))}
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <textarea value={resp.peca} onChange={(e) => update("peca", e.target.value)}
                placeholder="Elabore sua peça processual aqui. Inclua endereçamento, qualificação das partes, fatos, fundamentação jurídica, pedidos e fechamento..."
                style={{ width: "100%", minHeight: 500, padding: "24px", borderRadius: 14, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, lineHeight: 1.8, resize: "vertical" }} />
              <div style={{ position: "absolute", bottom: 12, right: 16, fontSize: 11, color: T.textDim }}>{wc.peca} palavras</div>
            </div>
          </div>
        ) : (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.accent, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>{cq?.tema}</div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.8, color: T.text }}>{cq?.enunciado}</p>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {cq?.criterios?.map((c, i) => (
                <span key={i} style={{ padding: "5px 12px", borderRadius: 7, background: T.bgSurface, border: `1px solid ${T.border}`, fontSize: 11, color: T.textMuted }}>{c}</span>
              ))}
            </div>
            <div style={{ position: "relative" }}>
              <textarea value={resp[tab]} onChange={(e) => update(tab, e.target.value)}
                placeholder="Digite sua resposta aqui. Fundamente com legislação e jurisprudência..."
                style={{ width: "100%", minHeight: 300, padding: "24px", borderRadius: 14, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 14, lineHeight: 1.8, resize: "vertical" }} />
              <div style={{ position: "absolute", bottom: 12, right: 16, fontSize: 11, color: T.textDim }}>{wc[tab]} palavras</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              <button onClick={() => { const i = tabs.findIndex(t => t.id === tab); if (i > 0) setTab(tabs[i - 1].id); }} disabled={tab === "q1"}
                style={{ padding: "12px 24px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: tab === "q1" ? T.textDim : T.textMuted, fontSize: 13, cursor: tab === "q1" ? "not-allowed" : "pointer", fontFamily: "inherit" }}>← Anterior</button>
              <button onClick={() => { const i = tabs.findIndex(t => t.id === tab); if (i < tabs.length - 1) setTab(tabs[i + 1].id); }}
                style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 20px ${T.accentGlowStrong}` }}>
                {tab === "q4" ? "Ir para a Peça →" : "Próxima →"}
              </button>
            </div>
          </div>
        )}
      </div>

      {showConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(8px)" }}>
          <div style={{ background: T.bgCard, border: `1px solid ${T.borderLight}`, borderRadius: 20, padding: "32px", maxWidth: 440, width: "90%", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📝</div>
            <h3 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700 }}>Finalizar prova?</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20, textAlign: "left" }}>
              {tabs.map((t) => {
                const done = resp[t.id]?.trim().length > 10;
                return (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: done ? T.green : T.red }}>
                    <span>{done ? "✓" : "✕"}</span><span style={{ color: T.textMuted }}>{t.f}</span>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: T.textDim }}>{wc[t.id]} palavras</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Continuar</button>
              <button onClick={() => { clearInterval(timerRef.current); onFinish(resp); }}
                style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Finalizar e Corrigir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 2ª FASE: RESULTS ────────────────────────────────────
function Fase2Results({ area, examData, respostas, grades, pecaGrade, onRestart }) {
  const dn = grades.map((g) => g?.nota || 0);
  const dt = dn.reduce((a, b) => a + b, 0);
  const pn = pecaGrade?.nota || 0;
  const total = dt + pn;
  const pct = Math.round((total / 10) * 100);
  const passed = total >= 6;
  const [expQ, setExpQ] = useState(null);
  const [expP, setExpP] = useState(false);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", animation: "fadeUp 0.5s ease" }}>
      {/* Hero */}
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: "40px 36px", textAlign: "center", marginBottom: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${passed ? T.green : T.red}10, transparent)`, pointerEvents: "none" }} />
        <div style={{ fontSize: 48, marginBottom: 16 }}>{passed ? "🎉" : "📚"}</div>
        <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: passed ? T.green : T.red }}>{passed ? "Aprovado na 2ª Fase!" : "Nota abaixo do mínimo"}</h2>
        <p style={{ margin: "0 0 28px", fontSize: 14, color: T.textMuted }}>{area.icon} {area.nome} · Nota mínima: 6.0</p>
        <ProgressRing value={pct} size={120} stroke={8} color={passed ? T.green : T.red}>
          <span style={{ fontSize: 28, fontWeight: 800, color: T.text }}>{total.toFixed(1)}</span>
          <span style={{ fontSize: 10, color: T.textDim }}>/ 10.0</span>
        </ProgressRing>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 24 }}>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 800, color: T.accent }}>{dt.toFixed(2)}</div><div style={{ fontSize: 10, color: T.textDim }}>DISCURSIVAS (5.0)</div></div>
          <div style={{ width: 1, height: 36, background: T.border }} />
          <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 800, color: T.cyan }}>{pn.toFixed(2)}</div><div style={{ fontSize: 10, color: T.textDim }}>PEÇA (5.0)</div></div>
        </div>
      </div>

      {/* Discursivas */}
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "24px", marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Questões Discursivas</h3>
        {examData.questoes_discursivas.map((q, i) => {
          const g = grades[i], ex = expQ === i;
          return (
            <div key={i} style={{ background: T.bgSurface, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: 8, overflow: "hidden" }}>
              <button onClick={() => setExpQ(ex ? null : i)} style={{ width: "100%", padding: "16px 18px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", textAlign: "left", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: (g?.nota || 0) >= q.pontuacao * 0.6 ? T.greenBg : T.redBg, border: `1px solid ${(g?.nota || 0) >= q.pontuacao * 0.6 ? T.greenBorder : T.redBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: (g?.nota || 0) >= q.pontuacao * 0.6 ? T.green : T.red, flexShrink: 0 }}>Q{i + 1}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{q.tema}</div></div>
                <div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ fontSize: 18, fontWeight: 700, color: (g?.nota || 0) >= q.pontuacao * 0.6 ? T.green : T.red }}>{g?.nota?.toFixed(2) || "0.00"}</div><div style={{ fontSize: 10, color: T.textDim }}>/ {q.pontuacao}</div></div>
                <span style={{ color: T.textDim, fontSize: 12, transform: ex ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
              </button>
              {ex && g && (
                <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${T.border}`, animation: "fadeUp 0.3s ease" }}>
                  <div style={{ margin: "14px 0", padding: "12px 14px", borderRadius: 10, background: T.bg, border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: T.textDim, textTransform: "uppercase", marginBottom: 6 }}>Sua resposta</div>
                    <p style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: T.textMuted, whiteSpace: "pre-wrap" }}>{respostas[`q${i + 1}`]}</p>
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: T.textMuted, margin: "0 0 12px", whiteSpace: "pre-wrap" }}>{g.feedback_geral}</p>
                  {g.pontos_fortes?.length > 0 && <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, fontWeight: 700, color: T.green, marginBottom: 6 }}>✓ Pontos Fortes</div>{g.pontos_fortes.map((p, j) => <div key={j} style={{ fontSize: 12, color: T.textMuted }}>• {p}</div>)}</div>}
                  {g.pontos_fracos?.length > 0 && <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, fontWeight: 700, color: T.red, marginBottom: 6 }}>✕ Pontos Fracos</div>{g.pontos_fracos.map((p, j) => <div key={j} style={{ fontSize: 12, color: T.textMuted }}>• {p}</div>)}</div>}
                  {g.resposta_modelo && <div style={{ padding: "12px 14px", borderRadius: 10, background: T.accentGlow, border: `1px solid ${T.accent}22` }}><div style={{ fontSize: 10, fontWeight: 700, color: T.accent, marginBottom: 4, textTransform: "uppercase" }}>Resposta Modelo</div><p style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: T.textMuted }}>{g.resposta_modelo}</p></div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Peça */}
      <div style={{ background: T.bgCard, border: `1px solid ${T.cyanBorder}`, borderRadius: 16, padding: "24px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${T.cyan}10, transparent)`, pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>📋 Peça Prático-Profissional</h3>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 22, fontWeight: 800, color: pn >= 3 ? T.green : T.red }}>{pn.toFixed(2)}</div><div style={{ fontSize: 10, color: T.textDim }}>/ 5.0</div></div>
        </div>
        {pecaGrade && (
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <span style={{ padding: "5px 12px", borderRadius: 7, background: pecaGrade.peca_correta ? T.greenBg : T.redBg, border: `1px solid ${pecaGrade.peca_correta ? T.greenBorder : T.redBorder}`, fontSize: 11, fontWeight: 600, color: pecaGrade.peca_correta ? T.green : T.red }}>{pecaGrade.peca_correta ? "✓ Peça correta" : "✕ Peça incorreta"}</span>
            <span style={{ padding: "5px 12px", borderRadius: 7, background: T.bgSurface, border: `1px solid ${T.border}`, fontSize: 11, color: T.textMuted }}>Identificada: {pecaGrade.tipo_peca_identificada}</span>
            <span style={{ padding: "5px 12px", borderRadius: 7, background: T.cyanBg, border: `1px solid ${T.cyanBorder}`, fontSize: 11, color: T.cyan }}>Esperada: {examData.peca_profissional.tipo_peca_esperada}</span>
          </div>
        )}
        <button onClick={() => setExpP(!expP)} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginBottom: expP ? 16 : 0 }}>{expP ? "Fechar ▲" : "Ver correção detalhada ▼"}</button>
        {expP && pecaGrade && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: T.textMuted, margin: "0 0 16px", whiteSpace: "pre-wrap" }}>{pecaGrade.feedback_geral}</p>
            {pecaGrade.estrutura && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>Análise da Estrutura:</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {Object.entries(pecaGrade.estrutura).map(([k, v]) => (
                    <div key={k} style={{ padding: "10px 14px", borderRadius: 8, background: T.bg, border: `1px solid ${T.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: v.presente ? (v.correto || v.adequado || v.adequada || v.adequados ? T.green : T.amber) : T.red }}>{v.presente ? (v.correto || v.adequado || v.adequada || v.adequados ? "✓" : "⚠") : "✕"}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.text, textTransform: "capitalize" }}>{k.replace(/_/g, " ")}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 11, color: T.textDim, lineHeight: 1.5 }}>{v.comentario}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {pecaGrade.criterios_avaliados?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>Pontuação por Critério:</div>
                {pecaGrade.criterios_avaliados.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < pecaGrade.criterios_avaliados.length - 1 ? `1px solid ${T.border}` : "none" }}>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{c.criterio}</div><div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>{c.comentario}</div></div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c.nota >= c.nota_maxima * 0.6 ? T.green : T.red, flexShrink: 0 }}>{c.nota?.toFixed(1)} / {c.nota_maxima?.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            )}
            {pecaGrade.nota_pratica && <div style={{ padding: "14px 16px", borderRadius: 10, background: T.amberBg, border: `1px solid ${T.amberBorder}`, marginBottom: 14 }}><div style={{ fontSize: 11, fontWeight: 700, color: T.amber, marginBottom: 4, textTransform: "uppercase" }}>🏛 Avaliação Prática</div><p style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: T.textMuted }}>{pecaGrade.nota_pratica}</p></div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {pecaGrade.pontos_fortes?.length > 0 && <div style={{ padding: "12px 14px", borderRadius: 10, background: T.greenBg, border: `1px solid ${T.greenBorder}` }}><div style={{ fontSize: 11, fontWeight: 700, color: T.green, marginBottom: 6 }}>✓ Pontos Fortes</div>{pecaGrade.pontos_fortes.map((p, j) => <div key={j} style={{ fontSize: 12, color: T.textMuted }}>• {p}</div>)}</div>}
              {pecaGrade.pontos_fracos?.length > 0 && <div style={{ padding: "12px 14px", borderRadius: 10, background: T.redBg, border: `1px solid ${T.redBorder}` }}><div style={{ fontSize: 11, fontWeight: 700, color: T.red, marginBottom: 6 }}>✕ Pontos Fracos</div>{pecaGrade.pontos_fracos.map((p, j) => <div key={j} style={{ fontSize: 12, color: T.textMuted }}>• {p}</div>)}</div>}
            </div>
          </div>
        )}
      </div>

      <button onClick={onRestart} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 24px ${T.accentGlowStrong}` }}>Novo Simulado</button>
    </div>
  );
}

// ─── 1ª FASE COMPONENTS ──────────────────────────────────
function ExamInProgress({ preset, questions, onFinish }) {
  const [cur, setCur] = useState(0);
  const [ans, setAns] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(preset.duration * 60);
  const [showEnd, setShowEnd] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => { setTimeLeft((t) => { if (t <= 1) { clearInterval(timerRef.current); onFinish(ans, 0); return 0; } return t - 1; }); }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const q = questions[cur], answered = Object.keys(ans).length, totalQ = questions.length;
  const tw = timeLeft < 600, tc = timeLeft < 180;
  const mg = []; let mi = 0;
  for (const m of preset.materias) { mg.push({ nome: m.nome, start: mi, count: m.qtd }); mi += m.qtd; }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ width: 260, background: T.bgCard, borderRight: `1px solid ${T.border}`, position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ padding: "20px 18px", borderBottom: `1px solid ${T.border}`, background: tc ? T.redBg : tw ? T.amberBg : "transparent" }}>
          <div style={{ fontSize: 10, color: T.textDim, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Tempo</div>
          <div style={{ fontSize: 28, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: tc ? T.red : tw ? T.amber : T.text, animation: tc ? "blink 1s ease infinite" : "none" }}>{formatTime(timeLeft)}</div>
        </div>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textMuted, marginBottom: 6 }}><span>{answered}/{totalQ}</span><span>{Math.round((answered / totalQ) * 100)}%</span></div>
          <div style={{ height: 4, background: T.border, borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", width: `${(answered / totalQ) * 100}%`, background: `linear-gradient(90deg, ${T.accent}, ${T.accentLight})`, borderRadius: 4 }} /></div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
          {mg.map((g) => (
            <div key={g.nome} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: T.textDim, fontWeight: 600, textTransform: "uppercase", marginBottom: 6, padding: "0 4px" }}>{g.nome}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {Array.from({ length: g.count }, (_, i) => {
                  const qi = g.start + i, a = cur === qi, d = ans[qi] !== undefined;
                  return <button key={qi} onClick={() => setCur(qi)} style={{ width: 32, height: 32, borderRadius: 7, border: `1px solid ${a ? T.accent + "66" : d ? T.accent + "33" : T.border}`, background: a ? T.accentGlow : d ? T.accent + "20" : "transparent", color: a ? T.text : d ? T.accentLight : T.textMuted, fontSize: 11, fontWeight: a ? 700 : 500, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    {qi + 1}{flagged.has(qi) && <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: T.amber, border: `2px solid ${T.bgCard}` }} />}
                  </button>;
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "14px 18px", borderTop: `1px solid ${T.border}` }}>
          <button onClick={() => setShowEnd(true)} style={{ width: "100%", padding: "12px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Finalizar</button>
        </div>
      </div>

      <div style={{ marginLeft: 260, flex: 1, padding: "28px 36px 60px", maxWidth: 820 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.accent }}>Questão {cur + 1} <span style={{ color: T.textDim, fontWeight: 400 }}>de {totalQ}</span></span>
          <button onClick={() => { const n = new Set(flagged); if (n.has(cur)) n.delete(cur); else n.add(cur); setFlagged(n); }}
            style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${flagged.has(cur) ? T.amberBorder : T.border}`, background: flagged.has(cur) ? T.amberBg : "transparent", color: flagged.has(cur) ? T.amber : T.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{flagged.has(cur) ? "🚩" : "🏳"}</button>
        </div>
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px", marginBottom: 14 }}><p style={{ margin: 0, fontSize: 15, lineHeight: 1.8, color: T.text }}>{q?.enunciado}</p></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {q?.alternativas?.map((alt) => {
            const sel = ans[cur] === alt.letra;
            return <button key={alt.letra} onClick={() => setAns((p) => ({ ...p, [cur]: alt.letra }))}
              style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px", borderRadius: 12, border: `1px solid ${sel ? T.accent + "66" : T.border}`, background: sel ? T.bgHover : T.bgCard, cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "all 0.2s" }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, border: `2px solid ${sel ? T.accent : T.borderLight}`, background: sel ? T.accentGlow : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: sel ? T.accent : T.textMuted, flexShrink: 0 }}>{alt.letra}</div>
              <span style={{ fontSize: 14, lineHeight: 1.65, color: T.text, paddingTop: 4 }}>{alt.texto}</span>
            </button>;
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button onClick={() => setCur(Math.max(0, cur - 1))} disabled={cur === 0} style={{ padding: "12px 24px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: cur === 0 ? T.textDim : T.textMuted, fontSize: 13, cursor: cur === 0 ? "not-allowed" : "pointer", fontFamily: "inherit" }}>← Anterior</button>
          <button onClick={() => setCur(Math.min(totalQ - 1, cur + 1))} disabled={cur === totalQ - 1} style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: cur === totalQ - 1 ? T.borderLight : `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`, color: cur === totalQ - 1 ? T.textDim : "#fff", fontSize: 13, fontWeight: 600, cursor: cur === totalQ - 1 ? "not-allowed" : "pointer", fontFamily: "inherit" }}>Próxima →</button>
        </div>
      </div>

      {showEnd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(8px)" }}>
          <div style={{ background: T.bgCard, border: `1px solid ${T.borderLight}`, borderRadius: 20, padding: "32px", maxWidth: 420, width: "90%", textAlign: "center" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>Finalizar?</h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: T.textMuted }}>{answered}/{totalQ} respondidas</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowEnd(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Continuar</button>
              <button onClick={() => { clearInterval(timerRef.current); onFinish(ans, preset.duration * 60 - timeLeft); }} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: T.red, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Finalizar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExamResults({ preset, questions, answers, timeTaken, onRestart }) {
  const totalQ = questions.length, correct = questions.filter((q, i) => answers[i] === q.gabarito).length;
  const pct = Math.round((correct / totalQ) * 100), passed = pct >= preset.aprovacao;
  const ms = []; let qi = 0;
  for (const m of preset.materias) { let mc = 0; for (let i = 0; i < m.qtd; i++) if (answers[qi + i] === questions[qi + i]?.gabarito) mc++; ms.push({ nome: m.nome, total: m.qtd, correct: mc, pct: Math.round((mc / m.qtd) * 100) }); qi += m.qtd; }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", animation: "fadeUp 0.5s ease" }}>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: "40px 36px", textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{passed ? "🎉" : "📚"}</div>
        <h2 style={{ margin: "0 0 28px", fontSize: 24, fontWeight: 800, color: passed ? T.green : T.red }}>{passed ? "Aprovado!" : "Não aprovado"}</h2>
        <ProgressRing value={pct} size={110} stroke={7} color={passed ? T.green : T.red}><span style={{ fontSize: 28, fontWeight: 800, color: T.text }}>{pct}%</span></ProgressRing>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 24 }}>
          <div><div style={{ fontSize: 22, fontWeight: 800, color: T.green }}>{correct}</div><div style={{ fontSize: 10, color: T.textDim }}>CORRETAS</div></div>
          <div><div style={{ fontSize: 22, fontWeight: 800, color: T.red }}>{totalQ - correct}</div><div style={{ fontSize: 10, color: T.textDim }}>ERRADAS</div></div>
          <div><div style={{ fontSize: 22, fontWeight: 800, color: T.blue }}>{formatTime(timeTaken)}</div><div style={{ fontSize: 10, color: T.textDim }}>TEMPO</div></div>
        </div>
      </div>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "24px", marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Por Matéria</h3>
        {ms.sort((a, b) => b.pct - a.pct).map((m) => (
          <div key={m.nome} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", borderRadius: 10, background: T.bgSurface, border: `1px solid ${T.border}`, marginBottom: 6 }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 6 }}>{m.nome}</div><div style={{ height: 4, background: T.border, borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 4, width: `${m.pct}%`, background: m.pct >= 70 ? T.green : m.pct >= 50 ? T.amber : T.red }} /></div></div>
            <div style={{ fontSize: 16, fontWeight: 700, color: m.pct >= 70 ? T.green : m.pct >= 50 ? T.amber : T.red }}>{m.pct}%</div>
          </div>
        ))}
      </div>
      <button onClick={onRestart} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Novo Simulado</button>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────
export default function SimuladoApp() {
  const [phase, setPhase] = useState("select");
  const [preset, setPreset] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeTaken, setTimeTaken] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadTotal, setLoadTotal] = useState(0);
  const [loadMateria, setLoadMateria] = useState("");
  const [selectedArea, setSelectedArea] = useState(null);
  const [examData2, setExamData2] = useState(null);
  const [respostas2, setRespostas2] = useState(null);
  const [grades2, setGrades2] = useState([]);
  const [pecaGrade2, setPecaGrade2] = useState(null);
  const [gradingProgress, setGradingProgress] = useState("");

  const startExam = useCallback(async (p) => {
    setPreset(p); setPhase("loading"); setQuestions([]); setAnswers({});
    const total = p.materias.reduce((a, m) => a + m.qtd, 0);
    setLoadTotal(total); setLoadProgress(0);
    const all = [];
    for (const m of p.materias) {
      setLoadMateria(m.nome);
      try { const b = await generateBatchQuestions(m.nome, m.qtd, p.banca); for (const q of (Array.isArray(b) ? b : [])) { q._materia = m.nome; all.push(q); } }
      catch { for (let i = 0; i < m.qtd; i++) all.push({ enunciado: "[Erro]", alternativas: [{ letra: "A", texto: "A" }, { letra: "B", texto: "B" }, { letra: "C", texto: "C" }, { letra: "D", texto: "D" }], gabarito: "A", _materia: m.nome }); }
      setLoadProgress(all.length);
    }
    setQuestions(all); setPhase("exam");
  }, []);

  const selectArea = useCallback(async (area) => {
    setSelectedArea(area); setPhase("loading2"); setLoadMateria("Gerando prova da 2ª Fase...");
    try { const d = await generate2FaseExam(area); setExamData2(d); setPhase("exam2"); }
    catch { setLoadMateria("Erro ao gerar. Recarregue."); }
  }, []);

  const finish2Fase = useCallback(async (resp) => {
    setRespostas2(resp); setPhase("grading2"); setGrades2([]); setPecaGrade2(null);
    const gArr = [];
    for (let i = 0; i < examData2.questoes_discursivas.length; i++) {
      setGradingProgress(`Corrigindo questão ${i + 1} de 4...`);
      try { gArr.push(await gradeDiscursiva(examData2.questoes_discursivas[i], resp[`q${i + 1}`])); }
      catch { gArr.push({ nota: 0, feedback_geral: "Erro", pontos_fortes: [], pontos_fracos: [] }); }
    }
    setGrades2(gArr);
    setGradingProgress("Corrigindo peça prático-profissional...");
    try { setPecaGrade2(await gradePeca(examData2.peca_profissional, resp.peca)); }
    catch { setPecaGrade2({ nota: 0, feedback_geral: "Erro", peca_correta: false }); }
    setPhase("results2");
  }, [examData2]);

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif", background: T.bg, minHeight: "100vh", color: T.text }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap" rel="stylesheet" />
      <style>{CSS}</style>
      <div style={{ padding: (phase === "exam" || phase === "exam2") ? "0" : "32px 28px 60px" }}>
        {phase === "select" && <ExamSelect onStart={startExam} onStart2Fase={() => setPhase("areaSelect")} />}
        {phase === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: 24 }}>
            <ProgressRing value={loadTotal > 0 ? Math.round((loadProgress / loadTotal) * 100) : 0} size={120} stroke={8}><span style={{ fontSize: 28, fontWeight: 800, color: T.text }}>{loadTotal > 0 ? Math.round((loadProgress / loadTotal) * 100) : 0}%</span></ProgressRing>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 700 }}>Gerando simulado...</div><div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>{loadMateria}</div><div style={{ fontSize: 12, color: T.textDim, marginTop: 4 }}>{loadProgress}/{loadTotal}</div></div>
          </div>
        )}
        {phase === "exam" && preset && questions.length > 0 && <ExamInProgress preset={preset} questions={questions} onFinish={(a, t) => {
          setAnswers(a); setTimeTaken(t); setPhase("results");
          // Salvar simulado no Supabase
          const sessao = getSessaoLocal();
          if (sessao?.id) {
            const acertos = questions.filter((q, i) => a[i] === q.gabarito).length;
            salvarSimulado(sessao.id, {
              tipo: preset.label || "1ª Fase",
              totalQuestoes: questions.length,
              acertos,
              nota: Number(((acertos / questions.length) * 10).toFixed(2)),
              tempoMinutos: Math.round(t / 60),
              respostas: questions.map((q, i) => ({ gabarito: q.gabarito, resposta: a[i], acertou: a[i] === q.gabarito })),
            }).catch(() => {});
          }
        }} />}
        {phase === "results" && <ExamResults preset={preset} questions={questions} answers={answers} timeTaken={timeTaken} onRestart={() => setPhase("select")} />}
        {phase === "areaSelect" && <AreaSelect onSelect={selectArea} onBack={() => setPhase("select")} />}
        {phase === "loading2" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", border: `3px solid ${T.border}`, borderTopColor: T.cyan, animation: "spin 1s linear infinite" }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{loadMateria}</div>
            <div style={{ fontSize: 12, color: T.textDim }}>A IA está elaborando sua prova</div>
          </div>
        )}
        {phase === "exam2" && examData2 && <Fase2Exam area={selectedArea} examData={examData2} onFinish={finish2Fase} />}
        {phase === "grading2" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", border: `3px solid ${T.border}`, borderTopColor: T.cyan, animation: "spin 1s linear infinite" }} />
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>Corrigindo sua prova...</div><div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>{gradingProgress}</div><div style={{ fontSize: 12, color: T.textDim, marginTop: 8 }}>A IA analisa com rigor de banca FGV</div></div>
          </div>
        )}
        {phase === "results2" && examData2 && <Fase2Results area={selectedArea} examData={examData2} respostas={respostas2} grades={grades2} pecaGrade={pecaGrade2} onRestart={() => setPhase("select")} />}
      </div>
    </div>
  );
}
