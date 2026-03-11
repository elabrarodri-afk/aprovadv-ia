import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { T } from "./theme";
import { listarUsuarios } from "./supabase";

// ─── Credenciais do admin ─────────────────────────────────
const ADMIN_LOGIN = "elabra";
const ADMIN_PASSWORD = "elabra292";

// ─── Dados mockados ───────────────────────────────────────
const MOCK_USERS = [
  { id: 1, name: "Maria Fernanda", email: "maria@email.com", plano: "Pro", status: "ativo", ultimo_acesso: "Hoje, 14h32", questoes: 312, acerto: "74%" },
  { id: 2, name: "Carlos Eduardo", email: "carlos@email.com", plano: "Free", status: "ativo", ultimo_acesso: "Ontem, 09h15", questoes: 88, acerto: "61%" },
  { id: 3, name: "Ana Luiza", email: "ana@email.com", plano: "Pro", status: "ativo", ultimo_acesso: "Hoje, 11h00", questoes: 541, acerto: "81%" },
  { id: 4, name: "Pedro Henrique", email: "pedro@email.com", plano: "Free", status: "inativo", ultimo_acesso: "Há 7 dias", questoes: 23, acerto: "52%" },
  { id: 5, name: "Juliana Costa", email: "juliana@email.com", plano: "Pro", status: "ativo", ultimo_acesso: "Hoje, 16h45", questoes: 890, acerto: "88%" },
  { id: 6, name: "Rafael Souza", email: "rafael@email.com", plano: "Free", status: "ativo", ultimo_acesso: "Há 2 dias", questoes: 134, acerto: "66%" },
];

const MOCK_QUESTOES = [
  { id: 1, materia: "Direito Constitucional", banca: "FGV", ano: 2024, dificuldade: "Médio", enunciado: "Sobre o princípio da legalidade, é correto afirmar que...", ativo: true },
  { id: 2, materia: "Direito Civil", banca: "CESPE", ano: 2023, dificuldade: "Difícil", enunciado: "Em relação à capacidade civil, analise as assertivas...", ativo: true },
  { id: 3, materia: "Direito Penal", banca: "FGV", ano: 2024, dificuldade: "Fácil", enunciado: "O crime de peculato está previsto no art. 312 do CP...", ativo: true },
  { id: 4, materia: "Ética Profissional", banca: "OAB", ano: 2023, dificuldade: "Médio", enunciado: "Sobre o sigilo profissional do advogado...", ativo: false },
  { id: 5, materia: "Direito do Trabalho", banca: "FCC", ano: 2022, dificuldade: "Difícil", enunciado: "Quanto às modalidades de contrato de trabalho...", ativo: true },
];

const MOCK_FLASHCARDS = [
  { id: 1, materia: "Direito Civil", frente: "O que é capacidade relativa?", verso: "É a capacidade de praticar determinados atos apenas com assistência.", ativo: true },
  { id: 2, materia: "Direito Penal", frente: "Defina dolo eventual.", verso: "Ocorre quando o agente assume o risco de produzir o resultado.", ativo: true },
  { id: 3, materia: "Direito Constitucional", frente: "Quais são os remédios constitucionais?", verso: "HC, HD, MS, MI, AP — previstos no art. 5º da CF/88.", ativo: true },
  { id: 4, materia: "Ética Profissional", frente: "Quando é possível revelar o sigilo profissional?", verso: "Para evitar a prática de crime inafiançável ou sua continuação.", ativo: false },
];

const MOCK_CONFIG = {
  nome_plataforma: "AprovAdv.IA",
  email_suporte: "suporte@aprovadv.com",
  max_questoes_free: 50,
  max_simulados_free: 2,
  api_key_visivel: "sk-ant-...●●●●●●●●",
  modo_manutencao: false,
  registro_aberto: true,
};

// ─── Componentes auxiliares ───────────────────────────────
function Badge({ children, color = T.accent }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      background: color + "22", color: color, border: `1px solid ${color}44`,
    }}>
      {children}
    </span>
  );
}

