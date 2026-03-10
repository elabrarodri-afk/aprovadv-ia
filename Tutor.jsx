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
  { id: "proc_civil", nome: "Processo Civil", icon: "📋", color: T.cyan },
  { id: "proc_penal", nome: "Processo Penal", icon: "🔍", color: T.amber },
  { id: "trabalho", nome: "Direito do Trabalho", icon: "👷", color: T.green },
  { id: "administrativo", nome: "Direito Administrativo", icon: "🏛", color: "#A78BFA" },
  { id: "tributario", nome: "Direito Tributário", icon: "💰", color: "#F472B6" },
  { id: "empresarial", nome: "Direito Empresarial", icon: "🏢", color: "#FB923C" },
  { id: "etica", nome: "Ética Profissional", icon: "⭐", color: T.amber },
  { id: "humanos", nome: "Direitos Humanos", icon: "🌍", color: T.green },
  { id: "ambiental", nome: "Direito Ambiental", icon: "🌿", color: "#4ADE80" },
];

const MODES = [
  { id: "livre", label: "Conversa Livre", icon: "💬", desc: "Pergunte qualquer coisa", color: T.accent },
  { id: "explique", label: "Me Explique", icon: "📖", desc: "Explicação didática de um tema", color: T.blue },
  { id: "caso", label: "Caso Prático", icon: "🔍", desc: "Análise de caso concreto", color: T.cyan },
  { id: "quiz", label: "Quiz Oral", icon: "🎯", desc: "Perguntas e respostas rápidas", color: T.amber },
  { id: "debate", label: "Debate Jurídico", icon: "⚔", desc: "Defenda uma tese contra a IA", color: T.red },
  { id: "mapa", label: "Mapa Mental", icon: "🧠", desc: "Organize um tema em tópicos", color: T.green },
];

const QUICK_PROMPTS = {
  constitucional: [
    "Explique Controle de Constitucionalidade",
    "Quais são os remédios constitucionais?",
    "Diferencie ADI, ADC e ADPF",
    "Como funciona o Estado de Sítio?",
  ],
  civil: [
    "Explique prescrição vs decadência",
    "Quais são os vícios do negócio jurídico?",
    "Responsabilidade civil objetiva vs subjetiva",
    "Direitos reais de garantia",
  ],
  penal: [
    "Legítima defesa vs estado de necessidade",
    "Tipos de crimes dolosos e culposos",
    "Concurso de crimes: formal vs material",
    "Regime de cumprimento de pena",
  ],
  trabalho: [
    "Justa causa: hipóteses do art. 482 CLT",
    "Diferença entre empregado e autônomo",
    "Férias: regras e cálculos",
    "Rescisão indireta do contrato",
  ],
  etica: [
    "Honorários advocatícios: limites e regras",
    "Incompatibilidades e impedimentos",
    "Deveres do advogado segundo o EOAB",
    "Publicidade na advocacia: o que pode?",
  ],
};

// ─── CLAUDE API ──────────────────────────────────────────
async function askClaude(messages, systemPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: systemPrompt,
      messages: messages,
    }),
  });
  const data = await res.json();
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
}

function buildSystemPrompt(materia, mode) {
  const base = `Você é um tutor jurídico virtual especialista em ${materia}, focado em preparação para OAB e concursos jurídicos brasileiros. 
Você é didático, paciente e usa exemplos práticos. Sempre cite artigos de lei, súmulas e jurisprudência quando relevante.
Adapte a linguagem para ser acessível mas tecnicamente precisa.
Use formatação clara com parágrafos curtos. Quando listar itens, use numeração ou letras.
Ao final de explicações longas, faça um breve resumo dos pontos principais.`;

  const modeInstructions = {
    livre: `Modo: Conversa livre. Responda qualquer pergunta sobre ${materia}. Seja completo mas conciso.`,
    explique: `Modo: Explicação didática. Ao explicar um tema:
1) Comece com uma definição clara
2) Explique o fundamento legal (artigos, leis)
3) Dê exemplos práticos
4) Mencione exceções importantes
5) Finalize com um resumo e dica de memorização
Use analogias do dia a dia quando possível.`,
    caso: `Modo: Caso prático. Quando o aluno pedir ou quando apropriado:
1) Apresente um caso hipotético detalhado
2) Peça ao aluno para identificar as questões jurídicas
3) Guie a análise passo a passo
4) Conecte com dispositivos legais
Se o aluno já trouxer um caso, analise-o profundamente.`,
    quiz: `Modo: Quiz oral. Faça perguntas curtas e objetivas ao aluno sobre ${materia}.
- Após a resposta, corrija e explique brevemente
- Aumente a dificuldade progressivamente
- Ao final de 5 perguntas, dê uma avaliação geral
- Comece com uma pergunta agora`,
    debate: `Modo: Debate jurídico. Você assume uma posição contrária à do aluno e debate.
- Apresente argumentos sólidos com fundamentação
- Respeite o contraditório
- Use jurisprudência para fortalecer seus argumentos
- Ao final, analise os melhores argumentos de cada lado
Comece propondo um tema polêmico de ${materia} para debate.`,
    mapa: `Modo: Mapa mental. Organize o tema em tópicos estruturados:
- Use hierarquia clara (tópico > subtópico > detalhe)
- Para cada tópico, inclua o fundamento legal
- Conecte tópicos relacionados
- Finalize com uma visão geral do mapa
Pergunte ao aluno qual tema quer mapear.`,
  };

  return `${base}\n\n${modeInstructions[mode] || modeInstructions.livre}`;
}

