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
};

const MATERIAS = [
  { id: "constitucional", nome: "Direito Constitucional", icon: "⚖", color: T.accent },
  { id: "civil", nome: "Direito Civil", icon: "📜", color: T.blue },
  { id: "penal", nome: "Direito Penal", icon: "🔒", color: T.red },
  { id: "proc_civil", nome: "Direito Processual Civil", icon: "📋", color: T.cyan },
  { id: "proc_penal", nome: "Direito Processual Penal", icon: "🔍", color: T.amber },
  { id: "trabalho", nome: "Direito do Trabalho", icon: "👷", color: T.green },
  { id: "administrativo", nome: "Direito Administrativo", icon: "🏛", color: "#A78BFA" },
  { id: "tributario", nome: "Direito Tributário", icon: "💰", color: "#F472B6" },
  { id: "empresarial", nome: "Direito Empresarial", icon: "🏢", color: "#FB923C" },
  { id: "etica", nome: "Ética Profissional", icon: "⭐", color: T.amber },
  { id: "humanos", nome: "Direitos Humanos", icon: "🌍", color: T.green },
  { id: "ambiental", nome: "Direito Ambiental", icon: "🌿", color: "#4ADE80" },
];

// ─── CLAUDE API ──────────────────────────────────────────
async function askClaude(sys, user, maxTokens = 1000) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, system: sys, messages: [{ role: "user", content: user }] }),
  });
  const data = await res.json();
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
}

async function generateFlashcards(materia, quantidade, dificuldade) {
  const sys = `Você é um professor de Direito especialista em criar flashcards para OAB e concursos. Responda APENAS com JSON (sem markdown/backticks).
Gere um array de ${quantidade} flashcards sobre ${materia}. Cada card deve cobrir um tema DIFERENTE.

Estrutura:
[
  {
    "frente": "Pergunta clara e objetiva (pode incluir caso hipotético curto)",
    "verso": "Resposta completa mas concisa (máximo 3-4 linhas), com artigo de lei ou súmula quando relevante",
    "tema": "subtema específico dentro da matéria",
    "dica": "dica mnemônica ou macete para memorizar (1 frase curta)",
    "dificuldade": "facil|medio|dificil"
  }
]

Cards devem variar entre conceitos, distinções, prazos, requisitos e casos práticos. Nível: ${dificuldade}.`;

  const user = `Gere ${quantidade} flashcards de ${materia} para estudo OAB/concursos, nível ${dificuldade}. Temas variados. SOMENTE JSON.`;
  const raw = await askClaude(sys, user, 1500);
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  catch { throw new Error("Erro ao gerar flashcards"); }
}

async function explainCard(card) {
  const sys = `Você é professor de Direito. Explique o conceito do flashcard de forma didática. Responda APENAS com JSON:
{"explicacao":"explicação detalhada 2-3 parágrafos","exemplo_pratico":"exemplo prático ou caso hipotético curto","artigos":"artigos de lei, súmulas ou jurisprudência relevante","dica_extra":"dica adicional de memorização"}`;
  const user = `Flashcard:\nPergunta: ${card.frente}\nResposta: ${card.verso}\n\nExplique detalhadamente. SOMENTE JSON.`;
  const raw = await askClaude(sys, user);
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  catch { return { explicacao: raw, exemplo_pratico: "", artigos: "", dica_extra: "" }; }
}

// ─── SPACED REPETITION (SM-2 simplified) ─────────────────
function getNextReview(quality) {
  // quality: 0=errou, 1=difícil, 2=ok, 3=fácil
  const intervals = { 0: 1, 1: 3, 2: 7, 3: 14 };
  return intervals[quality] || 1;
}

