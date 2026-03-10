import { useState, useEffect, useCallback, useRef } from "react";

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
  accent: "#7C5CFC",
  accentLight: "#9B7FFD",
  accentGlow: "rgba(124, 92, 252, 0.15)",
  accentGlowStrong: "rgba(124, 92, 252, 0.25)",
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
  pink: "#F472B6",
  pinkBg: "rgba(244, 114, 182, 0.08)",
  orange: "#FB923C",
};

const CSS = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(124,92,252,0.25); } 50% { box-shadow: 0 0 0 12px rgba(124,92,252,0); } }
@keyframes progressFill { from { width:0; } }
* { box-sizing: border-box; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: ${T.borderLight}; border-radius: 3px; }
input, select, textarea { font-family: 'DM Sans', sans-serif; }
input:focus, select:focus, textarea:focus { outline: none; }
`;

// ─── QUESTIONNAIRE DATA ──────────────────────────────────
const MATERIAS_1FASE = [
  { id: "etica", nome: "Ética Profissional", peso: 8 },
  { id: "constitucional", nome: "Direito Constitucional", peso: 8 },
  { id: "civil", nome: "Direito Civil", peso: 8 },
  { id: "penal", nome: "Direito Penal", peso: 8 },
  { id: "trabalho", nome: "Direito do Trabalho", peso: 7 },
  { id: "proc_civil", nome: "Processo Civil", peso: 8 },
  { id: "proc_penal", nome: "Processo Penal", peso: 7 },
  { id: "administrativo", nome: "Direito Administrativo", peso: 7 },
  { id: "tributario", nome: "Direito Tributário", peso: 6 },
  { id: "empresarial", nome: "Direito Empresarial", peso: 5 },
  { id: "humanos", nome: "Direitos Humanos", peso: 4 },
  { id: "ambiental", nome: "Direito Ambiental", peso: 4 },
];

const AREAS_2FASE = [
  "Direito Civil", "Direito Penal", "Direito do Trabalho",
  "Direito Constitucional", "Direito Administrativo",
  "Direito Tributário", "Direito Empresarial",
];

const ESTILOS_APRENDIZAGEM = [
  { id: "visual", label: "Visual / Fluxogramas", icon: "🧠", desc: "Mapas mentais, diagramas, esquemas visuais", color: T.accent },
  { id: "auditivo", label: "Ouvindo", icon: "🎧", desc: "Aulas, podcasts, explicações em áudio", color: T.blue },
  { id: "leitura", label: "Lendo", icon: "📖", desc: "Leitura de doutrinas, leis secas, resumos", color: T.green },
  { id: "repetição", label: "Repetindo / Questões", icon: "🔁", desc: "Exercícios, simulados, flashcards", color: T.amber },
  { id: "escrita", label: "Escrevendo", icon: "✍️", desc: "Fichamentos, anotações, peças práticas", color: T.pink },
];

const PERIODOS_ESTUDO = [
  { id: "manha", label: "Manhã (6h-12h)", icon: "☀️" },
  { id: "tarde", label: "Tarde (12h-18h)", icon: "🌤" },
  { id: "noite", label: "Noite (18h-23h)", icon: "🌙" },
  { id: "madrugada", label: "Madrugada (23h-6h)", icon: "🌃" },
];

// ─── CLAUDE API ──────────────────────────────────────────
async function askClaude(sys, user, maxTokens = 2000) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, system: sys, messages: [{ role: "user", content: user }] }),
  });
  const data = await res.json();
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
}

async function generateStudyPlan(profile) {
  const sys = `Você é um coach de estudos jurídicos especialista em preparação para OAB e concursos. 
Crie um cronograma de estudos PERSONALIZADO e DETALHADO baseado no perfil do aluno.
Responda APENAS com JSON válido (sem markdown, sem backticks).