// ─── CSS ─────────────────────────────────────────────────
const CSS = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes typing { 0% { width:0; } 100% { width:24px; } }
@keyframes dotPulse { 0%,80%,100% { transform:scale(0); } 40% { transform:scale(1); } }
* { box-sizing: border-box; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: ${T.borderLight}; border-radius: 3px; }
textarea, input { font-family: 'DM Sans', sans-serif; }
textarea:focus, input:focus { outline: none; }
`;

// ─── TYPING INDICATOR ────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "8px 0", animation: "fadeIn 0.3s ease" }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, color: "#fff", fontWeight: 800, flexShrink: 0,
      }}>✦</div>
      <div style={{
        padding: "14px 18px", borderRadius: "4px 16px 16px 16px",
        background: T.bgCard, border: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: 5,
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: "50%", background: T.accent,
            animation: `dotPulse 1.4s ease-in-out ${i * 0.16}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── MESSAGE BUBBLE ──────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";

  if (isSystem) {
    return (
      <div style={{ textAlign: "center", padding: "12px 0", animation: "fadeIn 0.3s ease" }}>
        <span style={{
          padding: "6px 14px", borderRadius: 20,
          background: T.bgSurface, border: `1px solid ${T.border}`,
          fontSize: 11, color: T.textDim, fontWeight: 500,
        }}>{msg.content}</span>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      flexDirection: isUser ? "row-reverse" : "row",
      padding: "4px 0", animation: "fadeUp 0.3s ease",
    }}>
      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: isUser
          ? `linear-gradient(135deg, #4F46E5, ${T.accent})`
          : `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: isUser ? 13 : 14, fontWeight: 800, color: "#fff",
      }}>
        {isUser ? "MF" : "✦"}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: "75%", padding: "14px 18px",
        borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
        background: isUser ? T.accent + "18" : T.bgCard,
        border: `1px solid ${isUser ? T.accent + "25" : T.border}`,
      }}>
        <div style={{
          fontSize: 14, lineHeight: 1.8, color: T.text,
          whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>
          {msg.content}
        </div>
        {msg.timestamp && (
          <div style={{ fontSize: 10, color: T.textDim, marginTop: 6, textAlign: isUser ? "right" : "left" }}>
            {msg.timestamp}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TOPIC SELECTOR ──────────────────────────────────────
function TopicSelector({ onSelect }) {
  const [hov, setHov] = useState(null);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);

  if (!selectedMateria) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: "0 auto 16px",
            background: `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, color: "#fff", boxShadow: `0 8px 40px ${T.accentGlowStrong}`,
          }}>✦</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>IA Tutor</h1>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: T.textMuted }}>Seu professor particular de Direito, disponível 24h</p>
        </div>

        <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: T.text, textAlign: "center" }}>
          Escolha a matéria
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {MATERIAS.map((m) => {
            const h = hov === m.id;
            return (
              <button key={m.id} onClick={() => setSelectedMateria(m)}
                onMouseEnter={() => setHov(m.id)} onMouseLeave={() => setHov(null)}
                style={{
                  background: T.bgCard, border: `1px solid ${h ? m.color + "44" : T.border}`,
                  borderRadius: 14, padding: "20px 16px", cursor: "pointer", fontFamily: "inherit",
                  textAlign: "left", transition: "all 0.2s ease",
                  transform: h ? "translateY(-2px)" : "none",
                }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{m.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{m.nome}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Mode selection
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
      <button onClick={() => setSelectedMateria(null)}
        style={{ marginBottom: 20, padding: "8px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
        ← Trocar matéria
      </button>

      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>{selectedMateria.icon}</div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{selectedMateria.nome}</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: T.textMuted }}>Como quer estudar?</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {MODES.map((mode) => {
          const h = hov === mode.id;
          return (
            <button key={mode.id} onClick={() => onSelect(selectedMateria, mode)}
              onMouseEnter={() => setHov(mode.id)} onMouseLeave={() => setHov(null)}
              style={{
                background: T.bgCard, border: `1px solid ${h ? mode.color + "44" : T.border}`,
                borderRadius: 14, padding: "22px 16px", cursor: "pointer", fontFamily: "inherit",
                textAlign: "center", transition: "all 0.25s ease",
                transform: h ? "translateY(-3px)" : "none",
                boxShadow: h ? `0 8px 30px ${mode.color}12` : "none",
              }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{mode.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>{mode.label}</div>
              <div style={{ fontSize: 11, color: T.textDim }}>{mode.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── CHAT VIEW ───────────────────────────────────────────
function ChatView({ materia, mode, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const systemPrompt = useRef(buildSystemPrompt(materia.nome, mode.id));
  const mc = materia.color;

  const quickPrompts = QUICK_PROMPTS[materia.id] || [
    `Explique o tema mais importante de ${materia.nome}`,
    `Quais são os pontos mais cobrados na OAB?`,
    `Me dê um caso prático para analisar`,
    `Quais são os erros mais comuns dos candidatos?`,
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initial AI greeting
  useEffect(() => {
    const greet = async () => {
      setLoading(true);
      const modeGreetings = {
        livre: `Olá! Sou seu tutor de ${materia.nome}. Pode me perguntar qualquer coisa sobre a matéria — desde conceitos básicos até questões avançadas de concurso. Por onde quer começar?`,
        explique: `Olá! Estou no modo Explicação Didática. Escolha qualquer tema de ${materia.nome} e vou te explicar de forma clara, com fundamento legal e exemplos práticos. Qual tema quer entender?`,
        caso: `Olá! No modo Caso Prático, vou te apresentar situações reais para análise jurídica. Posso criar um caso para você resolver ou analisar um caso que você trouxer. Quer que eu comece com um caso?`,
        quiz: `Vamos testar seus conhecimentos em ${materia.nome}! Vou fazer perguntas objetivas e corrigir suas respostas. Preparado? Vamos lá!\n\nPrimeira pergunta: `,
        debate: `Bem-vindo ao Debate Jurídico! Vou defender posições contrárias às suas com argumentação técnica. Vamos exercitar a retórica e fundamentação.\n\nProposta de tema para debate: `,
        mapa: `Olá! No modo Mapa Mental, vou organizar qualquer tema de ${materia.nome} em uma estrutura hierárquica clara. Qual tema quer que eu mapeie?`,
      };

      let greeting = modeGreetings[mode.id] || modeGreetings.livre;

      // For quiz and debate, get AI-generated opener
      if (mode.id === "quiz" || mode.id === "debate") {
        try {
          const aiGreeting = await askClaude(
            [{ role: "user", content: mode.id === "quiz" ? "Comece o quiz com a primeira pergunta." : "Proponha um tema polêmico para debatermos." }],
            systemPrompt.current
          );
          greeting = greeting + aiGreeting;
        } catch {
          greeting = greeting + "(Envie uma mensagem para começar)";
        }
      }

      setMessages([{
        role: "assistant",
        content: greeting,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      }]);
      setLoading(false);
    };
    greet();
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = {
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setShowSuggestions(false);
    setLoading(true);

    // Build conversation history for API
    const history = [...messages, userMsg]
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

    // Keep last 20 messages for context
    const trimmed = history.slice(-20);

    try {
      const response = await askClaude(trimmed, systemPrompt.current);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: response,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Desculpe, ocorreu um erro. Tente enviar sua mensagem novamente.",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      }]);
    }
    setLoading(false);
  }, [messages, loading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", maxWidth: 820, margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px", borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: 14,
        background: T.bg, position: "sticky", top: 0, zIndex: 50,
      }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10, border: `1px solid ${T.border}`,
          background: "transparent", color: T.textMuted, fontSize: 14, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit",
        }}>←</button>

        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, color: "#fff", fontWeight: 800,
          boxShadow: `0 4px 16px ${T.accentGlowStrong}`,
        }}>✦</div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>IA Tutor · {materia.nome}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
            <span style={{
              padding: "2px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600,
              background: `${mode.color}15`, border: `1px solid ${mode.color}25`, color: mode.color,
            }}>{mode.icon} {mode.label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, boxShadow: `0 0 6px ${T.green}` }} />
              <span style={{ fontSize: 10, color: T.textDim }}>Online</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => {
            setMessages([]);
            setShowSuggestions(true);
            // Re-trigger greeting
            window.location.reload();
          }}
            style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
            ↻ Nova conversa
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "20px 20px 0",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        {/* Mode banner */}
        <div style={{
          textAlign: "center", padding: "16px", borderRadius: 14,
          background: `${mode.color}08`, border: `1px solid ${mode.color}15`,
          marginBottom: 8, animation: "fadeIn 0.5s ease",
        }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>{mode.icon}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{mode.label}</div>
          <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>{mode.desc}</div>
        </div>

        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}

        {loading && <TypingIndicator />}

        {/* Quick prompts */}
        {showSuggestions && messages.length <= 1 && !loading && (
          <div style={{ padding: "12px 0", animation: "fadeUp 0.4s ease 0.3s both" }}>
            <div style={{ fontSize: 11, color: T.textDim, marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Sugestões para começar
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {quickPrompts.map((prompt, i) => (
                <button key={i} onClick={() => sendMessage(prompt)}
                  style={{
                    padding: "12px 16px", borderRadius: 12,
                    border: `1px solid ${T.border}`, background: T.bgCard,
                    color: T.text, fontSize: 13, fontFamily: "inherit",
                    textAlign: "left", cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex", alignItems: "center", gap: 10,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.accent + "44"; e.currentTarget.style.background = T.bgHover; e.currentTarget.style.transform = "translateX(4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.bgCard; e.currentTarget.style.transform = "none"; }}>
                  <span style={{ color: T.accent, fontSize: 14 }}>→</span>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div style={{
        padding: "16px 20px 20px",
        borderTop: `1px solid ${T.border}`,
        background: T.bg,
      }}>
        {/* Quick action chips */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto", paddingBottom: 4 }}>
          {[
            { label: "Dê um exemplo", icon: "📌" },
            { label: "Explique melhor", icon: "🔍" },
            { label: "Resuma", icon: "📝" },
            { label: "Cite a lei", icon: "📚" },
            { label: "Caso prático", icon: "🔍" },
            { label: "Dica de prova", icon: "🎯" },
          ].map((chip) => (
            <button key={chip.label} onClick={() => sendMessage(chip.label)}
              style={{
                padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
                background: "transparent", color: T.textMuted, fontSize: 11, fontWeight: 500,
                cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                transition: "all 0.15s ease", display: "flex", alignItems: "center", gap: 4,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.accent + "44"; e.currentTarget.style.color = T.accentLight; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}>
              <span style={{ fontSize: 12 }}>{chip.icon}</span> {chip.label}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div style={{
          display: "flex", gap: 10, alignItems: "flex-end",
        }}>
          <div style={{
            flex: 1, position: "relative",
            background: T.bgCard, borderRadius: 14,
            border: `1px solid ${T.border}`,
            transition: "border-color 0.2s ease",
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Pergunte algo sobre ${materia.nome}...`}
              rows={1}
              style={{
                width: "100%", padding: "14px 18px", border: "none",
                background: "transparent", color: T.text, fontSize: 14,
                lineHeight: 1.5, resize: "none",
                maxHeight: 120, overflow: "auto",
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onFocus={(e) => e.target.parentElement.style.borderColor = T.accent + "55"}
              onBlur={(e) => e.target.parentElement.style.borderColor = T.border}
            />
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            style={{
              width: 48, height: 48, borderRadius: 14, border: "none", flexShrink: 0,
              background: input.trim() && !loading
                ? `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`
                : T.borderLight,
              color: input.trim() && !loading ? "#fff" : T.textDim,
              fontSize: 18, cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: input.trim() && !loading ? `0 4px 16px ${T.accentGlowStrong}` : "none",
              transition: "all 0.2s ease",
            }}>
            ↑
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <span style={{ fontSize: 10, color: T.textDim }}>
            Enter para enviar · Shift+Enter para nova linha
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────
export default function IATutorApp() {
  const [phase, setPhase] = useState("select"); // select | chat
  const [materia, setMateria] = useState(null);
  const [mode, setMode] = useState(null);

  const startChat = (mat, mod) => {
    setMateria(mat);
    setMode(mod);
    setPhase("chat");
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      background: T.bg, minHeight: "100vh", color: T.text,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap" rel="stylesheet" />
      <style>{CSS}</style>

      {phase === "select" && (
        <div style={{ padding: "32px 28px 60px" }}>
          <TopicSelector onSelect={startChat} />
        </div>
      )}

      {phase === "chat" && materia && mode && (
        <ChatView
          materia={materia}
          mode={mode}
          onBack={() => setPhase("select")}
        />
      )}
    </div>
  );
}