// ─── CSS ─────────────────────────────────────────────────
const CSS = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes slideLeft { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
@keyframes slideRight { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
@keyframes bounceIn { 0% { transform:scale(0.3); opacity:0; } 50% { transform:scale(1.05); } 70% { transform:scale(0.95); } 100% { transform:scale(1); opacity:1; } }
@keyframes confetti { 0% { transform:translateY(0) rotate(0deg); opacity:1; } 100% { transform:translateY(-120px) rotate(720deg); opacity:0; } }
@keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
* { box-sizing: border-box; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: ${T.borderLight}; border-radius: 3px; }

.card-flip-container {
  perspective: 1200px;
  cursor: pointer;
}
.card-flip-inner {
  position: relative;
  width: 100%;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}
.card-flip-inner.flipped {
  transform: rotateY(180deg);
}
.card-flip-front, .card-flip-back {
  position: absolute;
  width: 100%;
  backface-visibility: hidden;
  border-radius: 20px;
}
.card-flip-back {
  transform: rotateY(180deg);
}
`;

// ─── CONFETTI BURST ──────────────────────────────────────
function ConfettiBurst() {
  const colors = [T.accent, T.green, T.amber, T.blue, T.cyan, "#F472B6"];
  return (
    <div style={{ position: "absolute", top: "50%", left: "50%", pointerEvents: "none", zIndex: 50 }}>
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: 8 + Math.random() * 6,
          height: 8 + Math.random() * 6,
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          background: colors[i % colors.length],
          left: (Math.random() - 0.5) * 200,
          animation: `confetti ${0.8 + Math.random() * 0.6}s ease-out ${Math.random() * 0.2}s forwards`,
        }} />
      ))}
    </div>
  );
}

// ─── DECK SELECT ─────────────────────────────────────────
function DeckSelect({ onSelect }) {
  const [hov, setHov] = useState(null);
  const [qty, setQty] = useState(10);
  const [diff, setDiff] = useState("Misto");

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>↻</div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>Revisão com Flashcards</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: T.textMuted }}>Repetição espaçada com IA · Memorize de verdade</p>
      </div>

      {/* Config bar */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, background: T.bgCard, border: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 11, color: T.textDim, fontWeight: 600 }}>Quantidade:</span>
          {[5, 10, 15, 20].map((n) => (
            <button key={n} onClick={() => setQty(n)}
              style={{
                padding: "4px 10px", borderRadius: 6, border: "none",
                background: qty === n ? T.accentGlow : "transparent",
                color: qty === n ? T.accentLight : T.textMuted,
                fontSize: 12, fontWeight: qty === n ? 700 : 400, cursor: "pointer", fontFamily: "inherit",
              }}>{n}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, background: T.bgCard, border: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 11, color: T.textDim, fontWeight: 600 }}>Nível:</span>
          {["Fácil", "Médio", "Difícil", "Misto"].map((d) => (
            <button key={d} onClick={() => setDiff(d)}
              style={{
                padding: "4px 10px", borderRadius: 6, border: "none",
                background: diff === d ? T.accentGlow : "transparent",
                color: diff === d ? T.accentLight : T.textMuted,
                fontSize: 12, fontWeight: diff === d ? 700 : 400, cursor: "pointer", fontFamily: "inherit",
              }}>{d}</button>
          ))}
        </div>
      </div>

      {/* Materia grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {MATERIAS.map((m) => {
          const h = hov === m.id;
          return (
            <button key={m.id} onClick={() => onSelect(m, qty, diff)}
              onMouseEnter={() => setHov(m.id)} onMouseLeave={() => setHov(null)}
              style={{
                background: T.bgCard, border: `1px solid ${h ? m.color + "44" : T.border}`,
                borderRadius: 14, padding: "22px 18px", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                transition: "all 0.25s ease", transform: h ? "translateY(-3px)" : "none",
                boxShadow: h ? `0 8px 30px ${m.color}12` : "none",
                position: "relative", overflow: "hidden",
              }}>
              {h && <div style={{ position: "absolute", top: -20, right: -20, width: 60, height: 60, borderRadius: "50%", background: `radial-gradient(circle, ${m.color}15, transparent)`, pointerEvents: "none" }} />}
              <div style={{ fontSize: 26, marginBottom: 10 }}>{m.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>{m.nome}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: m.color }} />
                <span style={{ fontSize: 11, color: T.textDim }}>{qty} cards</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── FLASHCARD COMPONENT ─────────────────────────────────
function FlashCard({ card, flipped, onFlip, animDir, materia }) {
  const diffColors = { facil: T.green, medio: T.amber, dificil: T.red };
  const diffColor = diffColors[card.dificuldade] || T.textDim;
  const mc = MATERIAS.find((m) => m.nome === materia)?.color || T.accent;

  return (
    <div className="card-flip-container" onClick={onFlip}
      style={{ width: "100%", maxWidth: 560, margin: "0 auto", animation: animDir === "left" ? "slideLeft 0.4s ease" : animDir === "right" ? "slideRight 0.4s ease" : "fadeUp 0.4s ease" }}>
      <div className={`card-flip-inner ${flipped ? "flipped" : ""}`} style={{ height: 380 }}>
        {/* FRONT */}
        <div className="card-flip-front" style={{
          height: "100%", background: T.bgCard, border: `1px solid ${T.border}`,
          padding: "32px 36px", display: "flex", flexDirection: "column",
          position: "relative", overflow: "hidden",
        }}>
          {/* Top glow */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${mc}10, transparent)`, pointerEvents: "none" }} />
          {/* Decorative corner */}
          <div style={{ position: "absolute", top: 0, left: 0, width: 80, height: 4, borderRadius: "0 0 4px 0", background: `linear-gradient(90deg, ${mc}, transparent)` }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ padding: "4px 10px", borderRadius: 6, background: `${mc}15`, border: `1px solid ${mc}22`, fontSize: 11, fontWeight: 600, color: mc }}>{card.tema}</span>
            <span style={{ padding: "3px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600, color: diffColor, background: `${diffColor}15` }}>{card.dificuldade}</span>
          </div>

          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ margin: 0, fontSize: 19, lineHeight: 1.7, color: T.text, textAlign: "center", fontWeight: 500, maxWidth: 440 }}>
              {card.frente}
            </p>
          </div>

          <div style={{ textAlign: "center", paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 12, color: T.textDim }}>Toque para ver a resposta</span>
          </div>
        </div>

        {/* BACK */}
        <div className="card-flip-back" style={{
          height: "100%", background: T.bgCard, border: `1px solid ${mc}33`,
          padding: "32px 36px", display: "flex", flexDirection: "column",
          position: "relative", overflow: "hidden", borderRadius: 20,
        }}>
          <div style={{ position: "absolute", top: -60, left: -60, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${mc}12, transparent)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 4, borderRadius: "0 0 0 4px", background: `linear-gradient(-90deg, ${mc}, transparent)` }} />

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: `${mc}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: mc }}>✦</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: mc }}>Resposta</span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ margin: "0 0 16px", fontSize: 16, lineHeight: 1.8, color: T.text, fontWeight: 500 }}>
              {card.verso}
            </p>
            {card.dica && (
              <div style={{ padding: "10px 14px", borderRadius: 10, background: T.amberBg, border: `1px solid ${T.amberBorder}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.amber, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>💡 Macete</div>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: T.textMuted }}>{card.dica}</p>
              </div>
            )}
          </div>

          <div style={{ textAlign: "center", paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 12, color: T.textDim }}>Avalie seu domínio abaixo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STUDY SESSION ───────────────────────────────────────