function StatCard({ icon, label, value, sub, color = T.accent }) {
  return (
    <div style={{
      background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14,
      padding: "20px 24px", display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: color + "18", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 22, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: T.text }}>{value}</div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: color, marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Aba: Usuários ────────────────────────────────────────
function TabUsuarios() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    listarUsuarios()
      .then(data => setTodosUsuarios(data || []))
      .catch(() => setTodosUsuarios(MOCK_USERS))
      .finally(() => setCarregando(false));
  }, []);

  const usuarios = todosUsuarios.filter(u =>
    ((u.nome || u.name || "").toLowerCase().includes(busca.toLowerCase()) ||
     (u.email || "").toLowerCase().includes(busca.toLowerCase())) &&
    (filtro === "todos" ||
     (filtro === "pro" && (u.plano || "").toLowerCase() === "pro") ||
     (filtro === "free" && (u.plano || "").toLowerCase() === "free") ||
     (filtro === "inativo" && u.status === "inativo"))
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome ou email..."
          style={{
            flex: 1, minWidth: 200, background: T.bgSurface, border: `1px solid ${T.border}`,
            borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 13,
            outline: "none",
          }}
        />
        {["todos", "pro", "free", "inativo"].map(f => (
          <button key={f} onClick={() => setFiltro(f)} style={{
            padding: "10px 16px", borderRadius: 10, border: `1px solid ${filtro === f ? T.accent : T.border}`,
            background: filtro === f ? T.accentGlow : T.bgSurface, color: filtro === f ? T.accent : T.textMuted,
            cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
            textTransform: "capitalize",
          }}>{f}</button>
        ))}
      </div>

      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {["Usuário", "Plano", "Status", "Último Acesso", "Questões", "Acerto"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: T.textMuted, fontSize: 13 }}>Carregando usuários...</td></tr>
            ) : usuarios.map((u, i) => {
              const nome = u.nome || u.name || "—";
              const iniciais = nome.split(" ").map(n => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
              const plano = u.plano || "free";
              const totalQuestoes = u.questoes_historico?.[0]?.count ?? u.questoes ?? 0;
              const ultimoAcesso = u.ultimo_acesso
                ? new Date(u.ultimo_acesso).toLocaleDateString("pt-BR")
                : u.criado_em
                  ? new Date(u.criado_em).toLocaleDateString("pt-BR")
                  : "—";
              return (
              <tr key={u.id} style={{ borderBottom: i < usuarios.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
                    }}>{iniciais}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{nome}</div>
                      <div style={{ fontSize: 11, color: T.textMuted }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <Badge color={plano === "pro" ? T.accent : T.textMuted}>{plano.toUpperCase()}</Badge>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <Badge color={T.green}>ativo</Badge>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 12, color: T.textMuted }}>{ultimoAcesso}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: T.text, fontWeight: 600 }}>{totalQuestoes}</td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: T.green, fontWeight: 700 }}>—</td>
              </tr>
            );})}
          </tbody>
        </table>
        {!carregando && usuarios.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: T.textMuted, fontSize: 13 }}>Nenhum usuário encontrado.</div>
        )}
      </div>
    </div>
  );
}

