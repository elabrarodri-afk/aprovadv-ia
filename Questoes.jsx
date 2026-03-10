import { useState, useEffect, useRef, useCallback } from "react";

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
  blue: "#60A5FA",
};

// ─── FILTER DATA ─────────────────────────────────────────
const MATERIAS = [
  "Direito Constitucional",
  "Direito Civil",
  "Direito Penal",
  "Direito Processual Civil",
  "Direito Processual Penal",
  "Direito do Trabalho",
  "Direito Administrativo",
  "Direito Tributário",
  "Direito Empresarial",
  "Ética Profissional",
  "Direitos Humanos",
  "Direito Ambiental",
];

const BANCAS = ["FGV", "CESPE/CEBRASPE", "VUNESP", "FCC", "Quadrix"];
const DIFICULDADES = ["Fácil", "Médio", "Difícil"];
const TIPOS_PROVA = ["OAB", "Concurso - Magistratura", "Concurso - MP", "Concurso - Defensoria", "Concurso - Delegado"];

// ─── HELPER: call Claude API ─────────────────────────────
async function askClaude(systemPrompt, userPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await res.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  return text;
}

// ─── GENERATE QUESTION ───────────────────────────────────
async function generateQuestion({ materia, banca, dificuldade, tipoProva }) {
  const sys = `Você é um gerador de questões jurídicas para estudos de OAB e concursos jurídicos brasileiros. 
Responda APENAS com JSON válido, sem markdown, sem backticks, sem explicação extra. O JSON deve ter esta estrutura exata:
{
  "enunciado": "texto do enunciado da questão",
  "alternativas": [
    {"letra": "A", "texto": "texto da alternativa A"},
    {"letra": "B", "texto": "texto da alternativa B"},
    {"letra": "C", "texto": "texto da alternativa C"},
    {"letra": "D", "texto": "texto da alternativa D"}
  ],
  "gabarito": "A",
  "tema_especifico": "subtema dentro da matéria"
}
A questão deve ser original, realista e no estilo da banca indicada.`;

  const user = `Gere uma questão de ${materia}, nível ${dificuldade}, estilo banca ${banca}, para ${tipoProva}. 
A questão deve testar conhecimento prático e ter apenas uma alternativa correta.
Responda SOMENTE com o JSON, nada mais.`;

  const raw = await askClaude(sys, user);
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Erro ao gerar questão. Tente novamente.");
  }
}

// ─── EXPLAIN ANSWER ──────────────────────────────────────
async function explainAnswer(question, selectedLetter) {
  const sys = `Você é um professor de Direito especialista em preparação para OAB e concursos jurídicos.
Responda APENAS com JSON válido, sem markdown, sem backticks. Estrutura:
{
  "explicacao_geral": "explicação geral da questão e do tema (2-3 parágrafos)",
  "alternativas": [
    {"letra": "A", "correta": true/false, "explicacao": "por que está certa/errada"},
    {"letra": "B", "correta": true/false, "explicacao": "por que está certa/errada"},
    {"letra": "C", "correta": true/false, "explicacao": "por que está certa/errada"},
    {"letra": "D", "correta": true/false, "explicacao": "por que está certa/errada"}
  ],
  "dica_estudo": "dica prática de estudo sobre o tema",
  "fundamentacao": "artigos de lei, súmulas ou jurisprudência relevante"
}`;

  const user = `O aluno respondeu "${selectedLetter}" na seguinte questão:

Enunciado: ${question.enunciado}
A) ${question.alternativas[0].texto}
B) ${question.alternativas[1].texto}
C) ${question.alternativas[2].texto}
D) ${question.alternativas[3].texto}
Gabarito: ${question.gabarito}

Explique detalhadamente cada alternativa e dê orientações de estudo. Responda SOMENTE com JSON.`;

  const raw = await askClaude(sys, user);
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      explicacao_geral: raw,
      alternativas: [],
      dica_estudo: "",
      fundamentacao: "",
    };
  }
}

// ─── COMPONENTS ──────────────────────────────────────────