function StudySession({ materia, cards, onFinish }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState([]); // { cardIdx, quality, time }
  const [animDir, setAnimDir] = useState(null);
  const [showExplain, setShowExplain] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [loadingExp, setLoadingExp] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setSessionTime(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [startTime]);

  const card = cards[idx];
  const progress = ((idx) / cards.length) * 100;
  const mc = MATERIAS.find((m) => m.nome === materia)?.color || T.accent;

  const rate = (quality) => {
    setResults((p) => [...p, { cardIdx: idx, quality, time: Date.now() }]);

    if (quality === 3) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    }

    if (idx < cards.length - 1) {
      setAnimDir("left");
      setTimeout(() => {
        setIdx(idx + 1);
        setFlipped(false);
        setShowExplain(false);
        setExplanation(null);
        setAnimDir(null);
      }, 100);
    } else {
      onFinish([...results, { cardIdx: idx, quality }]);
    }
  };

  const loadExplanation = async () => {
    if (explanation) { setShowExplain(!showExplain); return; }
    setShowExplain(true);
    setLoadingExp(true);
    try { const exp = await explainCard(card); setExplanation(exp); }
    catch { setExplanation({ explicacao: "Erro ao carregar explicação.", exemplo_pratico: "", artigos: "", dica_extra: "" }); }
    setLoadingExp(false);
  };

  const qualityButtons = [
    { q: 0, label: "Errei", sub: "Rever em 1 dia", color: T.red, icon: "✕" },
    { q: 1, label: "Difícil", sub: "Rever em 3 dias", color: T.amber, icon: "⚠" },
    { q: 2, label: "Lembrei", sub: "Rever em 7 dias", color: T.blue, icon: "◎" },
    { q: 3, label: "Fácil!", sub: "Rever em 14 dias", color: T.green, icon: "✓" },
  ];

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
      {showConfetti && <ConfettiBurst />}

      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => onFinish(results)}
            style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>✕</button>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{materia}</div>
            <div style={{ fontSize: 11, color: T.textDim }}>{idx + 1} de {cards.length} · {formatTime(sessionTime)}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {results.filter((r) => r.quality >= 2).length > 0 && (
            <span style={{ padding: "4px 10px", borderRadius: 6, background: T.greenBg, border: `1px solid ${T.greenBorder}`, fontSize: 11, fontWeight: 600, color: T.green }}>
              🔥 {results.filter((r) => r.quality >= 2).length}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: T.border, borderRadius: 4, marginBottom: 28, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${mc}, ${T.accentLight})`, borderRadius: 4, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>

      {/* Card */}
      <FlashCard card={card} flipped={flipped} onFlip={() => setFlipped(!flipped)} animDir={animDir} materia={materia} />

      {/* Action buttons */}
      {flipped && (
        <div style={{ marginTop: 24, animation: "fadeUp 0.3s ease" }}>
          {/* Quality rating */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
            {qualityButtons.map((b) => (
              <button key={b.q} onClick={() => rate(b.q)}
                style={{
                  padding: "14px 8px", borderRadius: 12, border: `1px solid ${T.border}`,
                  background: T.bgCard, cursor: "pointer", fontFamily: "inherit",
                  textAlign: "center", transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = b.color + "55"; e.currentTarget.style.background = T.bgHover; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.bgCard; e.currentTarget.style.transform = "none"; }}>
                <div style={{ fontSize: 20, marginBottom: 6, color: b.color }}>{b.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{b.label}</div>
                <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>{b.sub}</div>
              </button>
            ))}
          </div>

          {/* Explain button */}
          <button onClick={loadExplanation}
            style={{
              width: "100%", padding: "12px", borderRadius: 10, border: `1px solid ${T.accent}33`,
              background: T.accentGlow, color: T.accentLight, fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s ease",
            }}>
            {showExplain ? "Fechar explicação" : "✦ Explicação detalhada da IA"}
          </button>

          {/* Explanation panel */}
          {showExplain && (
            <div style={{ marginTop: 12, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: "22px", animation: "fadeUp 0.3s ease" }}>
              {loadingExp ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <div style={{ width: 32, height: 32, margin: "0 auto 10px", borderRadius: "50%", border: `3px solid ${T.border}`, borderTopColor: T.accent, animation: "spin 1s linear infinite" }} />
                  <div style={{ fontSize: 12, color: T.textMuted }}>IA analisando...</div>
                </div>
              ) : explanation ? (
                <>
                  <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.75, color: T.textMuted, whiteSpace: "pre-wrap" }}>{explanation.explicacao}</p>
                  {explanation.exemplo_pratico && (
                    <div style={{ padding: "12px 14px", borderRadius: 10, background: T.blueBg, border: `1px solid ${T.blue}22`, marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.blue, marginBottom: 4, textTransform: "uppercase" }}>📌 Exemplo Prático</div>
                      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: T.textMuted }}>{explanation.exemplo_pratico}</p>
                    </div>
                  )}
                  {explanation.artigos && (
                    <div style={{ padding: "12px 14px", borderRadius: 10, background: T.accentGlow, border: `1px solid ${T.accent}22`, marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.accent, marginBottom: 4, textTransform: "uppercase" }}>📚 Fundamentação</div>
                      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: T.textMuted }}>{explanation.artigos}</p>
                    </div>
                  )}
                  {explanation.dica_extra && (
                    <div style={{ padding: "12px 14px", borderRadius: 10, background: T.amberBg, border: `1px solid ${T.amberBorder}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.amber, marginBottom: 4, textTransform: "uppercase" }}>💡 Dica Extra</div>
                      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: T.textMuted }}>{explanation.dica_extra}</p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Keyboard hints */}
      {!flipped && (
        <div style={{ textAlign: "center", marginTop: 20, animation: "fadeIn 0.5s ease" }}>
          <span style={{ fontSize: 11, color: T.textDim }}>Clique no card ou pressione <kbd style={{ padding: "2px 6px", borderRadius: 4, background: T.bgSurface, border: `1px solid ${T.border}`, fontSize: 10, color: T.textMuted }}>Espaço</kbd> para virar</span>
        </div>
      )}
    </div>
  );
}

