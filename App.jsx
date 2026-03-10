import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { T } from "./theme";

// Page imports
import LandingPage from "./pages/Landing";
import DashboardPage from "./pages/Dashboard";
import QuestoesPage from "./pages/Questoes";
import SimuladoPage from "./pages/Simulado";
import FlashcardsPage from "./pages/Flashcards";
import TutorPage from "./pages/Tutor";
import CronogramaPage from "./pages/Cronograma";

// ─── Sidebar ─────────────────────────────────────────────
function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/app", icon: "⬡", label: "Início" },
    { path: "/app/questoes", icon: "◇", label: "Questões" },
    { path: "/app/simulado", icon: "△", label: "Simulados" },
    { path: "/app/flashcards", icon: "↻", label: "Revisão" },
    { path: "/app/tutor", icon: "✦", label: "IA Tutor" },
    { path: "/app/cronograma", icon: "📅", label: "Cronograma" },
  ];

  return (
    <div style={{
      width: collapsed ? 72 : 230,
      minHeight: "100vh",
      background: T.bgCard,
      borderRight: `1px solid ${T.border}`,
      display: "flex",
      flexDirection: "column",
      transition: "width 0.3s ease",
      position: "fixed",
      left: 0, top: 0, bottom: 0,
      zIndex: 100,
      overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? "20px 0" : "20px 18px",
        display: "flex", alignItems: "center", gap: 10,
        justifyContent: collapsed ? "center" : "flex-start",
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 900, color: "#fff", flexShrink: 0,
          cursor: "pointer",
        }} onClick={() => setCollapsed(!collapsed)}>
          A
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>AprovAdv</div>
            <div style={{ fontSize: 9, color: T.accent, fontWeight: 600, letterSpacing: "0.08em" }}>.IA</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: collapsed ? "11px 0" : "10px 14px",
                justifyContent: collapsed ? "center" : "flex-start",
                border: "none", borderRadius: 10, cursor: "pointer",
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                color: isActive ? T.text : T.textMuted,
                background: isActive ? T.accentGlow : "transparent",
                fontFamily: "inherit", transition: "all 0.2s ease",
                position: "relative",
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = T.bgHover; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = isActive ? T.accentGlow : "transparent"; }}>
              {isActive && (
                <div style={{
                  position: "absolute", left: collapsed ? "50%" : 0,
                  top: collapsed ? "auto" : "50%",
                  bottom: collapsed ? 0 : "auto",
                  transform: collapsed ? "translateX(-50%)" : "translateY(-50%)",
                  width: collapsed ? 18 : 3, height: collapsed ? 3 : 18,
                  borderRadius: 3, background: T.accent,
                }} />
              )}
              <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div style={{
        padding: collapsed ? "14px 8px" : "14px",
        borderTop: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: 10,
        justifyContent: collapsed ? "center" : "flex-start",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: `linear-gradient(135deg, #4F46E5, ${T.accent})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
        }}>MF</div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>Maria Fernanda</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>Plano Pro</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── App Layout ──────────────────────────────────────────
function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{
        marginLeft: collapsed ? 72 : 230,
        flex: 1,
        transition: "margin-left 0.3s ease",
        minHeight: "100vh",
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────
export default function App() {
  const location = useLocation();
  const isLanding = location.pathname === "/" || location.pathname === "";
  const isApp = location.pathname.startsWith("/app");

  return (
    <>
      <Routes>
        {/* Landing page - no sidebar */}
        <Route path="/" element={<LandingPage />} />

        {/* App pages - with sidebar */}
        <Route path="/app" element={<AppLayout><DashboardPage /></AppLayout>} />
        <Route path="/app/questoes" element={<AppLayout><QuestoesPage /></AppLayout>} />
        <Route path="/app/simulado" element={<AppLayout><SimuladoPage /></AppLayout>} />
        <Route path="/app/flashcards" element={<AppLayout><FlashcardsPage /></AppLayout>} />
        <Route path="/app/tutor" element={<AppLayout><TutorPage /></AppLayout>} />
        <Route path="/app/cronograma" element={<AppLayout><CronogramaPage /></AppLayout>} />

        {/* Fallback */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </>
  );
}