Estrutura do JSON:
{
  "resumo_perfil": "análise breve do perfil e estratégia recomendada (2-3 frases)",
  "dias_ate_prova": número,
  "horas_semana_estudo": número,
  "meta_questoes_dia": número,
  "estrategia_geral": "estratégia geral de estudo (1 parágrafo)",
  "distribuicao_materias": [
    {"materia": "nome", "horas_semana": número, "prioridade": "alta|media|baixa", "motivo": "por que essa prioridade"}
  ],
  "semana_tipo": {
    "segunda": [
      {"horario": "06:00-07:30", "atividade": "descrição", "materia": "nome", "tipo": "leitura|questoes|revisao|video|flashcard|peca|simulado|descanso", "dica": "dica específica"}
    ],
    "terca": [...],
    "quarta": [...],
    "quinta": [...],
    "sexta": [...],
    "sabado": [...],
    "domingo": [...]
  },
  "ciclo_revisao": {
    "descricao": "como funciona o ciclo de revisão",
    "frequencia": "a cada X dias"
  },
  "marcos_importantes": [
    {"semana": 1, "meta": "o que alcançar nessa semana"},
    {"semana": 4, "meta": "..."},
    {"semana": 8, "meta": "..."}
  ],
  "dicas_personalizadas": [
    "dica baseada no estilo de aprendizagem do aluno",
    "dica baseada na rotina de trabalho",
    "dica para maximizar o tempo disponível"
  ],
  "alerta": "alerta importante baseado no perfil (ex: pouco tempo, matéria fraca, etc.)"
}

REGRAS:
- Respeite os horários disponíveis do aluno
- Priorize matérias fracas sem negligenciar as fortes
- Inclua pausas e descanso
- Adapte ao estilo de aprendizagem preferido
- Se for 2ª fase, foque na área escolhida + ética + peça prática
- Distribua revisões espaçadas ao longo da semana
- Inclua simulados aos sábados ou domingos`;

  const user = `Perfil do aluno:
- Nome: ${profile.nome}
- Fase: ${profile.fase}ª Fase da OAB${profile.fase === 2 ? ` (Área: ${profile.area2fase})` : ""}
- Data da prova: ${profile.dataProva}
- Rotina de trabalho: ${profile.rotina}
- Horas disponíveis por dia para estudo: ${profile.horasEstudoDia}h
- Dias disponíveis na semana: ${profile.diasSemana.join(", ")}
- Melhor período para estudar: ${profile.periodos.join(", ")}
- Estilos de aprendizagem preferidos: ${profile.estilosAprendizagem.join(", ")}
- Nível atual de conhecimento: ${profile.nivelAtual}
- Matérias fortes: ${profile.materiasFortes.join(", ") || "Nenhuma definida"}
- Matérias fracas: ${profile.materiasFracas.join(", ") || "Nenhuma definida"}
- Já fez algum simulado? ${profile.jaFezSimulado}
- Nota no último simulado: ${profile.notaSimulado || "N/A"}
- Observações extras: ${profile.observacoes || "Nenhuma"}