function formatTime(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

// ─── SESSION RESULTS ─────────────────────────────────────
function SessionResults({ materia, cards, results, onRestart, onHome }) {
  const mc = MATERIAS.find((m) => m.nome === materia)?.color || T.accent;
  const total = results.length;
  const easy = results.filter((r) => r.quality === 3).length;
  const ok = results.filter((r) => r.quality === 2).length;
  const hard = results.filter((r) => r.quality === 1).length;
  const wrong = results.filter((r) => r.quality === 0).length;
  const mastered = easy + ok;
  const pct = Math.round((mastered / total) * 100);

  const qualityLabels = { 0: { l: "Errei", c: T.red, ic: "✕" }, 1: { l: "Difícil", c: T.amber, ic: "⚠" }, 2: { l: "Lembrei", c: T.blue, ic: "◎" }, 3: { l: "Fácil", c: T.green, ic: "✓" } };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", animation: "fadeUp 0.5s ease" }}>
      {/* Hero */}
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: "40px 32px", textAlign: "center", marginBottom: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 250, height: 250, borderRadius: "50%", background: `radial-gradient(circle, ${mc}10, transparent)`, pointerEvents: "none" }} />
        <div style={{ fontSize: 44, marginBottom: 14, animation: "bounceIn 0.6s ease" }}>{pct >= 80 ? "🏆" : pct >= 50 ? "📚" : "💪"}</div>
        <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800 }}>Sessão Completa!</h2>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: T.textMuted }}>{materia}</p>

        <ProgressRing value={pct} size={120} stroke={8} color={pct >= 80 ? T.green : pct >= 50 ? T.amber : T.red}>
          <span style={{ fontSize: 28, fontWeight: 800, color: T.text }}>{pct}%</span>
          <span style={{ fontSize: 10, color: T.textDim }}>domínio</span>
        </ProgressRing>

        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 24 }}>
          {[
            { n: easy, l: "Fácil", c: T.green },
            { n: ok, l: "Lembrei", c: T.blue },
            { n: hard, l: "Difícil", c: T.amber },
            { n: wrong, l: "Errei", c: T.red },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.c }}>{s.n}</div>
              <div style={{ fontSize: 10, color: T.textDim }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Card-by-card review */}
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "22px", marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>Revisão por Card</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {results.map((r, i) => {
            const c = cards[r.cardIdx];
            const q = qualityLabels[r.quality];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, background: T.bgSurface, border: `1px solid ${T.border}` }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: `${q.c}12`, border: `1px solid ${q.c}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: q.c, fontWeight: 700, flexShrink: 0 }}>{q.ic}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c?.frente}</div>
                  <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>{c?.tema}</div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <span style={{ padding: "3px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600, color: q.c, background: `${q.c}12` }}>{q.l}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next review schedule */}
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: "22px", marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>📅 Próximas Revisões</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {[
            { label: "Amanhã", count: wrong, color: T.red },
            { label: "Em 3 dias", count: hard, color: T.amber },
            { label: "Em 7 dias", count: ok, color: T.blue },
            { label: "Em 14 dias", count: easy, color: T.green },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center", padding: "12px 8px", borderRadius: 10, background: T.bgSurface, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 10, color: T.textDim, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        {wrong + hard > 0 && (
          <button onClick={onRestart}
            style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 24px ${T.accentGlowStrong}` }}>
            ↻ Revisar Erros ({wrong + hard})
          </button>
        )}
        <button onClick={onHome}
          style={{ flex: wrong + hard > 0 ? "none" : 1, padding: "14px 24px", borderRadius: 12, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", width: wrong + hard > 0 ? "auto" : "100%" }}>
          Escolher matéria
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────
export default function FlashcardsApp() {
  const [phase, setPhase] = useState("select"); // select | loading | study | results
  const [materia, setMateria] = useState("");
  const [cards, setCards] = useState([]);
  const [results, setResults] = useState([]);
  const [loadingText, setLoadingText] = useState("");

  const startSession = useCallback(async (mat, qty, diff) => {
    setMateria(mat.nome);
    setPhase("loading");
    setLoadingText(`Gerando ${qty} flashcards de ${mat.nome}...`);
    try {
      const generated = await generateFlashcards(mat.nome, qty, diff);
      setCards(Array.isArray(generated) ? generated : []);
      setPhase("study");
    } catch {
      setLoadingText("Erro ao gerar. Recarregue.");
    }
  }, []);

  const finishSession = (res) => {
    setResults(res);
    setPhase("results");
  };

  const restartErrors = () => {
    const errorCards = results.filter((r) => r.quality <= 1).map((r) => cards[r.cardIdx]).filter(Boolean);
    if (errorCards.length > 0) {
      setCards(errorCards);
      setResults([]);
      setPhase("study");
    }
  };

  // Keyboard support
  useEffect(() => {
    const handler = (e) => {
      if (e.code === "Space" && phase === "study") {
        e.preventDefault();
        // Flip is handled inside the card click
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase]);

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif", background: T.bg, minHeight: "100vh", color: T.text }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap" rel="stylesheet" />
      <style>{CSS}</style>

      <div style={{ padding: "32px 28px 60px" }}>
        {phase === "select" && <DeckSelect onSelect={startSession} />}

        {phase === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", gap: 20 }}>
            <div style={{ position: "relative", width: 64, height: 64 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${T.border}` }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: T.accent, animation: "spin 1s linear infinite" }} />
              <div style={{ position: "absolute", inset: 10, borderRadius: "50%", background: T.accentGlow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>↻</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{loadingText}</div>
              <div style={{ fontSize: 12, color: T.textDim, marginTop: 4 }}>A IA está criando seus cards</div>
            </div>
          </div>
        )}

        {phase === "study" && cards.length > 0 && (
          <StudySession materia={materia} cards={cards} onFinish={finishSession} />
        )}

        {phase === "results" && (
          <SessionResults materia={materia} cards={cards} results={results} onRestart={restartErrors} onHome={() => setPhase("select")} />
        )}
      </div>
    </div>
  );
}