function Chip({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: 8,
        border: `1px solid ${selected ? T.accent + "66" : T.border}`,
        background: selected ? T.accentGlow : "transparent",
        color: selected ? T.accentLight : T.textMuted,
        fontSize: 12,
        fontWeight: selected ? 600 : 400,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

function SelectDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ fontSize: 10, color: T.textDim, marginBottom: 6, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 10,
          border: `1px solid ${open ? T.accent + "55" : T.border}`,
          background: T.bgCard,
          color: value ? T.text : T.textDim,
          fontSize: 13,
          fontFamily: "inherit",
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "border-color 0.2s ease",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || "Selecionar..."}
        </span>
        <span style={{ color: T.textDim, fontSize: 10, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            background: T.bgSurface,
            border: `1px solid ${T.borderLight}`,
            borderRadius: 10,
            padding: 4,
            zIndex: 200,
            maxHeight: 220,
            overflowY: "auto",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                display: "block",
                width: "100%",
                padding: "9px 12px",
                border: "none",
                borderRadius: 7,
                background: value === opt ? T.accentGlow : "transparent",
                color: value === opt ? T.text : T.textMuted,
                fontSize: 12,
                fontFamily: "inherit",
                cursor: "pointer",
                textAlign: "left",
                fontWeight: value === opt ? 600 : 400,
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => { if (value !== opt) e.currentTarget.style.background = T.bgHover; }}
              onMouseLeave={(e) => { if (value !== opt) e.currentTarget.style.background = "transparent"; }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Timer({ running, onTick }) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          const next = s + 1;
          if (onTick) onTick(next);
          return next;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    if (!running) setSeconds(0);
  }, [running]);

  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: running ? T.green : T.textDim,
          boxShadow: running ? `0 0 8px ${T.green}` : "none",
          transition: "all 0.3s ease",
        }}
      />
      <span style={{ fontSize: 22, fontWeight: 700, color: T.text, fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em" }}>
        {min}:{sec}
      </span>
    </div>
  );
}