Gere o cronograma personalizado. SOMENTE JSON.`;

  const raw = await askClaude(sys, user, 3000);
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  catch { throw new Error("Erro ao gerar cronograma. Tente novamente."); }
}

// ─── COMPONENTS ──────────────────────────────────────────

function StepIndicator({ current, total }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center", marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div style={{
            width: i === current ? 32 : 10, height: 10, borderRadius: 5,
            background: i < current ? T.accent : i === current ? `linear-gradient(90deg, ${T.accent}, ${T.accentLight})` : T.border,
            transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
          }} />
          {i < total - 1 && <div style={{ width: 6 }} />}
        </div>
      ))}
    </div>
  );
}

function OptionCard({ selected, onClick, icon, label, desc, color, small }) {
  return (
    <button onClick={onClick}
      style={{
        background: selected ? `${color || T.accent}10` : T.bgCard,
        border: `1px solid ${selected ? (color || T.accent) + "44" : T.border}`,
        borderRadius: 14, padding: small ? "12px 16px" : "18px 18px",
        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        transition: "all 0.2s ease", width: "100%",
        transform: selected ? "scale(1.01)" : "none",
      }}
      onMouseEnter={(e) => { if (!selected) { e.currentTarget.style.borderColor = T.borderLight; e.currentTarget.style.background = T.bgHover; } }}
      onMouseLeave={(e) => { if (!selected) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.bgCard; } }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {icon && <span style={{ fontSize: small ? 20 : 24 }}>{icon}</span>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: small ? 12 : 14, fontWeight: 600, color: selected ? T.text : T.textMuted }}>{label}</div>
          {desc && <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>{desc}</div>}
        </div>
        {selected && <div style={{ width: 20, height: 20, borderRadius: "50%", background: color || T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 800 }}>✓</div>}
      </div>
    </button>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text", icon }) {
  return (
    <div>
      {label && <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>{icon}</span>}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          style={{
            width: "100%", padding: icon ? "12px 14px 12px 42px" : "12px 16px",
            borderRadius: 12, border: `1px solid ${T.border}`,
            background: T.bgCard, color: T.text, fontSize: 14,
            transition: "border-color 0.2s ease",
          }}
          onFocus={(e) => e.target.style.borderColor = T.accent + "55"}
          onBlur={(e) => e.target.style.borderColor = T.border}
        />
      </div>
    </div>
  );
}

function SliderInput({ label, value, onChange, min, max, step = 1, suffix = "", icon }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: T.text }}>{icon} {value}{suffix}</div>
      </div>
      <div style={{ position: "relative", height: 28, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: 6, background: T.border, borderRadius: 3 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${T.accent}, ${T.accentLight})`, borderRadius: 3, transition: "width 0.15s ease" }} />
        </div>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: "absolute", left: 0, right: 0, width: "100%",
            appearance: "none", background: "transparent", cursor: "pointer",
            height: 28, margin: 0,
          }}
        />
      </div>
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%;
          background: ${T.accent}; border: 3px solid ${T.bg}; cursor: pointer;
          box-shadow: 0 2px 8px rgba(124,92,252,0.3);
        }
      `}</style>
    </div>
  );
}

// ─── STEP 1: PERSONAL INFO ───────────────────────────────
function Step1({ data, onChange, onNext }) {
  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>👋</div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Vamos começar!</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: T.textMuted }}>Me conte um pouco sobre você</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 480, margin: "0 auto" }}>
        <InputField label="Seu nome" value={data.nome} onChange={(v) => onChange({ nome: v })} placeholder="Ex: Maria Fernanda" icon="👤" />

        <div>
          <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>Qual fase da OAB?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <OptionCard selected={data.fase === 1} onClick={() => onChange({ fase: 1 })} icon="📝" label="1ª Fase" desc="Prova objetiva · 80 questões" color={T.accent} />
            <OptionCard selected={data.fase === 2} onClick={() => onChange({ fase: 2 })} icon="📋" label="2ª Fase" desc="Prático-profissional · Peça + discursivas" color={T.cyan} />
          </div>
        </div>

        {data.fase === 2 && (
          <div>
            <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>Área da 2ª Fase</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {AREAS_2FASE.map((a) => (
                <OptionCard key={a} selected={data.area2fase === a} onClick={() => onChange({ area2fase: a })} label={a} small color={T.cyan} />
              ))}
            </div>
          </div>
        )}

        <InputField label="Data da prova" value={data.dataProva} onChange={(v) => onChange({ dataProva: v })} type="date" icon="📅" />

        <button onClick={onNext} disabled={!data.nome || !data.fase || !data.dataProva || (data.fase === 2 && !data.area2fase)}
          style={{
            padding: "14px", borderRadius: 12, border: "none",
            background: data.nome && data.fase && data.dataProva ? `linear-gradient(135deg, ${T.accent}, ${T.accentLight})` : T.borderLight,
            color: data.nome && data.fase && data.dataProva ? "#fff" : T.textDim,
            fontSize: 14, fontWeight: 700, cursor: data.nome ? "pointer" : "not-allowed",
            fontFamily: "inherit", boxShadow: data.nome ? `0 4px 20px ${T.accentGlowStrong}` : "none",
          }}>
          Continuar →
        </button>
      </div>
    </div>
  );
}

// ─── STEP 2: ROUTINE ─────────────────────────────────────
function Step2({ data, onChange, onNext, onBack }) {
  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>⏰</div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Sua rotina</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: T.textMuted }}>Vamos entender seu dia a dia</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 480, margin: "0 auto" }}>
        <div>
          <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>Rotina de trabalho</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { id: "integral", label: "Trabalho em tempo integral", icon: "🏢", desc: "8h+ por dia" },
              { id: "meio", label: "Meio período", icon: "⏱", desc: "4-6h por dia" },
              { id: "flexivel", label: "Horário flexível / Home office", icon: "🏠", desc: "Consigo encaixar estudo" },
              { id: "nao_trabalho", label: "Não trabalho atualmente", icon: "📚", desc: "Dedicação exclusiva aos estudos" },
              { id: "estagio", label: "Estágio", icon: "📎", desc: "4-6h + faculdade" },
            ].map((opt) => (
              <OptionCard key={opt.id} selected={data.rotina === opt.label} onClick={() => onChange({ rotina: opt.label })} icon={opt.icon} label={opt.label} desc={opt.desc} small />
            ))}
          </div>
        </div>

        <SliderInput label="Horas disponíveis por dia para estudo" value={data.horasEstudoDia} onChange={(v) => onChange({ horasEstudoDia: v })} min={1} max={12} suffix="h" icon="📖" />

        <div>
          <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>Dias disponíveis na semana</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((dia) => {
              const sel = data.diasSemana.includes(dia);
              return (
                <button key={dia} onClick={() => {
                  onChange({ diasSemana: sel ? data.diasSemana.filter((d) => d !== dia) : [...data.diasSemana, dia] });
                }} style={{
                  padding: "8px 14px", borderRadius: 8, border: `1px solid ${sel ? T.accent + "55" : T.border}`,
                  background: sel ? T.accentGlow : "transparent", color: sel ? T.accentLight : T.textMuted,
                  fontSize: 12, fontWeight: sel ? 600 : 400, cursor: "pointer", fontFamily: "inherit",
                }}>{dia.slice(0, 3)}</button>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>Melhor período para estudar (pode marcar vários)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {PERIODOS_ESTUDO.map((p) => {
              const sel = data.periodos.includes(p.label);
              return (
                <OptionCard key={p.id} selected={sel} onClick={() => {
                  onChange({ periodos: sel ? data.periodos.filter((x) => x !== p.label) : [...data.periodos, p.label] });
                }} icon={p.icon} label={p.label} small />
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onBack} style={{ padding: "14px 24px", borderRadius: 12, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← Voltar</button>
          <button onClick={onNext} disabled={!data.rotina || data.diasSemana.length === 0 || data.periodos.length === 0}
            style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: data.rotina ? `linear-gradient(135deg, ${T.accent}, ${T.accentLight})` : T.borderLight, color: data.rotina ? "#fff" : T.textDim, fontSize: 14, fontWeight: 700, cursor: data.rotina ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── STEP 3: LEARNING STYLE ──────────────────────────────
function Step3({ data, onChange, onNext, onBack }) {
  const toggle = (estilo) => {
    const sel = data.estilosAprendizagem.includes(estilo);
    onChange({ estilosAprendizagem: sel ? data.estilosAprendizagem.filter((e) => e !== estilo) : [...data.estilosAprendizagem, estilo] });
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🧠</div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Como você aprende melhor?</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: T.textMuted }}>Selecione todos que se aplicam</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ESTILOS_APRENDIZAGEM.map((e) => (
            <OptionCard key={e.id} selected={data.estilosAprendizagem.includes(e.label)} onClick={() => toggle(e.label)} icon={e.icon} label={e.label} desc={e.desc} color={e.color} />
          ))}
        </div>

        <div>
          <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>Seu nível atual de conhecimento</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { label: "Iniciante — Estou começando do zero", icon: "🌱" },
              { label: "Básico — Já estudei mas preciso reforçar", icon: "📗" },
              { label: "Intermediário — Conheço a maioria dos temas", icon: "📘" },
              { label: "Avançado — Só preciso revisar e praticar", icon: "📕" },
            ].map((n) => (
              <OptionCard key={n.label} selected={data.nivelAtual === n.label} onClick={() => onChange({ nivelAtual: n.label })} icon={n.icon} label={n.label} small />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onBack} style={{ padding: "14px 24px", borderRadius: 12, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← Voltar</button>
          <button onClick={onNext} disabled={data.estilosAprendizagem.length === 0 || !data.nivelAtual}
            style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: data.estilosAprendizagem.length > 0 && data.nivelAtual ? `linear-gradient(135deg, ${T.accent}, ${T.accentLight})` : T.borderLight, color: data.estilosAprendizagem.length > 0 ? "#fff" : T.textDim, fontSize: 14, fontWeight: 700, cursor: data.estilosAprendizagem.length > 0 ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── STEP 4: STRENGTHS & WEAKNESSES ──────────────────────
function Step4({ data, onChange, onNext, onBack }) {
  const materias = data.fase === 1 ? MATERIAS_1FASE.map((m) => m.nome) : [data.area2fase, "Ética Profissional", "Processo Civil", "Processo Penal", "Direito Constitucional"];

  const toggleForte = (m) => {
    const sel = data.materiasFortes.includes(m);
    let fortes = sel ? data.materiasFortes.filter((x) => x !== m) : [...data.materiasFortes, m];
    let fracas = data.materiasFracas.filter((x) => x !== m);
    onChange({ materiasFortes: fortes, materiasFracas: fracas });
  };

  const toggleFraca = (m) => {
    const sel = data.materiasFracas.includes(m);
    let fracas = sel ? data.materiasFracas.filter((x) => x !== m) : [...data.materiasFracas, m];
    let fortes = data.materiasFortes.filter((x) => x !== m);
    onChange({ materiasFracas: fracas, materiasFortes: fortes });
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>📊</div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Forças e fraquezas</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: T.textMuted }}>Marque suas matérias fortes e fracas</p>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, fontSize: 11, color: T.textDim }}>
          <div style={{ flex: 1 }}>Matéria</div>
          <div style={{ width: 70, textAlign: "center" }}>
            <span style={{ color: T.green }}>💪 Forte</span>
          </div>
          <div style={{ width: 70, textAlign: "center" }}>
            <span style={{ color: T.red }}>📉 Fraca</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {materias.map((m) => {
            const isForte = data.materiasFortes.includes(m);
            const isFraca = data.materiasFracas.includes(m);
            return (
              <div key={m} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: T.bgCard, border: `1px solid ${isForte ? T.greenBorder : isFraca ? T.redBorder : T.border}` }}>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: T.text }}>{m}</div>
                <button onClick={() => toggleForte(m)} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${isForte ? T.greenBorder : T.border}`, background: isForte ? T.greenBg : "transparent", color: isForte ? T.green : T.textDim, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
                  {isForte ? "✓" : ""}
                </button>
                <button onClick={() => toggleFraca(m)} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${isFraca ? T.redBorder : T.border}`, background: isFraca ? T.redBg : "transparent", color: isFraca ? T.red : T.textDim, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
                  {isFraca ? "✓" : ""}
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>Já fez simulado?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {["Nunca fiz", "Sim, fui mal", "Sim, fui razoável", "Sim, fui bem"].map((opt) => (
              <OptionCard key={opt} selected={data.jaFezSimulado === opt} onClick={() => onChange({ jaFezSimulado: opt })} label={opt} small />
            ))}
          </div>
        </div>

        {data.jaFezSimulado && data.jaFezSimulado !== "Nunca fiz" && (
          <div style={{ marginTop: 14 }}>
            <SliderInput label="Nota do último simulado" value={data.notaSimulado} onChange={(v) => onChange({ notaSimulado: v })} min={0} max={100} suffix="%" icon="📊" />
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, color: T.textDim, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>Observações extras (opcional)</div>
          <textarea value={data.observacoes} onChange={(e) => onChange({ observacoes: e.target.value })}
            placeholder="Ex: Tenho dificuldade com prazos, preciso focar em peça, estou muito ansioso..."
            style={{ width: "100%", minHeight: 80, padding: "14px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.bgCard, color: T.text, fontSize: 13, lineHeight: 1.6, resize: "vertical" }} />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onBack} style={{ padding: "14px 24px", borderRadius: 12, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← Voltar</button>
          <button onClick={onNext}
            style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 20px ${T.accentGlowStrong}`, animation: "pulse 2s ease infinite" }}>
            ✦ Gerar Meu Cronograma
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SCHEDULE VIEW ───────────────────────────────────────
function ScheduleView({ profile, plan, onRestart }) {
  const [selectedDay, setSelectedDay] = useState("segunda");
  const [expandedMat, setExpandedMat] = useState(null);

  const diasSemana = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];
  const diasLabel = { segunda: "Seg", terca: "Ter", quarta: "Qua", quinta: "Qui", sexta: "Sex", sabado: "Sáb", domingo: "Dom" };
  const diasFull = { segunda: "Segunda-feira", terca: "Terça-feira", quarta: "Quarta-feira", quinta: "Quinta-feira", sexta: "Sexta-feira", sabado: "Sábado", domingo: "Domingo" };

  const tipoColors = {
    leitura: { bg: T.blueBg, border: `${T.blue}22`, color: T.blue, icon: "📖" },
    questoes: { bg: T.amberBg, border: `${T.amber}22`, color: T.amber, icon: "🎯" },
    revisao: { bg: T.accentGlow, border: `${T.accent}22`, color: T.accent, icon: "↻" },
    video: { bg: T.cyanBg, border: `${T.cyan}22`, color: T.cyan, icon: "🎬" },
    flashcard: { bg: T.greenBg, border: `${T.green}22`, color: T.green, icon: "🃏" },
    peca: { bg: T.pinkBg, border: `${T.pink}22`, color: T.pink, icon: "✍️" },
    simulado: { bg: T.redBg, border: `${T.red}22`, color: T.red, icon: "📝" },
    descanso: { bg: `${T.textDim}08`, border: `${T.textDim}15`, color: T.textDim, icon: "☕" },
  };

  const daySchedule = plan.semana_tipo?.[selectedDay] || [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", animation: "fadeUp 0.5s ease" }}>
      {/* Hero */}
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: "32px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${T.accent}10, transparent)`, pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>📅 Cronograma de {profile.nome}</h2>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: T.textMuted }}>{profile.fase}ª Fase OAB{profile.fase === 2 ? ` · ${profile.area2fase}` : ""}</p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: T.textMuted, maxWidth: 500 }}>{plan.resumo_perfil}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
            <div style={{ padding: "8px 16px", borderRadius: 10, background: T.amberBg, border: `1px solid ${T.amberBorder}`, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.amber }}>{plan.dias_ate_prova}</div>
              <div style={{ fontSize: 10, color: T.textDim }}>dias até a prova</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ padding: "6px 12px", borderRadius: 8, background: T.bgSurface, border: `1px solid ${T.border}`, fontSize: 11, color: T.textMuted }}>{plan.horas_semana_estudo}h/sem</div>
              <div style={{ padding: "6px 12px", borderRadius: 8, background: T.bgSurface, border: `1px solid ${T.border}`, fontSize: 11, color: T.textMuted }}>{plan.meta_questoes_dia} questões/dia</div>
            </div>
          </div>
        </div>

        {/* Alert */}
        {plan.alerta && (
          <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: T.amberBg, border: `1px solid ${T.amberBorder}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: T.textMuted }}>{plan.alerta}</p>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18 }}>
        {/* Left: Weekly calendar */}
        <div>
          {/* Day tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
            {diasSemana.map((d) => {
              const active = selectedDay === d;
              const hasItems = (plan.semana_tipo?.[d] || []).length > 0;
              return (
                <button key={d} onClick={() => setSelectedDay(d)}
                  style={{
                    flex: 1, padding: "10px 4px", borderRadius: 10,
                    border: `1px solid ${active ? T.accent + "55" : T.border}`,
                    background: active ? T.accentGlow : "transparent",
                    color: active ? T.text : hasItems ? T.textMuted : T.textDim,
                    fontSize: 12, fontWeight: active ? 700 : 400,
                    cursor: "pointer", fontFamily: "inherit", textAlign: "center",
                  }}>
                  {diasLabel[d]}
                  {hasItems && <div style={{ width: 4, height: 4, borderRadius: "50%", background: active ? T.accent : T.borderLight, margin: "4px auto 0" }} />}
                </button>
              );
            })}
          </div>

          {/* Day schedule */}
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "22px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>{diasFull[selectedDay]}</h3>
            {daySchedule.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px", color: T.textDim }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>☕</div>
                <div style={{ fontSize: 13 }}>Dia de descanso</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {daySchedule.map((item, i) => {
                  const tc = tipoColors[item.tipo] || tipoColors.leitura;
                  return (
                    <div key={i} style={{
                      display: "flex", gap: 14, padding: "14px 16px", borderRadius: 12,
                      background: tc.bg, border: `1px solid ${tc.border}`,
                      animation: `slideIn 0.3s ease ${i * 0.05}s both`,
                    }}>
                      <div style={{ textAlign: "center", flexShrink: 0, minWidth: 52 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: tc.color, fontVariantNumeric: "tabular-nums" }}>{item.horario?.split("-")[0]}</div>
                        <div style={{ fontSize: 10, color: T.textDim }}>{item.horario?.split("-")[1]}</div>
                      </div>
                      <div style={{ width: 1, background: `${tc.color}25`, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 14 }}>{tc.icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{item.atividade}</span>
                        </div>
                        {item.materia && <div style={{ fontSize: 11, color: tc.color, fontWeight: 600, marginBottom: 2 }}>{item.materia}</div>}
                        {item.dica && <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.5 }}>💡 {item.dica}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Info panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Subject distribution */}
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>Distribuição por Matéria</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(plan.distribuicao_materias || []).map((m, i) => {
                const prioColors = { alta: T.red, media: T.amber, baixa: T.green };
                const expanded = expandedMat === i;
                return (
                  <div key={i}>
                    <button onClick={() => setExpandedMat(expanded ? null : i)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, background: T.bgSurface, border: `1px solid ${T.border}`, cursor: "pointer", fontFamily: "inherit", textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: prioColors[m.prioridade] || T.textDim, flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: T.text }}>{m.materia}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.accent }}>{m.horas_semana}h</div>
                    </button>
                    {expanded && m.motivo && (
                      <div style={{ padding: "8px 12px 8px 28px", fontSize: 11, color: T.textDim, lineHeight: 1.5 }}>{m.motivo}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strategy */}
          <div style={{ background: T.bgCard, border: `1px solid ${T.accent}22`, borderRadius: 16, padding: "20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -30, right: -30, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${T.accent}10, transparent)`, pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: T.accentGlow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: T.accent }}>✦</div>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Estratégia</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: T.textMuted }}>{plan.estrategia_geral}</p>
          </div>

          {/* Milestones */}
          {plan.marcos_importantes?.length > 0 && (
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>🎯 Marcos</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.marcos_importantes.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: T.accentGlow, border: `1px solid ${T.accent}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: T.accent, flexShrink: 0 }}>S{m.semana}</div>
                    <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5, paddingTop: 4 }}>{m.meta}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {plan.dicas_personalizadas?.length > 0 && (
            <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>💡 Dicas Personalizadas</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.dicas_personalizadas.map((d, i) => (
                  <div key={i} style={{ padding: "10px 14px", borderRadius: 10, background: T.bgSurface, border: `1px solid ${T.border}`, fontSize: 12, lineHeight: 1.6, color: T.textMuted }}>
                    {d}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review cycle */}
          {plan.ciclo_revisao && (
            <div style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 16, padding: "20px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.green, marginBottom: 6 }}>↻ Ciclo de Revisão</div>
              <p style={{ margin: "0 0 4px", fontSize: 12, color: T.textMuted, lineHeight: 1.6 }}>{plan.ciclo_revisao.descricao}</p>
              <div style={{ fontSize: 11, color: T.textDim }}>Frequência: {plan.ciclo_revisao.frequencia}</div>
            </div>
          )}

          <button onClick={onRestart} style={{ padding: "12px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
            ↻ Refazer questionário
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────
export default function CronogramaApp() {
  const [phase, setPhase] = useState("questionnaire"); // questionnaire | loading | schedule
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState(null);

  const [data, setData] = useState({
    nome: "",
    fase: null,
    area2fase: "",
    dataProva: "",
    rotina: "",
    horasEstudoDia: 4,
    diasSemana: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
    periodos: [],
    estilosAprendizagem: [],
    nivelAtual: "",
    materiasFortes: [],
    materiasFracas: [],
    jaFezSimulado: "",
    notaSimulado: 50,
    observacoes: "",
  });

  const updateData = (partial) => setData((p) => ({ ...p, ...partial }));

  const generatePlan = useCallback(async () => {
    setPhase("loading");
    try {
      const result = await generateStudyPlan(data);
      setPlan(result);
      setPhase("schedule");
    } catch {
      setPhase("questionnaire");
    }
  }, [data]);

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif", background: T.bg, minHeight: "100vh", color: T.text }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap" rel="stylesheet" />
      <style>{CSS}</style>

      <div style={{ padding: "32px 28px 60px" }}>
        {phase === "questionnaire" && (
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, margin: "0 auto 14px",
                background: `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, color: "#fff", boxShadow: `0 6px 30px ${T.accentGlowStrong}`,
              }}>📅</div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em" }}>Cronograma Personalizado</h1>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: T.textMuted }}>A IA vai montar um plano de estudos sob medida para você</p>
            </div>

            <StepIndicator current={step} total={4} />

            {step === 0 && <Step1 data={data} onChange={updateData} onNext={() => setStep(1)} />}
            {step === 1 && <Step2 data={data} onChange={updateData} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
            {step === 2 && <Step3 data={data} onChange={updateData} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
            {step === 3 && <Step4 data={data} onChange={updateData} onNext={generatePlan} onBack={() => setStep(2)} />}
          </div>
        )}

        {phase === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: 24 }}>
            <div style={{ position: "relative", width: 80, height: 80 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${T.border}` }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: T.accent, animation: "spin 1s linear infinite" }} />
              <div style={{ position: "absolute", inset: 12, borderRadius: "50%", background: T.accentGlow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>📅</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 6 }}>Montando seu cronograma...</div>
              <div style={{ fontSize: 13, color: T.textMuted }}>A IA está analisando seu perfil e criando um plano sob medida</div>
              <div style={{ fontSize: 12, color: T.textDim, marginTop: 8 }}>Considerando {data.horasEstudoDia}h/dia · {data.diasSemana.length} dias/semana · {data.estilosAprendizagem.length} estilos</div>
            </div>
          </div>
        )}

        {phase === "schedule" && plan && (
          <ScheduleView profile={data} plan={plan} onRestart={() => { setPhase("questionnaire"); setStep(0); }} />
        )}
      </div>
    </div>
  );
}
