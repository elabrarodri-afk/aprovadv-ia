import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─── Scroll-triggered visibility hook ────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Section({ children, delay = 0 }) {
  const [ref, visible] = useInView(0.1);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(40px)",
      transition: `opacity 0.8s cubic-bezier(0.4,0,0.2,1) ${delay}s, transform 0.8s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
    }}>{children}</div>
  );
}

// ─── DATA ────────────────────────────────────────────────
const FEATURES = [
  { icon: "◇", title: "Banco de Questões com IA", desc: "Questões geradas por IA no estilo FGV, CESPE e mais. Correção detalhada de cada alternativa com fundamentação legal.", color: "#D72638" },
  { icon: "△", title: "Simulados 1ª e 2ª Fase", desc: "Prova completa com timer, gabarito e correção por IA. Inclui peça prático-profissional com análise de estrutura.", color: "#22D3EE" },
  { icon: "↻", title: "Flashcards Inteligentes", desc: "Repetição espaçada com algoritmo SM-2. Cards gerados por IA com macetes, fundamentação e explicação sob demanda.", color: "#34D399" },
  { icon: "✦", title: "IA Tutor 24h", desc: "Professor particular de Direito disponível a qualquer hora. 6 modos: explicação, caso prático, quiz, debate, mapa mental.", color: "#FBBF24" },
  { icon: "📅", title: "Cronograma Personalizado", desc: "Plano de estudos sob medida gerado por IA. Considera sua rotina, estilo de aprendizagem e matérias fracas.", color: "#F472B6" },
  { icon: "📊", title: "Dashboard de Performance", desc: "Acompanhe seu progresso em tempo real. Taxa de acerto, ranking, horas de estudo, heatmap de frequência e metas diárias.", color: "#60A5FA" },
];

const STEPS = [
  { num: "01", title: "Responda o questionário", desc: "Conte sua rotina, fase da OAB, matérias fortes e fracas, estilo de aprendizagem." },
  { num: "02", title: "Receba seu plano", desc: "A IA monta um cronograma semanal personalizado com distribuição de matérias e metas." },
  { num: "03", title: "Estude com IA", desc: "Resolva questões, faça simulados, revise com flashcards e tire dúvidas com o tutor." },
  { num: "04", title: "Seja aprovado", desc: "Acompanhe sua evolução no dashboard e chegue preparado para o dia da prova." },
];

const TESTIMONIALS = [
  { name: "Dra. Camila Souza", role: "Aprovada OAB XXXIX", text: "A correção da peça por IA foi um diferencial absurdo. Recebia feedback detalhado sobre endereçamento, fundamentação e pedidos. Na prova real, fiz exatamente como treinei.", avatar: "CS" },
  { name: "Dr. Rafael Lima", role: "Aprovado OAB XXXVIII", text: "Trabalhava 8h por dia e achava impossível estudar. O cronograma personalizado encaixou perfeitamente na minha rotina. Em 3 meses de estudo focado, passei na primeira tentativa.", avatar: "RL" },
  { name: "Ana Beatriz Mendes", role: "Aprovada OAB XL", text: "Os flashcards com repetição espaçada mudaram meu jogo. Antes eu estudava muito e esquecia tudo. Agora memorizo de verdade. Minha taxa de acerto subiu de 45% para 78%.", avatar: "AM" },
  { name: "Dr. João Pedro Costa", role: "Aprovado 1ª tentativa", text: "O simulado da 2ª fase é idêntico à prova real. A IA corrigiu minha peça com o mesmo rigor da FGV. Quando abri a prova, já sabia exatamente o que fazer.", avatar: "JC" },
];

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "49",
    period: "/mês",
    desc: "Para quem está começando",
    features: ["Banco de questões (100/mês)", "Flashcards ilimitados", "Dashboard básico", "1 simulado/mês"],
    cta: "Começar agora",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "97",
    period: "/mês",
    desc: "O mais escolhido pelos aprovados",
    features: ["Tudo do Starter +", "Questões ilimitadas", "Simulados ilimitados (1ª e 2ª fase)", "IA Tutor 24h", "Cronograma personalizado", "Correção de peça por IA", "Ranking e comunidade"],
    cta: "Assinar Pro",
    popular: true,
  },
  {
    id: "turbo",
    name: "Turbo",
    price: "147",
    period: "/mês",
    desc: "Aprovação acelerada",
    features: ["Tudo do Pro +", "Mentoria IA avançada", "Simulados personalizados", "Relatório semanal de performance", "Plano de revisão adaptativo", "Prioridade no suporte", "Acesso antecipado a novidades"],
    cta: "Quero o Turbo",
    popular: false,
  },
];

const FAQS = [
  { q: "A IA realmente corrige peças processuais?", a: "Sim. Nossa IA analisa estrutura (endereçamento, qualificação, fatos, fundamentação, pedidos, fechamento), identifica se a peça escolhida está correta, pontua cada critério e dá feedback detalhado — simulando a correção da FGV." },
  { q: "As questões são originais ou de provas anteriores?", a: "As questões são geradas pela IA no estilo e padrão das bancas (FGV, CESPE, FCC, etc.), com fundamentação legal real. São questões originais, inéditas e personalizadas para seu nível." },
  { q: "Funciona para a 2ª Fase?", a: "Sim! Temos simulado completo da 2ª Fase com 4 questões discursivas + peça prático-profissional, em todas as 7 áreas de concentração. A correção inclui nota, feedback por critério e resposta modelo." },
  { q: "Posso cancelar a qualquer momento?", a: "Sim, sem multa e sem burocracia. Você mantém o acesso até o fim do período pago. Mas os dados mostram que quem fica 3+ meses tem 3x mais chance de aprovação." },
  { q: "Quanto tempo preciso estudar por dia?", a: "O cronograma se adapta a você. Se tem 2h ou 10h por dia, a IA distribui as matérias da melhor forma possível. Consistência importa mais que quantidade." },
  { q: "A plataforma substitui um cursinho?", a: "Para muitos alunos, sim. Nossa plataforma oferece estudo direcionado, correção individualizada e feedback que cursinho presencial não consegue dar. Mas pode ser usada como complemento também." },
];

const STATS = [
  { value: "12.847", label: "Alunos ativos" },
  { value: "89%", label: "Taxa de aprovação" },
  { value: "2.3M", label: "Questões resolvidas" },
  { value: "4.9", label: "Nota no app" },
];

// ─── COMPONENT ───────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [billingAnnual, setBillingAnnual] = useState(true);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const accent = "#D72638";
  const accentLight = "#FF4F5E";

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif", background: "#0A0B0F", color: "#E8E9F0", overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0A0B0F; }
        ::selection { background: ${accent}44; color: #fff; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 30px ${accent}20; } 50% { box-shadow: 0 0 60px ${accent}35; } }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        a { color: inherit; text-decoration: none; }
        .nav-link { position: relative; }
        .nav-link::after { content:''; position:absolute; bottom:-4px; left:0; width:0; height:2px; background:${accent}; transition: width 0.3s ease; }
        .nav-link:hover::after { width:100%; }
      `}</style>

      {/* ═══ NAVBAR ═══ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: "0 40px", height: 72,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(10,11,15,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
        borderBottom: scrolled ? "1px solid rgba(30,32,48,0.6)" : "1px solid transparent",
        transition: "all 0.4s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="/logo.aprovadv.jpg" alt="AprovAdv" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>AprovAdv<span style={{ color: accent, fontSize: 12, fontWeight: 700 }}>.IA</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Funcionalidades", "Como funciona", "Depoimentos", "Planos", "FAQ"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="nav-link"
              style={{ fontSize: 13, color: "#6B7094", fontWeight: 500, cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.target.style.color = "#E8E9F0"}
              onMouseLeave={(e) => e.target.style.color = "#6B7094"}>
              {item}
            </a>
          ))}
          <button onClick={() => navigate("/cadastro")} style={{
            padding: "9px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: `linear-gradient(135deg, ${accent}, ${accentLight})`, color: "#fff",
            boxShadow: `0 4px 20px ${accent}33`, cursor: "pointer",
            transition: "transform 0.2s, box-shadow 0.2s", border: "none", fontFamily: "inherit",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 6px 28px ${accent}44`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 4px 20px ${accent}33`; }}>
            Começar grátis
          </button>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 40px 80px", overflow: "hidden" }}>
        {/* Background effects */}
        <div style={{ position: "absolute", top: "10%", left: "15%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${accent}08, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.04), transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />
        {/* Grid pattern */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(124,92,252,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,252,0.03) 1px, transparent 1px)`, backgroundSize: "60px 60px", pointerEvents: "none", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)" }} />

        <div style={{ position: "relative", textAlign: "center", maxWidth: 800, animation: "fadeUp 0.8s ease" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 20px", borderRadius: 30,
            background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.15)",
            marginBottom: 28, animation: "fadeUp 0.8s ease 0.1s both",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", animation: "pulse 2s ease infinite" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: accentLight }}>Plataforma #1 de aprovação na OAB com IA</span>
          </div>

          <h1 style={{
            fontSize: 64, fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.04em",
            marginBottom: 20, animation: "fadeUp 0.8s ease 0.2s both",
          }}>
            Passe na OAB com{" "}
            <span style={{
              background: `linear-gradient(135deg, ${accent}, #22D3EE, ${accentLight})`,
              backgroundSize: "200% 200%",
              animation: "gradientShift 4s ease infinite",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Inteligência Artificial
            </span>
          </h1>

          <p style={{
            fontSize: 18, lineHeight: 1.7, color: "#6B7094", maxWidth: 560,
            margin: "0 auto 36px", fontWeight: 400, animation: "fadeUp 0.8s ease 0.3s both",
          }}>
            Questões, simulados, flashcards e tutor — tudo gerado por IA e personalizado para o seu nível. 
            O cronograma que se adapta à sua rotina.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", animation: "fadeUp 0.8s ease 0.4s both" }}>
            <button onClick={() => navigate("/cadastro")} style={{
              padding: "16px 36px", borderRadius: 14, fontSize: 16, fontWeight: 700,
              background: `linear-gradient(135deg, ${accent}, ${accentLight})`, color: "#fff",
              boxShadow: `0 8px 40px ${accent}33`,
              cursor: "pointer", transition: "all 0.3s ease", display: "inline-flex", alignItems: "center", gap: 8,
              animation: "glow 3s ease infinite", border: "none", fontFamily: "inherit",
            }}>
              ✦ Começar grátis — 7 dias
            </button>
            <a href="#como-funciona" style={{
              padding: "16px 28px", borderRadius: 14, fontSize: 15, fontWeight: 600,
              background: "transparent", border: "1px solid #1E2030", color: "#6B7094",
              cursor: "pointer", transition: "all 0.2s ease",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
              onMouseEnter={(e) => { e.target.style.borderColor = "#2A2D42"; e.target.style.color = "#E8E9F0"; }}
              onMouseLeave={(e) => { e.target.style.borderColor = "#1E2030"; e.target.style.color = "#6B7094"; }}>
              Ver como funciona →
            </a>
          </div>

          {/* Stats bar */}
          <div style={{
            display: "flex", justifyContent: "center", gap: 48, marginTop: 60,
            animation: "fadeUp 0.8s ease 0.6s both",
          }}>
            {STATS.map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#E8E9F0", letterSpacing: "-0.02em" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#4A4E6A", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF MARQUEE ═══ */}
      <div style={{ borderTop: "1px solid #1E2030", borderBottom: "1px solid #1E2030", padding: "14px 0", overflow: "hidden", background: "rgba(18,19,26,0.5)" }}>
        <div style={{ display: "flex", gap: 48, animation: "marquee 30s linear infinite", whiteSpace: "nowrap", width: "max-content" }}>
          {[...Array(2)].flatMap((_, rep) =>
            ["Aprovação 89% dos alunos", "★★★★★ 4.9 de avaliação", "12.847 alunos ativos", "2.3M questões resolvidas", "+340 aprovados no último exame", "Correção de peça por IA", "Simulado 2ª Fase completo"].map((t, i) => (
              <span key={`${rep}-${i}`} style={{ fontSize: 13, color: "#4A4E6A", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: accent }}>◆</span> {t}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ═══ FEATURES ═══ */}
      <section id="funcionalidades" style={{ padding: "100px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <Section>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>Funcionalidades</span>
            <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 10 }}>Tudo que você precisa para passar</h2>
            <p style={{ fontSize: 16, color: "#6B7094", marginTop: 10, maxWidth: 500, margin: "10px auto 0" }}>6 ferramentas integradas, todas alimentadas por Inteligência Artificial</p>
          </div>
        </Section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <Section key={f.title} delay={i * 0.08}>
              <div style={{
                background: "#12131A", border: "1px solid #1E2030", borderRadius: 18,
                padding: "32px 28px", height: "100%",
                transition: "all 0.3s ease", cursor: "default", position: "relative", overflow: "hidden",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = f.color + "33"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${f.color}10`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1E2030"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ position: "absolute", top: -30, right: -30, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${f.color}10, transparent)`, pointerEvents: "none" }} />
                <div style={{
                  width: 48, height: 48, borderRadius: 14, marginBottom: 18,
                  background: `${f.color}12`, border: `1px solid ${f.color}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, color: f.color,
                }}>{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: "#E8E9F0" }}>{f.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "#6B7094" }}>{f.desc}</p>
              </div>
            </Section>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="como-funciona" style={{ padding: "100px 40px", background: "linear-gradient(180deg, rgba(124,92,252,0.02) 0%, transparent 100%)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Section>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>Como funciona</span>
              <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 10 }}>4 passos para a aprovação</h2>
            </div>
          </Section>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {STEPS.map((s, i) => (
              <Section key={s.num} delay={i * 0.1}>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
                    background: `${accent}10`, border: `1px solid ${accent}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 800, color: accent,
                  }}>{s.num}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: "#E8E9F0" }}>{s.title}</h3>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: "#6B7094" }}>{s.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="depoimentos" style={{ padding: "100px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <Section>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>Depoimentos</span>
            <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 10 }}>Quem usou, aprovou</h2>
          </div>
        </Section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {TESTIMONIALS.map((t, i) => (
            <Section key={t.name} delay={i * 0.08}>
              <div style={{
                background: "#12131A", border: "1px solid #1E2030", borderRadius: 18,
                padding: "28px", transition: "border-color 0.3s ease",
              }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#2A2D42"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#1E2030"}>
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {[1, 2, 3, 4, 5].map((s) => <span key={s} style={{ fontSize: 14, color: "#FBBF24" }}>★</span>)}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "#9CA0B8", marginBottom: 20, fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: `linear-gradient(135deg, ${accent}40, ${accentLight}40)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, color: "#fff",
                  }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#E8E9F0" }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "#34D399", fontWeight: 600 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            </Section>
          ))}
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="planos" style={{ padding: "100px 40px", background: "linear-gradient(180deg, transparent 0%, rgba(124,92,252,0.03) 50%, transparent 100%)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Section>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>Planos</span>
              <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 10 }}>Invista na sua aprovação</h2>
              <p style={{ fontSize: 15, color: "#6B7094", marginTop: 10 }}>7 dias grátis em qualquer plano. Cancele quando quiser.</p>

              {/* Billing toggle */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginTop: 20, padding: "4px", borderRadius: 12, background: "#12131A", border: "1px solid #1E2030" }}>
                <button onClick={() => setBillingAnnual(false)} style={{ padding: "8px 18px", borderRadius: 9, border: "none", background: !billingAnnual ? accent : "transparent", color: !billingAnnual ? "#fff" : "#6B7094", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Mensal</button>
                <button onClick={() => setBillingAnnual(true)} style={{ padding: "8px 18px", borderRadius: 9, border: "none", background: billingAnnual ? accent : "transparent", color: billingAnnual ? "#fff" : "#6B7094", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
                  Anual <span style={{ padding: "2px 6px", borderRadius: 4, background: billingAnnual ? "rgba(255,255,255,0.2)" : "rgba(52,211,153,0.15)", fontSize: 10, fontWeight: 700, color: billingAnnual ? "#fff" : "#34D399" }}>-30%</span>
                </button>
              </div>
            </div>
          </Section>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, alignItems: "stretch" }}>
            {PLANS.map((plan, i) => {
              const price = billingAnnual ? Math.round(parseInt(plan.price) * 0.7) : plan.price;
              return (
                <Section key={plan.id} delay={i * 0.1}>
                  <div style={{
                    background: "#12131A", borderRadius: 20, padding: "32px 28px",
                    border: plan.popular ? `2px solid ${accent}` : "1px solid #1E2030",
                    position: "relative", height: "100%", display: "flex", flexDirection: "column",
                    boxShadow: plan.popular ? `0 0 60px ${accent}15` : "none",
                    transition: "transform 0.3s ease",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "none"}>
                    {plan.popular && (
                      <div style={{
                        position: "absolute", top: -1, left: "50%", transform: "translate(-50%, -50%)",
                        padding: "5px 16px", borderRadius: 20,
                        background: `linear-gradient(135deg, ${accent}, ${accentLight})`,
                        fontSize: 11, fontWeight: 700, color: "#fff",
                      }}>Mais popular</div>
                    )}
                    <div style={{ marginBottom: 20 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{plan.name}</h3>
                      <p style={{ fontSize: 13, color: "#6B7094" }}>{plan.desc}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                      <span style={{ fontSize: 12, color: "#6B7094" }}>R$</span>
                      <span style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-0.03em", color: "#E8E9F0" }}>{price}</span>
                      <span style={{ fontSize: 14, color: "#4A4E6A" }}>/mês</span>
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                      {plan.features.map((f, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#9CA0B8" }}>
                          <span style={{ color: "#34D399", fontSize: 12, marginTop: 2, flexShrink: 0 }}>✓</span>
                          {f}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => navigate("/cadastro")} style={{
                      padding: "14px", borderRadius: 12, width: "100%",
                      background: plan.popular ? `linear-gradient(135deg, ${accent}, ${accentLight})` : "transparent",
                      border: plan.popular ? "none" : "1px solid #2A2D42",
                      color: plan.popular ? "#fff" : "#9CA0B8",
                      fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                      boxShadow: plan.popular ? `0 4px 24px ${accent}33` : "none",
                      transition: "all 0.2s ease",
                    }}
                      onMouseEnter={(e) => { if (!plan.popular) { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = "#E8E9F0"; } }}
                      onMouseLeave={(e) => { if (!plan.popular) { e.currentTarget.style.borderColor = "#2A2D42"; e.currentTarget.style.color = "#9CA0B8"; } }}>
                      {plan.cta}
                    </button>
                  </div>
                </Section>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" style={{ padding: "100px 40px", maxWidth: 720, margin: "0 auto" }}>
        <Section>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>FAQ</span>
            <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 10 }}>Perguntas frequentes</h2>
          </div>
        </Section>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FAQS.map((faq, i) => {
            const open = openFaq === i;
            return (
              <Section key={i} delay={i * 0.05}>
                <div style={{
                  background: "#12131A", border: `1px solid ${open ? accent + "33" : "#1E2030"}`,
                  borderRadius: 14, overflow: "hidden", transition: "border-color 0.3s ease",
                }}>
                  <button onClick={() => setOpenFaq(open ? null : i)}
                    style={{
                      width: "100%", padding: "18px 22px", border: "none",
                      background: "transparent", color: "#E8E9F0", fontSize: 15, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                    {faq.q}
                    <span style={{ fontSize: 18, color: "#4A4E6A", transform: open ? "rotate(45deg)" : "none", transition: "transform 0.3s ease", flexShrink: 0, marginLeft: 12 }}>+</span>
                  </button>
                  <div style={{
                    maxHeight: open ? 300 : 0, overflow: "hidden",
                    transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
                  }}>
                    <p style={{ padding: "0 22px 18px", fontSize: 14, lineHeight: 1.8, color: "#6B7094", margin: 0 }}>{faq.a}</p>
                  </div>
                </div>
              </Section>
            );
          })}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section style={{ padding: "100px 40px" }}>
        <Section>
          <div style={{
            maxWidth: 800, margin: "0 auto", textAlign: "center", padding: "60px 40px",
            background: `linear-gradient(135deg, ${accent}08, rgba(34,211,238,0.04))`,
            border: `1px solid ${accent}18`,
            borderRadius: 28, position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${accent}08, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ fontSize: 44, marginBottom: 16 }}>⚖</div>
            <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 12, position: "relative" }}>
              Sua aprovação começa agora
            </h2>
            <p style={{ fontSize: 16, color: "#6B7094", marginBottom: 32, maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.7 }}>
              Junte-se a milhares de candidatos que já estão usando IA para estudar de forma mais inteligente. 
              7 dias grátis, sem cartão de crédito.
            </p>
            <button onClick={() => navigate("/cadastro")} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "18px 40px", borderRadius: 14, fontSize: 17, fontWeight: 800,
              background: `linear-gradient(135deg, ${accent}, ${accentLight})`, color: "#fff",
              boxShadow: `0 8px 40px ${accent}33`,
              cursor: "pointer", animation: "glow 3s ease infinite", border: "none", fontFamily: "inherit",
            }}>
              ✦ Começar grátis agora
            </button>
            <div style={{ marginTop: 16, fontSize: 13, color: "#4A4E6A" }}>Sem cartão · Cancele quando quiser</div>
          </div>
        </Section>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: "1px solid #1E2030", padding: "48px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 40 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src="/logo.aprovadv.jpg" alt="AprovAdv" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 800 }}>AprovAdv<span style={{ color: accent, fontSize: 11 }}>.IA</span></span>
            </div>
            <p style={{ fontSize: 13, color: "#4A4E6A", maxWidth: 280, lineHeight: 1.6 }}>
              Plataforma de estudos jurídicos com Inteligência Artificial. Aprovação na OAB e concursos.
            </p>
            <div style={{ marginTop: 12, fontSize: 12, color: "#2A2D42" }}>aprovadv.com.br</div>
          </div>

          {[
            { title: "Plataforma", links: ["Funcionalidades", "Planos", "FAQ", "Blog"] },
            { title: "Legal", links: ["Termos de uso", "Privacidade", "Política de cookies"] },
            { title: "Contato", links: ["contato@aprovadv.com.br", "Instagram", "WhatsApp"] },
          ].map((col) => (
            <div key={col.title}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7094", marginBottom: 14, letterSpacing: "0.05em", textTransform: "uppercase" }}>{col.title}</div>
              {col.links.map((link) => (
                <div key={link} style={{ fontSize: 13, color: "#4A4E6A", marginBottom: 10, cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={(e) => e.target.style.color = "#9CA0B8"}
                  onMouseLeave={(e) => e.target.style.color = "#4A4E6A"}>
                  {link}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 1100, margin: "32px auto 0", paddingTop: 24, borderTop: "1px solid #1E2030", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "#2A2D42" }}>© 2026 AprovAdv.IA — Todos os direitos reservados</div>
          <div style={{ fontSize: 12, color: "#2A2D42" }}>Feito com ✦ por AprovAdv</div>
        </div>
      </footer>
    </div>
  );
}