// ─── Aba: Questões & Flashcards ───────────────────────────
function TabConteudo() {
  const [modo, setModo] = useState("questoes");
  const [questoes, setQuestoes] = useState(MOCK_QUESTOES);
  const [flashcards, setFlashcards] = useState(MOCK_FLASHCARDS);
  const [modal, setModal] = useState(null); // null | 'add_q' | 'add_f'
  const [novaQ, setNovaQ] = useState({ materia: "", banca: "", ano: new Date().getFullYear(), dificuldade: "Médio", enunciado: "" });
  const [novoF, setNovoF] = useState({ materia: "", frente: "", verso: "" });

  const toggleQuestao = (id) => setQuestoes(q => q.map(x => x.id === id ? { ...x, ativo: !x.ativo } : x));
  const removerQuestao = (id) => setQuestoes(q => q.filter(x => x.id !== id));
  const toggleFlashcard = (id) => setFlashcards(f => f.map(x => x.id === id ? { ...x, ativo: !x.ativo } : x));
  const removerFlashcard = (id) => setFlashcards(f => f.filter(x => x.id !== id));

  const salvarQuestao = () => {
    if (!novaQ.materia || !novaQ.enunciado) return;
    setQuestoes(q => [...q, { ...novaQ, id: Date.now(), ativo: true }]);
    setModal(null);
    setNovaQ({ materia: "", banca: "", ano: new Date().getFullYear(), dificuldade: "Médio", enunciado: "" });
  };

  const salvarFlashcard = () => {
    if (!novoF.materia || !novoF.frente || !novoF.verso) return;
    setFlashcards(f => [...f, { ...novoF, id: Date.now(), ativo: true }]);
    setModal(null);
    setNovoF({ materia: "", frente: "", verso: "" });
  };

  const inputStyle = {
    width: "100%", background: T.bgSurface, border: `1px solid ${T.border}`,
    borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 13,
    outline: "none", fontFamily: "inherit",
  };

  return (
    <div>
      {/* Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["questoes", "flashcards"].map(m => (
          <button key={m} onClick={() => setModo(m)} style={{
            padding: "10px 20px", borderRadius: 10, fontFamily: "inherit",
            border: `1px solid ${modo === m ? T.accent : T.border}`,
            background: modo === m ? T.accentGlow : T.bgSurface,
            color: modo === m ? T.accent : T.textMuted,
            cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "capitalize",
          }}>{m === "questoes" ? "Questões" : "Flashcards"}</button>
        ))}
        <button onClick={() => setModal(modo === "questoes" ? "add_q" : "add_f")} style={{
          marginLeft: "auto", padding: "10px 20px", borderRadius: 10, fontFamily: "inherit",
          background: T.accent, border: "none", color: "#fff",
          cursor: "pointer", fontSize: 13, fontWeight: 600,
        }}>+ Adicionar</button>
      </div>

      {/* Lista questões */}
      {modo === "questoes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {questoes.map(q => (
            <div key={q.id} style={{
              background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12,
              padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14,
              opacity: q.ativo ? 1 : 0.5,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <Badge color={T.accent}>{q.materia}</Badge>
                  <Badge color={T.textMuted}>{q.banca}</Badge>
                  <Badge color={T.textMuted}>{q.ano}</Badge>
                  <Badge color={q.dificuldade === "Fácil" ? T.green : q.dificuldade === "Difícil" ? T.red : T.amber}>{q.dificuldade}</Badge>
                </div>
                <p style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{q.enunciado}</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => toggleQuestao(q.id)} style={{
                  padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
                  background: "transparent", color: q.ativo ? T.amber : T.green,
                  cursor: "pointer", fontSize: 12, fontFamily: "inherit",
                }}>{q.ativo ? "Desativar" : "Ativar"}</button>
                <button onClick={() => removerQuestao(q.id)} style={{
                  padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.redBorder}`,
                  background: "transparent", color: T.red,
                  cursor: "pointer", fontSize: 12, fontFamily: "inherit",
                }}>Remover</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista flashcards */}
      {modo === "flashcards" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {flashcards.map(f => (
            <div key={f.id} style={{
              background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12,
              padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14,
              opacity: f.ativo ? 1 : 0.5,
            }}>
              <div style={{ flex: 1 }}>
                <Badge color={T.accent} style={{ marginBottom: 8 }}>{f.materia}</Badge>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>FRENTE</div>
                  <p style={{ fontSize: 13, color: T.text }}>{f.frente}</p>
                </div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>VERSO</div>
                  <p style={{ fontSize: 13, color: T.textMuted }}>{f.verso}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => toggleFlashcard(f.id)} style={{
                  padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
                  background: "transparent", color: f.ativo ? T.amber : T.green,
                  cursor: "pointer", fontSize: 12, fontFamily: "inherit",
                }}>{f.ativo ? "Desativar" : "Ativar"}</button>
                <button onClick={() => removerFlashcard(f.id)} style={{
                  padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.redBorder}`,
                  background: "transparent", color: T.red,
                  cursor: "pointer", fontSize: 12, fontFamily: "inherit",
                }}>Remover</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal adicionar questão */}
      {modal === "add_q" && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
        }} onClick={() => setModal(null)}>
          <div style={{
            background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 18,
            padding: 32, width: "100%", maxWidth: 560,
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: T.text, marginBottom: 24, fontSize: 17, fontWeight: 700 }}>Nova Questão</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input style={inputStyle} placeholder="Matéria" value={novaQ.materia} onChange={e => setNovaQ(v => ({ ...v, materia: e.target.value }))} />
                <input style={inputStyle} placeholder="Banca" value={novaQ.banca} onChange={e => setNovaQ(v => ({ ...v, banca: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input style={inputStyle} type="number" placeholder="Ano" value={novaQ.ano} onChange={e => setNovaQ(v => ({ ...v, ano: e.target.value }))} />
                <select style={inputStyle} value={novaQ.dificuldade} onChange={e => setNovaQ(v => ({ ...v, dificuldade: e.target.value }))}>
                  <option>Fácil</option><option>Médio</option><option>Difícil</option>
                </select>
              </div>
              <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} placeholder="Enunciado da questão..." value={novaQ.enunciado} onChange={e => setNovaQ(v => ({ ...v, enunciado: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button onClick={() => setModal(null)} style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
              <button onClick={salvarQuestao} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: T.accent, color: "#fff", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal adicionar flashcard */}
      {modal === "add_f" && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
        }} onClick={() => setModal(null)}>
          <div style={{
            background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 18,
            padding: 32, width: "100%", maxWidth: 520,
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: T.text, marginBottom: 24, fontSize: 17, fontWeight: 700 }}>Novo Flashcard</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input style={inputStyle} placeholder="Matéria" value={novoF.materia} onChange={e => setNovoF(v => ({ ...v, materia: e.target.value }))} />
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} placeholder="Frente (pergunta)..." value={novoF.frente} onChange={e => setNovoF(v => ({ ...v, frente: e.target.value }))} />
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} placeholder="Verso (resposta)..." value={novoF.verso} onChange={e => setNovoF(v => ({ ...v, verso: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button onClick={() => setModal(null)} style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
              <button onClick={salvarFlashcard} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: T.accent, color: "#fff", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Aba: Estatísticas ────────────────────────────────────
function TabEstatisticas() {
  const stats = [
    { icon: "👥", label: "Usuários cadastrados", value: "6", sub: "+2 esta semana", color: T.accent },
    { icon: "📋", label: "Questões respondidas", value: "1.988", sub: "+340 hoje", color: T.blue },
    { icon: "🎯", label: "Taxa de acerto geral", value: "70%", sub: "↑ 3% vs semana anterior", color: T.green },
    { icon: "⭐", label: "Usuários Pro", value: "3", sub: "50% do total", color: T.amber },
  ];

  const materias = [
    { nome: "Direito Civil", questoes: 480, acerto: 72 },
    { nome: "Direito Constitucional", questoes: 390, acerto: 68 },
    { nome: "Direito Penal", questoes: 310, acerto: 65 },
    { nome: "Ética Profissional", questoes: 290, acerto: 80 },
    { nome: "Direito do Trabalho", questoes: 218, acerto: 61 },
    { nome: "Direito Administrativo", questoes: 180, acerto: 74 },
    { nome: "Direito Tributário", questoes: 120, acerto: 58 },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
        <h3 style={{ color: T.text, fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Desempenho por Matéria</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {materias.map((m, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: T.text }}>{m.nome}</span>
                <div style={{ display: "flex", gap: 16 }}>
                  <span style={{ fontSize: 12, color: T.textMuted }}>{m.questoes} questões</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: m.acerto >= 70 ? T.green : m.acerto >= 60 ? T.amber : T.red, minWidth: 36, textAlign: "right" }}>{m.acerto}%</span>
                </div>
              </div>
              <div style={{ height: 6, background: T.bgSurface, borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  width: `${m.acerto}%`,
                  background: m.acerto >= 70 ? T.green : m.acerto >= 60 ? T.amber : T.red,
                  transition: "width 0.8s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Aba: Configurações ───────────────────────────────────
function TabConfiguracoes() {
  const [cfg, setCfg] = useState(MOCK_CONFIG);
  const [salvo, setSalvo] = useState(false);

  const salvar = () => {
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  };

  const inputStyle = {
    width: "100%", background: T.bgSurface, border: `1px solid ${T.border}`,
    borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 13,
    outline: "none", fontFamily: "inherit",
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

        <div>
          <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600 }}>NOME DA PLATAFORMA</label>
          <input style={inputStyle} value={cfg.nome_plataforma} onChange={e => setCfg(v => ({ ...v, nome_plataforma: e.target.value }))} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600 }}>EMAIL DE SUPORTE</label>
          <input style={inputStyle} value={cfg.email_suporte} onChange={e => setCfg(v => ({ ...v, email_suporte: e.target.value }))} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600 }}>QUESTÕES MÁX. (FREE)</label>
            <input style={inputStyle} type="number" value={cfg.max_questoes_free} onChange={e => setCfg(v => ({ ...v, max_questoes_free: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600 }}>SIMULADOS MÁX. (FREE)</label>
            <input style={inputStyle} type="number" value={cfg.max_simulados_free} onChange={e => setCfg(v => ({ ...v, max_simulados_free: e.target.value }))} />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600 }}>CHAVE DE API (Claude)</label>
          <input style={{ ...inputStyle, color: T.textMuted, fontFamily: "monospace" }} value={cfg.api_key_visivel} readOnly />
          <p style={{ fontSize: 11, color: T.textDim, marginTop: 5 }}>Para alterar a chave, edite diretamente no arquivo de configuração.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { key: "modo_manutencao", label: "Modo Manutenção", desc: "Bloqueia acesso de usuários comuns ao app", color: T.red },
            { key: "registro_aberto", label: "Registro Aberto", desc: "Permite que novos usuários se cadastrem", color: T.green },
          ].map(({ key, label, desc, color }) => (
            <div key={key} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px", background: T.bgSurface, borderRadius: 12,
              border: `1px solid ${T.border}`,
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{label}</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{desc}</div>
              </div>
              <div
                onClick={() => setCfg(v => ({ ...v, [key]: !v[key] }))}
                style={{
                  width: 46, height: 26, borderRadius: 13, cursor: "pointer",
                  background: cfg[key] ? color : T.border,
                  position: "relative", transition: "background 0.2s",
                  flexShrink: 0,
                }}>
                <div style={{
                  position: "absolute", top: 3,
                  left: cfg[key] ? 23 : 3,
                  width: 20, height: 20, borderRadius: "50%",
                  background: "#fff", transition: "left 0.2s",
                }} />
              </div>
            </div>
          ))}
        </div>

        <button onClick={salvar} style={{
          padding: "12px 28px", borderRadius: 12, border: "none",
          background: salvo ? T.green : T.accent, color: "#fff",
          cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit",
          transition: "background 0.3s", alignSelf: "flex-start",
        }}>
          {salvo ? "✓ Salvo!" : "Salvar Configurações"}
        </button>
      </div>
    </div>
  );
}

// ─── Tela de Login ADM ────────────────────────────────────
function LoginAdmin({ onLogin }) {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);
  const [loading, setLoading] = useState(false);

  const tentar = () => {
    if (!login || !senha) return;
    setLoading(true);
    setTimeout(() => {
      if (login === ADMIN_LOGIN && senha === ADMIN_PASSWORD) {
        sessionStorage.setItem("admin_auth", "true");
        onLogin();
      } else {
        setErro(true);
        setSenha("");
      }
      setLoading(false);
    }, 600);
  };

  const inputStyle = (hasError) => ({
    width: "100%", background: T.bgSurface,
    border: `1px solid ${hasError ? T.red : T.border}`,
    borderRadius: 12, padding: "13px 16px", color: T.text,
    fontSize: 14, outline: "none", fontFamily: "inherit",
    marginBottom: 12, transition: "border-color 0.2s",
    boxSizing: "border-box",
  });

  return (
    <div style={{
      minHeight: "100vh", background: T.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20,
        padding: 48, width: "100%", maxWidth: 400, textAlign: "center",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, margin: "0 auto 20px",
          overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <img src="/logo.aprovadv.jpg" alt="AprovAdv" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <h2 style={{ color: T.text, fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Painel Administrativo</h2>
        <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 28 }}>Acesso restrito. Insira suas credenciais.</p>

        <input
          type="text"
          value={login}
          onChange={e => { setLogin(e.target.value); setErro(false); }}
          onKeyDown={e => e.key === "Enter" && tentar()}
          placeholder="Login"
          autoFocus
          style={inputStyle(erro)}
        />
        <input
          type="password"
          value={senha}
          onChange={e => { setSenha(e.target.value); setErro(false); }}
          onKeyDown={e => e.key === "Enter" && tentar()}
          placeholder="Senha"
          style={{ ...inputStyle(erro), marginBottom: 8 }}
        />
        {erro && <p style={{ color: T.red, fontSize: 12, marginBottom: 12 }}>Login ou senha incorretos.</p>}

        <button
          onClick={tentar}
          disabled={loading || !login || !senha}
          style={{
            width: "100%", padding: "13px", borderRadius: 12, border: "none",
            background: loading || !login || !senha ? T.bgSurface : T.accent,
            color: loading || !login || !senha ? T.textMuted : "#fff",
            cursor: loading || !login || !senha ? "not-allowed" : "pointer",
            fontSize: 14, fontWeight: 700, fontFamily: "inherit",
            marginTop: 4, transition: "all 0.2s",
          }}
        >
          {loading ? "Verificando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}

// ─── Painel ADM principal ─────────────────────────────────
export default function Admin() {
  const navigate = useNavigate();
  const [autenticado, setAutenticado] = useState(false);
  const [aba, setAba] = useState("usuarios");

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === "true") {
      setAutenticado(true);
    }
  }, []);

  const sair = () => {
    sessionStorage.removeItem("admin_auth");
    navigate("/");
  };

  if (!autenticado) {
    return <LoginAdmin onLogin={() => setAutenticado(true)} />;
  }

  const abas = [
    { id: "usuarios", label: "Usuários", icon: "👥" },
    { id: "conteudo", label: "Questões & Flashcards", icon: "📚" },
    { id: "estatisticas", label: "Estatísticas", icon: "📊" },
    { id: "configuracoes", label: "Configurações", icon: "⚙️" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{
        background: T.bgCard, borderBottom: `1px solid ${T.border}`,
        padding: "0 32px", display: "flex", alignItems: "center", height: 60,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img src="/logo.aprovadv.jpg" alt="AprovAdv" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>AprovAdv</span>
            <span style={{ fontSize: 11, color: T.accent, fontWeight: 700, marginLeft: 4 }}>ADM</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, marginLeft: 40 }}>
          {abas.map(a => (
            <button key={a.id} onClick={() => setAba(a.id)} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 16px", borderRadius: 10, border: "none",
              background: aba === a.id ? T.accentGlow : "transparent",
              color: aba === a.id ? T.accent : T.textMuted,
              cursor: "pointer", fontSize: 13, fontWeight: aba === a.id ? 600 : 400,
              fontFamily: "inherit", transition: "all 0.2s",
            }}>
              <span>{a.icon}</span> {a.label}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 12, color: T.textMuted }}>Modo Administrador</div>
          <button onClick={() => navigate("/")} style={{
            padding: "7px 14px", borderRadius: 9, border: `1px solid ${T.border}`,
            background: "transparent", color: T.textMuted, cursor: "pointer",
            fontSize: 12, fontFamily: "inherit",
          }}>← App</button>
          <button onClick={sair} style={{
            padding: "7px 14px", borderRadius: 9, border: `1px solid ${T.redBorder}`,
            background: "transparent", color: T.red, cursor: "pointer",
            fontSize: 12, fontFamily: "inherit",
          }}>Sair</button>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ padding: "32px", maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: T.text, fontSize: 22, fontWeight: 800, marginBottom: 24 }}>
          {abas.find(a => a.id === aba)?.icon} {abas.find(a => a.id === aba)?.label}
        </h1>
        {aba === "usuarios" && <TabUsuarios />}
        {aba === "conteudo" && <TabConteudo />}
        {aba === "estatisticas" && <TabEstatisticas />}
        {aba === "configuracoes" && <TabConfiguracoes />}
      </div>
    </div>
  );
}