function LoadingPulse({ text }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 20 }}>
      <div style={{ position: "relative", width: 56, height: 56 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `3px solid ${T.border}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `3px solid transparent`,
            borderTopColor: T.accent,
            animation: "spin 1s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 8,
            borderRadius: "50%",
            background: T.accentGlow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          ✦
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{text || "Gerando questão..."}</div>
        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>A IA está preparando seu conteúdo</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────
export default function QuestionBank() {
  // Filter state
  const [materia, setMateria] = useState("Direito Constitucional");
  const [banca, setBanca] = useState("FGV");
  const [dificuldade, setDificuldade] = useState("Médio");
  const [tipoProva, setTipoProva] = useState("OAB");

  // Question state
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [explanation, setExplanation] = useState(null);

  // Loading states
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [error, setError] = useState(null);

  // Timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Stats for current session
  const [sessionStats, setSessionStats] = useState({ total: 0, correct: 0, times: [] });

  // Sidebar collapsed
  const [filtersOpen, setFiltersOpen] = useState(true);

  const handleGenerate = useCallback(async () => {
    setError(null);
    setQuestion(null);
    setSelected(null);
    setConfirmed(false);
    setExplanation(null);
    setLoadingQuestion(true);
    setTimerRunning(false);

    try {
      const q = await generateQuestion({ materia, banca, dificuldade, tipoProva });
      setQuestion(q);
      setTimerRunning(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingQuestion(false);
    }
  }, [materia, banca, dificuldade, tipoProva]);

  const handleConfirm = useCallback(async () => {
    if (!selected || !question) return;
    setConfirmed(true);
    setTimerRunning(false);
    setLoadingExplanation(true);

    const isCorrect = selected === question.gabarito;
    setSessionStats((prev) => ({
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      times: [...prev.times, elapsedTime],
    }));

    try {
      const exp = await explainAnswer(question, selected);
      setExplanation(exp);
    } catch {
      setExplanation({ explicacao_geral: "Não foi possível gerar explicação. Tente novamente.", alternativas: [], dica_estudo: "", fundamentacao: "" });
    } finally {
      setLoadingExplanation(false);
    }
  }, [selected, question, elapsedTime]);

  const isCorrect = confirmed && selected === question?.gabarito;
  const avgTime = sessionStats.times.length > 0 ? Math.round(sessionStats.times.reduce((a, b) => a + b, 0) / sessionStats.times.length) : 0;

  return (
    <div
      style={{
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        background: T.bg,
        minHeight: "100vh",
        color: T.text,
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.borderLight}; border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 28px 60px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: "#fff",
                fontWeight: 800,
              }}
            >
              ◇
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em" }}>Banco de Questões</h1>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: T.textMuted }}>Questões geradas por IA · Correção e explicação detalhada</p>
            </div>
          </div>

          {/* Session stats mini */}
          {sessionStats.total > 0 && (
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{sessionStats.total}</div>
                <div style={{ fontSize: 9, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Questões</div>
              </div>
              <div style={{ width: 1, height: 28, background: T.border }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: sessionStats.total > 0 ? (sessionStats.correct / sessionStats.total >= 0.7 ? T.green : T.amber) : T.text }}>
                  {sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0}%
                </div>
                <div style={{ fontSize: 9, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Acerto</div>
              </div>
              <div style={{ width: 1, height: 28, background: T.border }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{avgTime}s</div>
                <div style={{ fontSize: 9, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>Média</div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: filtersOpen ? "280px 1fr" : "1fr", gap: 20 }}>
          {/* ─── FILTERS PANEL ─── */}
          {filtersOpen && (
            <div
              style={{
                background: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: 16,
                padding: "22px 20px",
                height: "fit-content",
                position: "sticky",
                top: 20,
                animation: "fadeUp 0.3s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>⚙ Filtros</h3>
                <button
                  onClick={() => setFiltersOpen(false)}
                  style={{ border: "none", background: "transparent", color: T.textDim, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <SelectDropdown label="Matéria" options={MATERIAS} value={materia} onChange={setMateria} />
                <SelectDropdown label="Banca" options={BANCAS} value={banca} onChange={setBanca} />
                <SelectDropdown label="Tipo de Prova" options={TIPOS_PROVA} value={tipoProva} onChange={setTipoProva} />

                <div>
                  <div style={{ fontSize: 10, color: T.textDim, marginBottom: 8, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Dificuldade
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {DIFICULDADES.map((d) => (
                      <Chip key={d} label={d} selected={dificuldade === d} onClick={() => setDificuldade(d)} />
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loadingQuestion}
                style={{
                  width: "100%",
                  marginTop: 24,
                  padding: "12px",
                  borderRadius: 12,
                  border: "none",
                  background: loadingQuestion ? T.borderLight : `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: loadingQuestion ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  boxShadow: loadingQuestion ? "none" : `0 4px 24px ${T.accentGlowStrong}`,
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {loadingQuestion ? (
                  <>
                    <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>✦</span>
                    Gerando...
                  </>
                ) : (
                  <>✦ Gerar Questão</>
                )}
              </button>
            </div>
          )}

          {/* ─── MAIN AREA ─── */}
          <div>
            {!filtersOpen && (
              <button
                onClick={() => setFiltersOpen(true)}
                style={{
                  marginBottom: 14,
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: `1px solid ${T.border}`,
                  background: T.bgCard,
                  color: T.textMuted,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                ⚙ Mostrar filtros
              </button>
            )}

            {/* Empty state */}
            {!question && !loadingQuestion && !error && (
              <div
                style={{
                  background: T.bgCard,
                  border: `1px solid ${T.border}`,
                  borderRadius: 16,
                  padding: "80px 40px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>◇</div>
                <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: T.text }}>Pronto para estudar?</h2>
                <p style={{ margin: 0, fontSize: 13, color: T.textMuted, maxWidth: 400, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
                  Configure os filtros ao lado e clique em <strong style={{ color: T.accent }}>Gerar Questão</strong> para começar. 
                  A IA criará questões personalizadas no estilo da banca e matéria escolhidos.
                </p>
              </div>
            )}

            {/* Loading */}
            {loadingQuestion && (
              <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16 }}>
                <LoadingPulse text="Gerando questão com IA..." />
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                style={{
                  background: T.redBg,
                  border: `1px solid ${T.redBorder}`,
                  borderRadius: 14,
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 20 }}>⚠</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.red }}>{error}</div>
                  <button
                    onClick={handleGenerate}
                    style={{
                      marginTop: 8,
                      padding: "6px 14px",
                      borderRadius: 8,
                      border: `1px solid ${T.redBorder}`,
                      background: "transparent",
                      color: T.red,
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            )}

            {/* ─── QUESTION CARD ─── */}
            {question && !loadingQuestion && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                {/* Question header with timer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ padding: "4px 10px", borderRadius: 6, background: T.accentGlow, color: T.accentLight, fontSize: 11, fontWeight: 600 }}>
                      {materia}
                    </span>
                    {question.tema_especifico && (
                      <span style={{ padding: "4px 10px", borderRadius: 6, background: T.bgSurface, border: `1px solid ${T.border}`, color: T.textMuted, fontSize: 11 }}>
                        {question.tema_especifico}
                      </span>
                    )}
                    <span style={{ padding: "4px 10px", borderRadius: 6, background: T.amberBg, color: T.amber, fontSize: 11, fontWeight: 600 }}>
                      {dificuldade}
                    </span>
                  </div>
                  <Timer running={timerRunning} onTick={setElapsedTime} />
                </div>

                {/* Enunciado */}
                <div
                  style={{
                    background: T.bgCard,
                    border: `1px solid ${T.border}`,
                    borderRadius: 16,
                    padding: "28px 28px 24px",
                    marginBottom: 12,
                  }}
                >
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: T.text, fontWeight: 400 }}>
                    {question.enunciado}
                  </p>
                </div>

                {/* Alternativas */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {question.alternativas.map((alt) => {
                    const isSelected = selected === alt.letra;
                    const isGabarito = confirmed && alt.letra === question.gabarito;
                    const isWrong = confirmed && isSelected && alt.letra !== question.gabarito;

                    let borderColor = T.border;
                    let bg = T.bgCard;
                    let accentBg = "transparent";
                    if (!confirmed && isSelected) {
                      borderColor = T.accent + "77";
                      bg = T.bgHover;
                      accentBg = T.accentGlow;
                    }
                    if (isGabarito) {
                      borderColor = T.greenBorder;
                      bg = T.greenBg;
                    }
                    if (isWrong) {
                      borderColor = T.redBorder;
                      bg = T.redBg;
                    }

                    return (
                      <button
                        key={alt.letra}
                        onClick={() => { if (!confirmed) setSelected(alt.letra); }}
                        disabled={confirmed}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 14,
                          padding: "16px 20px",
                          borderRadius: 12,
                          border: `1px solid ${borderColor}`,
                          background: bg,
                          cursor: confirmed ? "default" : "pointer",
                          fontFamily: "inherit",
                          textAlign: "left",
                          transition: "all 0.2s ease",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        onMouseEnter={(e) => {
                          if (!confirmed && !isSelected) {
                            e.currentTarget.style.borderColor = T.borderLight;
                            e.currentTarget.style.background = T.bgHover;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!confirmed && !isSelected) {
                            e.currentTarget.style.borderColor = T.border;
                            e.currentTarget.style.background = T.bgCard;
                          }
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 9,
                            border: `2px solid ${isGabarito ? T.green : isWrong ? T.red : isSelected ? T.accent : T.borderLight}`,
                            background: isGabarito ? T.greenBg : isWrong ? T.redBg : isSelected ? T.accentGlow : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 700,
                            color: isGabarito ? T.green : isWrong ? T.red : isSelected ? T.accent : T.textMuted,
                            flexShrink: 0,
                            transition: "all 0.2s ease",
                          }}
                        >
                          {isGabarito ? "✓" : isWrong ? "✕" : alt.letra}
                        </div>
                        <span style={{ fontSize: 14, lineHeight: 1.65, color: T.text, paddingTop: 4 }}>
                          {alt.texto}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Action buttons */}
                {!confirmed && (
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={handleConfirm}
                      disabled={!selected}
                      style={{
                        flex: 1,
                        padding: "14px",
                        borderRadius: 12,
                        border: "none",
                        background: selected
                          ? `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`
                          : T.borderLight,
                        color: selected ? "#fff" : T.textDim,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: selected ? "pointer" : "not-allowed",
                        fontFamily: "inherit",
                        boxShadow: selected ? `0 4px 24px ${T.accentGlowStrong}` : "none",
                        transition: "all 0.3s ease",
                      }}
                    >
                      Confirmar Resposta
                    </button>
                    <button
                      onClick={handleGenerate}
                      style={{
                        padding: "14px 20px",
                        borderRadius: 12,
                        border: `1px solid ${T.border}`,
                        background: "transparent",
                        color: T.textMuted,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Pular →
                    </button>
                  </div>
                )}

                {/* ─── RESULT & EXPLANATION ─── */}
                {confirmed && (
                  <div style={{ animation: "fadeUp 0.4s ease" }}>
                    {/* Result banner */}
                    <div
                      style={{
                        background: isCorrect ? T.greenBg : T.redBg,
                        border: `1px solid ${isCorrect ? T.greenBorder : T.redBorder}`,
                        borderRadius: 14,
                        padding: "18px 24px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: isCorrect ? T.greenBg : T.redBg,
                          border: `1px solid ${isCorrect ? T.greenBorder : T.redBorder}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                        }}
                      >
                        {isCorrect ? "🎯" : "💡"}
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: isCorrect ? T.green : T.red }}>
                          {isCorrect ? "Resposta Correta!" : "Resposta Incorreta"}
                        </div>
                        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
                          {isCorrect
                            ? `Respondida em ${elapsedTime}s — Ótimo trabalho!`
                            : `A alternativa correta é ${question.gabarito}. Veja a explicação abaixo.`}
                        </div>
                      </div>
                    </div>

                    {/* Explanation */}
                    {loadingExplanation ? (
                      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16 }}>
                        <LoadingPulse text="A IA está preparando a explicação..." />
                      </div>
                    ) : explanation ? (
                      <div
                        style={{
                          background: T.bgCard,
                          border: `1px solid ${T.border}`,
                          borderRadius: 16,
                          padding: "24px 26px",
                          marginBottom: 16,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              background: `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 13,
                              color: "#fff",
                            }}
                          >
                            ✦
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Explicação da IA</span>
                        </div>

                        {/* General explanation */}
                        <p style={{ fontSize: 13, lineHeight: 1.75, color: T.textMuted, margin: "0 0 20px", whiteSpace: "pre-wrap" }}>
                          {explanation.explicacao_geral}
                        </p>

                        {/* Per-alternative explanation */}
                        {explanation.alternativas && explanation.alternativas.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                            {explanation.alternativas.map((alt) => (
                              <div
                                key={alt.letra}
                                style={{
                                  padding: "12px 16px",
                                  borderRadius: 10,
                                  background: alt.correta ? T.greenBg : T.bgSurface,
                                  border: `1px solid ${alt.correta ? T.greenBorder : T.border}`,
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                  <span
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: alt.correta ? T.green : T.textMuted,
                                    }}
                                  >
                                    {alt.letra}) {alt.correta ? "✓ Correta" : "✕ Incorreta"}
                                  </span>
                                </div>
                                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: T.textMuted }}>
                                  {alt.explicacao}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Fundamentação */}
                        {explanation.fundamentacao && (
                          <div
                            style={{
                              padding: "14px 16px",
                              borderRadius: 10,
                              background: T.accentGlow,
                              border: `1px solid ${T.accent}22`,
                              marginBottom: 14,
                            }}
                          >
                            <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                              📚 Fundamentação Legal
                            </div>
                            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: T.textMuted }}>
                              {explanation.fundamentacao}
                            </p>
                          </div>
                        )}

                        {/* Study tip */}
                        {explanation.dica_estudo && (
                          <div
                            style={{
                              padding: "14px 16px",
                              borderRadius: 10,
                              background: T.amberBg,
                              border: `1px solid rgba(251, 191, 36, 0.15)`,
                            }}
                          >
                            <div style={{ fontSize: 11, fontWeight: 700, color: T.amber, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                              💡 Dica de Estudo
                            </div>
                            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: T.textMuted }}>
                              {explanation.dica_estudo}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Next question */}
                    <button
                      onClick={handleGenerate}
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: 12,
                        border: "none",
                        background: `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`,
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        boxShadow: `0 4px 24px ${T.accentGlowStrong}`,
                      }}
                    >
                      Próxima Questão →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
