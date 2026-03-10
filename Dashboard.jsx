import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0A0B0F",
  bgCard: "#12131A",
  bgCardHover: "#181924",
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
  greenBg: "rgba(52, 211, 153, 0.1)",
  greenBorder: "rgba(52, 211, 153, 0.2)",
  amber: "#FBBF24",
  amberBg: "rgba(251, 191, 36, 0.1)",
  red: "#F87171",
  redBg: "rgba(248, 113, 113, 0.1)",
  blue: "#60A5FA",
  blueBg: "rgba(96, 165, 250, 0.1)",
};

// Mini sparkline component
function Sparkline({ data, color, width = 80, height = 28 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Circular progress ring
function ProgressRing({ value, size = 120, stroke = 8, color = COLORS.accent }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={COLORS.border}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
      />
    </svg>
  );
}

// Bar chart component
function BarChart({ data, maxVal }) {
  const max = maxVal || Math.max(...data.map((d) => d.value));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
          <div
            style={{
              width: "100%",
              maxWidth: 32,
              height: `${(d.value / max) * 80}px`,
              background: d.highlight
                ? `linear-gradient(180deg, ${COLORS.accent}, ${COLORS.accentLight})`
                : COLORS.borderLight,
              borderRadius: 4,
              minHeight: 4,
              transition: "height 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
          <span style={{ fontSize: 10, color: COLORS.textDim, marginTop: 6 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// Sidebar navigation
function Sidebar({ active, onNav, collapsed }) {
  const navItems = [
    { id: "home", icon: "⬡", label: "Início" },
    { id: "study", icon: "◈", label: "Estudar" },
    { id: "questions", icon: "◇", label: "Questões" },
    { id: "simulated", icon: "△", label: "Simulados" },
    { id: "review", icon: "↻", label: "Revisão" },
    { id: "ai", icon: "✦", label: "IA Tutor" },
    { id: "stats", icon: "◎", label: "Estatísticas" },
    { id: "community", icon: "⬢", label: "Comunidade" },
  ];

  return (
    <div
      style={{
        width: collapsed ? 72 : 240,
        minHeight: "100vh",
        background: COLORS.bgCard,
        borderRight: `1px solid ${COLORS.border}`,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? "24px 0" : "24px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 800,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          A
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, letterSpacing: "-0.02em" }}>
              AprovAdv
            </div>
            <div style={{ fontSize: 10, color: COLORS.accent, fontWeight: 600, letterSpacing: "0.08em" }}>
              .IA
            </div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "8px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: collapsed ? "12px 0" : "10px 14px",
                justifyContent: collapsed ? "center" : "flex-start",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? COLORS.text : COLORS.textMuted,
                background: isActive ? COLORS.accentGlow : "transparent",
                transition: "all 0.2s ease",
                position: "relative",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = COLORS.bgCardHover;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: collapsed ? "50%" : 0,
                    top: collapsed ? "auto" : "50%",
                    bottom: collapsed ? 0 : "auto",
                    transform: collapsed ? "translateX(-50%)" : "translateY(-50%)",
                    width: collapsed ? 20 : 3,
                    height: collapsed ? 3 : 20,
                    borderRadius: 3,
                    background: COLORS.accent,
                  }}
                />
              )}
              <span style={{ fontSize: 16, width: 20, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div
        style={{
          padding: collapsed ? "16px 8px" : "16px 14px",
          borderTop: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: `linear-gradient(135deg, #4F46E5, ${COLORS.accent})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          MF
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, whiteSpace: "nowrap" }}>
              Maria Fernanda
            </div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>Plano Pro</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat card
function StatCard({ icon, label, value, sub, trend, sparkData, color }) {
  return (
    <div
      style={{
        background: COLORS.bgCard,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "border-color 0.2s ease, transform 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = COLORS.borderLight;
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: color || COLORS.accentGlow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
          }}
        >
          {icon}
        </div>
        {sparkData && <Sparkline data={sparkData} color={COLORS.accent} />}
      </div>
      <div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: COLORS.text, letterSpacing: "-0.02em" }}>{value}</span>
          {trend && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: trend > 0 ? COLORS.green : COLORS.red,
                background: trend > 0 ? COLORS.greenBg : COLORS.redBg,
                padding: "2px 8px",
                borderRadius: 6,
              }}
            >
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </span>
          )}
        </div>
        {sub && <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// Subject progress card
function SubjectCard({ name, progress, questions, correct, icon }) {
  const accuracy = questions > 0 ? Math.round((correct / questions) * 100) : 0;
  return (
    <div
      style={{
        background: COLORS.bgCard,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = COLORS.accent;
        e.currentTarget.style.background = COLORS.bgCardHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.background = COLORS.bgCard;
      }}
    >
      <div style={{ fontSize: 22, width: 28, textAlign: "center" }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>{name}</div>
        <div style={{ height: 4, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentLight})`,
              borderRadius: 4,
              transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>{accuracy}%</div>
        <div style={{ fontSize: 10, color: COLORS.textDim }}>{questions} questões</div>
      </div>
    </div>
  );
}

// Study session card
function SessionCard({ title, subtitle, duration, type, status }) {
  const typeColors = {
    ai: { bg: "rgba(124, 92, 252, 0.1)", border: "rgba(124, 92, 252, 0.25)", text: COLORS.accent, icon: "✦" },
    review: { bg: COLORS.amberBg, border: "rgba(251, 191, 36, 0.25)", text: COLORS.amber, icon: "↻" },
    practice: { bg: COLORS.blueBg, border: "rgba(96, 165, 250, 0.25)", text: COLORS.blue, icon: "◇" },
    simulated: { bg: COLORS.greenBg, border: COLORS.greenBorder, text: COLORS.green, icon: "△" },
  };
  const c = typeColors[type] || typeColors.practice;

  return (
    <div
      style={{
        background: COLORS.bgCard,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = COLORS.borderLight;
        e.currentTarget.style.transform = "translateX(4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: c.bg,
          border: `1px solid ${c.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          color: c.text,
          flexShrink: 0,
        }}
      >
        {c.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{title}</div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{subtitle}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted }}>{duration}</div>
        {status && (
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: status === "Novo" ? COLORS.green : COLORS.amber,
              marginTop: 2,
            }}
          >
            {status}
          </div>
        )}
      </div>
    </div>
  );
}

// AI Insight card
function AIInsightCard() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${COLORS.bgCard} 0%, rgba(124, 92, 252, 0.06) 100%)`,
        border: `1px solid ${COLORS.accent}33`,
        borderRadius: 14,
        padding: "22px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow effect */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.accentGlowStrong}, transparent)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, position: "relative" }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "#fff",
          }}
        >
          ✦
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>Insight da IA</div>
          <div style={{ fontSize: 10, color: COLORS.textMuted }}>Atualizado agora</div>
        </div>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: COLORS.textMuted, margin: 0, position: "relative" }}>
        Sua taxa de acerto em <strong style={{ color: COLORS.text }}>Direito Constitucional</strong> caiu 12% esta semana. 
        Recomendo focar em{" "}
        <strong style={{ color: COLORS.accent }}>Controle de Constitucionalidade</strong> e{" "}
        <strong style={{ color: COLORS.accent }}>Direitos Fundamentais</strong>.
      </p>
      {expanded && (
        <div style={{ marginTop: 12, padding: "12px 14px", background: COLORS.bg, borderRadius: 10, fontSize: 12, lineHeight: 1.7, color: COLORS.textMuted }}>
          📊 Nos últimos 7 dias, você errou 8 de 15 questões sobre Controle de Constitucionalidade. 
          O padrão sugere confusão entre ADI e ADPF. Criei um plano de revisão personalizado com 20 questões focadas.
        </div>
      )}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          marginTop: 14,
          padding: "8px 16px",
          borderRadius: 8,
          border: `1px solid ${COLORS.accent}44`,
          background: COLORS.accentGlow,
          color: COLORS.accent,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.2s ease",
        }}
      >
        {expanded ? "Fechar" : "Ver plano de ação →"}
      </button>
    </div>
  );
}

// Activity heatmap (simplified)
function ActivityHeatmap() {
  const weeks = 12;
  const days = 7;
  const data = Array.from({ length: weeks * days }, () => Math.random());
  const dayLabels = ["", "Seg", "", "Qua", "", "Sex", ""];

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, paddingTop: 0 }}>
        {dayLabels.map((d, i) => (
          <div key={i} style={{ fontSize: 9, color: COLORS.textDim, height: 12, lineHeight: "12px" }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 3, flex: 1 }}>
        {Array.from({ length: weeks }, (_, w) => (
          <div key={w} style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
            {Array.from({ length: days }, (_, d) => {
              const val = data[w * days + d];
              let bg = COLORS.border;
              if (val > 0.2) bg = `${COLORS.accent}33`;
              if (val > 0.4) bg = `${COLORS.accent}66`;
              if (val > 0.6) bg = `${COLORS.accent}99`;
              if (val > 0.8) bg = COLORS.accent;
              return (
                <div
                  key={d}
                  style={{
                    height: 12,
                    borderRadius: 3,
                    background: bg,
                    transition: "background 0.3s ease",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Streak & daily goal
function DailyGoal({ current, target }) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ position: "relative", width: 80, height: 80 }}>
        <ProgressRing value={pct} size={80} stroke={6} color={pct >= 100 ? COLORS.green : COLORS.accent} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 800, color: COLORS.text }}>{current}</span>
          <span style={{ fontSize: 9, color: COLORS.textDim }}>/ {target}</span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>Meta Diária</div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
          {current >= target ? "🎯 Meta alcançada!" : `Faltam ${target - current} questões`}
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <div
              key={d}
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                background: d <= 5 ? COLORS.accent : COLORS.border,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 8,
                color: d <= 5 ? "#fff" : COLORS.textDim,
                fontWeight: 700,
              }}
            >
              {d <= 5 ? "✓" : d === 6 ? "H" : "D"}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: COLORS.accent, fontWeight: 600, marginTop: 4 }}>
          🔥 5 dias seguidos
        </div>
      </div>
    </div>
  );
}

// Leaderboard mini
function LeaderboardMini() {
  const users = [
    { name: "Você", score: 1847, pos: 3, highlight: true },
    { name: "Lucas A.", score: 2103, pos: 1 },
    { name: "Ana P.", score: 1952, pos: 2 },
    { name: "João R.", score: 1790, pos: 4 },
    { name: "Carla M.", score: 1685, pos: 5 },
  ];
  const sorted = [...users].sort((a, b) => a.pos - b.pos);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {sorted.map((u) => (
        <div
          key={u.pos}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            borderRadius: 8,
            background: u.highlight ? COLORS.accentGlow : "transparent",
            border: u.highlight ? `1px solid ${COLORS.accent}33` : "1px solid transparent",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: u.pos <= 3 ? [COLORS.amber, "#C0C0C0", "#CD7F32"][u.pos - 1] : COLORS.textDim,
              width: 18,
            }}
          >
            {u.pos}º
          </span>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: u.highlight
                ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})`
                : COLORS.borderLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {u.name[0]}
          </div>
          <span style={{ flex: 1, fontSize: 12, fontWeight: u.highlight ? 600 : 400, color: u.highlight ? COLORS.text : COLORS.textMuted }}>
            {u.name}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textDim }}>{u.score.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// Main Dashboard
export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subjects = [
    { name: "Direito Constitucional", progress: 72, questions: 340, correct: 238, icon: "⚖" },
    { name: "Direito Civil", progress: 58, questions: 280, correct: 196, icon: "📜" },
    { name: "Direito Penal", progress: 45, questions: 195, correct: 127, icon: "🔒" },
    { name: "Direito Processual Civil", progress: 63, questions: 220, correct: 159, icon: "📋" },
    { name: "Direito do Trabalho", progress: 38, questions: 150, correct: 99, icon: "👷" },
    { name: "Ética Profissional", progress: 85, questions: 120, correct: 108, icon: "⭐" },
  ];

  const weeklyData = [
    { label: "Seg", value: 45, highlight: false },
    { label: "Ter", value: 62, highlight: false },
    { label: "Qua", value: 38, highlight: false },
    { label: "Qui", value: 71, highlight: false },
    { label: "Sex", value: 55, highlight: false },
    { label: "Sáb", value: 28, highlight: false },
    { label: "Hoje", value: 34, highlight: true },
  ];

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif",
        background: COLORS.bg,
        minHeight: "100vh",
        color: COLORS.text,
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.6s ease",
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap" rel="stylesheet" />
      
      <div
        style={{
          padding: "0 32px 40px",
          maxWidth: 1200,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 0",
            borderBottom: `1px solid ${COLORS.border}`,
            marginBottom: 28,
            position: "sticky",
            top: 0,
            background: COLORS.bg,
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em" }}>
                Bom dia, Maria! ☀️
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: COLORS.textMuted }}>
                Segunda-feira, 9 de março · Faltam <strong style={{ color: COLORS.amber }}>47 dias</strong> para a prova
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                border: "none",
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})`,
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: `0 4px 20px ${COLORS.accentGlowStrong}`,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = `0 6px 24px ${COLORS.accentGlowStrong}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 4px 20px ${COLORS.accentGlowStrong}`;
              }}
            >
              ✦ Estudar com IA
            </button>
            <button
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: `1px solid ${COLORS.border}`,
                background: "transparent",
                color: COLORS.textMuted,
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "inherit",
                position: "relative",
              }}
            >
              🔔
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: COLORS.red,
                  border: `2px solid ${COLORS.bg}`,
                }}
              />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          <StatCard
            icon="📝"
            label="Questões Resolvidas"
            value="1.305"
            sub="Últimos 30 dias"
            trend={12}
            sparkData={[30, 42, 38, 55, 48, 62, 58, 71, 65, 78]}
            color={COLORS.accentGlow}
          />
          <StatCard
            icon="🎯"
            label="Taxa de Acerto"
            value="73%"
            sub="Geral"
            trend={5}
            sparkData={[65, 68, 64, 70, 72, 69, 73, 71, 75, 73]}
            color={COLORS.greenBg}
          />
          <StatCard
            icon="⏱"
            label="Horas de Estudo"
            value="142h"
            sub="Total acumulado"
            trend={8}
            sparkData={[3, 4, 3.5, 5, 4, 6, 5.5, 4, 7, 5]}
            color={COLORS.blueBg}
          />
          <StatCard
            icon="🏆"
            label="Ranking"
            value="#3"
            sub="Top 2% da turma"
            trend={15}
            sparkData={[12, 10, 8, 7, 5, 4, 3, 3, 3, 3]}
            color={COLORS.amberBg}
          />
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* AI Insight */}
            <AIInsightCard />

            {/* Subjects progress */}
            <div
              style={{
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 14,
                padding: "22px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Progresso por Matéria</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: COLORS.textMuted }}>
                    Clique em uma matéria para ver detalhes
                  </p>
                </div>
                <button
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: `1px solid ${COLORS.border}`,
                    background: "transparent",
                    color: COLORS.textMuted,
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Ver todas →
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {subjects.map((s) => (
                  <SubjectCard key={s.name} {...s} />
                ))}
              </div>
            </div>

            {/* Weekly performance */}
            <div
              style={{
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 14,
                padding: "22px",
              }}
            >
              <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>Desempenho Semanal</h3>
              <p style={{ margin: "0 0 16px", fontSize: 11, color: COLORS.textMuted }}>Questões resolvidas por dia</p>
              <BarChart data={weeklyData} />
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Daily goal + streak */}
            <div
              style={{
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 14,
                padding: "22px",
              }}
            >
              <DailyGoal current={34} target={50} />
            </div>

            {/* Next sessions */}
            <div
              style={{
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 14,
                padding: "22px",
              }}
            >
              <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Próximas Sessões</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <SessionCard
                  title="Revisão Inteligente"
                  subtitle="32 cards para revisar"
                  duration="~25 min"
                  type="review"
                  status="Prioritário"
                />
                <SessionCard
                  title="Questões — Dir. Constitucional"
                  subtitle="Foco: Controle de Constitucionalidade"
                  duration="~40 min"
                  type="practice"
                  status="Novo"
                />
                <SessionCard
                  title="Simulado OAB — Ética"
                  subtitle="20 questões • Tempo limitado"
                  duration="1h"
                  type="simulated"
                />
                <SessionCard
                  title="Tutoria IA — Dir. Penal"
                  subtitle="Crimes contra a pessoa"
                  duration="~30 min"
                  type="ai"
                  status="Novo"
                />
              </div>
            </div>

            {/* Activity heatmap */}
            <div
              style={{
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 14,
                padding: "22px",
              }}
            >
              <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>Frequência de Estudo</h3>
              <p style={{ margin: "0 0 14px", fontSize: 11, color: COLORS.textMuted }}>Últimos 3 meses</p>
              <ActivityHeatmap />
            </div>

            {/* Leaderboard */}
            <div
              style={{
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 14,
                padding: "22px",
              }}
            >
              <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Ranking da Turma</h3>
              <LeaderboardMini />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
