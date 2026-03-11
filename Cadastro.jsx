import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { T } from "./theme";
import { criarUsuario, salvarCronograma, salvarSessaoLocal } from "./supabase";

// ─── Máscaras ─────────────────────────────────────────────
function maskCPF(v) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function maskTel(v) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

const MATERIAS = [
  "Direito Constitucional", "Direito Civil", "Direito Penal",
  "Direito Processual Civil", "Direito Processual Penal",
  "Direito do Trabalho", "Direito Administrativo", "Direito Tributário",
  "Direito Empresarial", "Ética Profissional", "Direitos Humanos",
];
const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const METAS = ["OAB 1ª Fase", "OAB 2ª Fase", "Magistratura", "Ministério Público", "Defensoria", "Delegado"];

// ─── Input estilizado ─────────────────────────────────────
function Input({ label, ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <div>
      {label && <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600, letterSpacing: "0.04em" }}>{label}</label>}
      <input
        {...props}
        onFocus={e => { setFocus(true); props.onFocus?.(e); }}
        onBlur={e => { setFocus(false); props.onBlur?.(e); }}
        style={{
          width: "100%", background: T.bgSurface,
          border: `1.5px solid ${focus ? T.accent : T.border}`,
          borderRadius: 12, padding: "12px 16px", color: T.text,
          fontSize: 14, outline: "none", fontFamily: "inherit",
          transition: "border-color 0.2s",
          ...props.style,
        }}
      />
    </div>
  );
}

// ─── Passo 1: Dados pessoais ──────────────────────────────
function StepDados({ dados, setDados, onNext }) {
  const [erros, setErros] = useState({});

  const validar = () => {
    const e = {};
    if (!dados.nome.trim() || dados.nome.trim().split(" ").length < 2) e.nome = "Digite seu nome completo.";
    if (dados.cpf.replace(/\D/g, "").length < 11) e.cpf = "CPF inválido.";
    if (dados.tel.replace(/\D/g, "").length < 10) e.tel = "Telefone inválido.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) e.email = "E-mail inválido.";
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const campos = [
    { key: "nome", label: "NOME COMPLETO", placeholder: "Ex: Maria Fernanda Souza", type: "text" },
    { key: "cpf", label: "CPF", placeholder: "000.000.000-00", type: "text" },
    { key: "tel", label: "TELEFONE / WHATSAPP", placeholder: "(11) 99999-9999", type: "tel" },
    { key: "email", label: "E-MAIL", placeholder: "seu@email.com", type: "email" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h2 style={{ color: T.text, fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Crie sua conta</h2>
        <p style={{ color: T.textMuted, fontSize: 14 }}>Preencha seus dados para começar gratuitamente.</p>
      </div>

      {campos.map(({ key, label, placeholder, type }) => (
        <div key={key}>
          <Input
            label={label}
            type={type}
            placeholder={placeholder}
            value={dados[key]}
            onChange={e => {
              let v = e.target.value;
              if (key === "cpf") v = maskCPF(v);
              if (key === "tel") v = maskTel(v);
              setDados(d => ({ ...d, [key]: v }));
              if (erros[key]) setErros(er => ({ ...er, [key]: "" }));
            }}
          />
          {erros[key] && <p style={{ color: T.red, fontSize: 12, marginTop: 5 }}>⚠ {erros[key]}</p>}
        </div>
      ))}

      <button onClick={() => validar() && onNext()} style={{
        width: "100%", padding: "14px", borderRadius: 14, border: "none",
        background: `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`,
        color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
        fontFamily: "inherit", marginTop: 4,
      }}>
        Continuar →
      </button>
    </div>
  );
}

// ─── Passo 2: Cronograma ──────────────────────────────────
function StepCronograma({ dados, setDados, onNext, onBack, salvando }) {
  const [erros, setErros] = useState({});

  const toggleDia = (dia) => {
    const dias = dados.diasEstudo.includes(dia)
      ? dados.diasEstudo.filter(d => d !== dia)
      : [...dados.diasEstudo, dia];
    setDados(d => ({ ...d, diasEstudo: dias }));
  };

  const toggleMateria = (mat) => {
    const mats = dados.materias.includes(mat)
      ? dados.materias.filter(m => m !== mat)
      : dados.materias.length < 5 ? [...dados.materias, mat] : dados.materias;
    setDados(d => ({ ...d, materias: mats }));
  };

  const validar = () => {
    const e = {};
    if (!dados.meta) e.meta = "Selecione sua meta.";
    if (dados.diasEstudo.length === 0) e.dias = "Selecione ao menos um dia.";
    if (!dados.horasPorDia) e.horas = "Informe as horas diárias.";
    if (dados.materias.length === 0) e.materias = "Selecione ao menos uma matéria.";
    setErros(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h2 style={{ color: T.text, fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Seu cronograma</h2>
        <p style={{ color: T.textMuted, fontSize: 14 }}>Vamos personalizar seus estudos.</p>
      </div>

      {/* Meta */}
      <div>
        <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 10, fontWeight: 600, letterSpacing: "0.04em" }}>SUA META</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {METAS.map(m => (
            <button key={m} onClick={() => { setDados(d => ({ ...d, meta: m })); setErros(e => ({ ...e, meta: "" })); }} style={{
              padding: "8px 16px", borderRadius: 20, border: `1.5px solid ${dados.meta === m ? T.accent : T.border}`,
              background: dados.meta === m ? T.accentGlow : T.bgSurface,
              color: dados.meta === m ? T.accent : T.textMuted,
              cursor: "pointer", fontSize: 13, fontWeight: dados.meta === m ? 700 : 400,
              fontFamily: "inherit", transition: "all 0.15s",
            }}>{m}</button>
          ))}
        </div>
        {erros.meta && <p style={{ color: T.red, fontSize: 12, marginTop: 5 }}>⚠ {erros.meta}</p>}
      </div>

      {/* Horas por dia */}
      <div>
        <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 10, fontWeight: 600, letterSpacing: "0.04em" }}>HORAS DE ESTUDO POR DIA</label>
        <div style={{ display: "flex", gap: 8 }}>
          {["1h", "2h", "3h", "4h", "5h", "6h+"].map(h => (
            <button key={h} onClick={() => { setDados(d => ({ ...d, horasPorDia: h })); setErros(e => ({ ...e, horas: "" })); }} style={{
              flex: 1, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${dados.horasPorDia === h ? T.accent : T.border}`,
              background: dados.horasPorDia === h ? T.accentGlow : T.bgSurface,
              color: dados.horasPorDia === h ? T.accent : T.textMuted,
              cursor: "pointer", fontSize: 13, fontWeight: dados.horasPorDia === h ? 700 : 400,
              fontFamily: "inherit", transition: "all 0.15s",
            }}>{h}</button>
          ))}
        </div>
        {erros.horas && <p style={{ color: T.red, fontSize: 12, marginTop: 5 }}>⚠ {erros.horas}</p>}
      </div>

      {/* Dias da semana */}
      <div>
        <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 10, fontWeight: 600, letterSpacing: "0.04em" }}>DIAS DISPONÍVEIS</label>
        <div style={{ display: "flex", gap: 8 }}>
          {DIAS.map(d => (
            <button key={d} onClick={() => { toggleDia(d); setErros(e => ({ ...e, dias: "" })); }} style={{
              flex: 1, padding: "10px 0", borderRadius: 10,
              border: `1.5px solid ${dados.diasEstudo.includes(d) ? T.accent : T.border}`,
              background: dados.diasEstudo.includes(d) ? T.accentGlow : T.bgSurface,
              color: dados.diasEstudo.includes(d) ? T.accent : T.textMuted,
              cursor: "pointer", fontSize: 12, fontWeight: dados.diasEstudo.includes(d) ? 700 : 400,
              fontFamily: "inherit", transition: "all 0.15s",
            }}>{d}</button>
          ))}
        </div>
        {erros.dias && <p style={{ color: T.red, fontSize: 12, marginTop: 5 }}>⚠ {erros.dias}</p>}
      </div>

      {/* Matérias prioritárias */}
      <div>
        <label style={{ display: "block", fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600, letterSpacing: "0.04em" }}>
          MATÉRIAS PRIORITÁRIAS <span style={{ color: T.textDim }}>(até 5)</span>
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {MATERIAS.map(m => {
            const sel = dados.materias.includes(m);
            const max = !sel && dados.materias.length >= 5;
            return (
              <button key={m} onClick={() => { if (!max) { toggleMateria(m); setErros(e => ({ ...e, materias: "" })); } }} style={{
                padding: "7px 14px", borderRadius: 20,
                border: `1.5px solid ${sel ? T.accent : T.border}`,
                background: sel ? T.accentGlow : T.bgSurface,
                color: sel ? T.accent : max ? T.textDim : T.textMuted,
                cursor: max ? "not-allowed" : "pointer",
                fontSize: 12, fontWeight: sel ? 700 : 400,
                fontFamily: "inherit", transition: "all 0.15s",
                opacity: max ? 0.5 : 1,
              }}>{m}</button>
            );
          })}
        </div>
        {erros.materias && <p style={{ color: T.red, fontSize: 12, marginTop: 5 }}>⚠ {erros.materias}</p>}
      </div>

      {/* Data da prova */}
      <div>
        <Input
          label="DATA PREVISTA DA PROVA (opcional)"
          type="date"
          value={dados.dataProva}
          onChange={e => setDados(d => ({ ...d, dataProva: e.target.value }))}
          style={{ colorScheme: "dark" }}
        />
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
        <button onClick={onBack} style={{
          flex: 1, padding: "13px", borderRadius: 14, border: `1px solid ${T.border}`,
          background: "transparent", color: T.textMuted, cursor: "pointer",
          fontSize: 14, fontWeight: 600, fontFamily: "inherit",
        }}>← Voltar</button>
        <button onClick={() => !salvando && validar() && onNext()} style={{
          flex: 2, padding: "13px", borderRadius: 14, border: "none",
          background: salvando ? T.bgSurface : `linear-gradient(135deg, ${T.accent}, ${T.accentLight})`,
          color: salvando ? T.textMuted : "#fff", fontSize: 15, fontWeight: 700,
          cursor: salvando ? "not-allowed" : "pointer", fontFamily: "inherit",
        }}>{salvando ? "Salvando..." : "Criar minha conta →"}</button>
      </div>
    </div>
  );
}

// ─── Passo 3: Sucesso ─────────────────────────────────────
function StepSucesso({ nome }) {
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%", margin: "0 auto 20px",
        background: `rgba(52, 211, 153, 0.15)`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
      }}>✓</div>
      <h2 style={{ color: T.green, fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Conta criada!</h2>
      <p style={{ color: T.textMuted, fontSize: 15, marginBottom: 4 }}>
        Bem-vinda, <strong style={{ color: T.text }}>{nome.split(" ")[0]}</strong>!
      </p>
      <p style={{ color: T.textMuted, fontSize: 14 }}>Abrindo seu dashboard...</p>
      <div style={{
        marginTop: 24, height: 3, background: T.bgSurface, borderRadius: 2, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: 2, width: "100%",
          background: `linear-gradient(90deg, ${T.accent}, ${T.accentLight})`,
          animation: "loadBar 1.8s ease forwards",
        }} />
      </div>
      <style>{`@keyframes loadBar { from { transform: scaleX(0); transform-origin: left; } to { transform: scaleX(1); transform-origin: left; } }`}</style>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────
export default function Cadastro() {
  const navigate = useNavigate();
  const [passo, setPasso] = useState(1);
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState(null);
  const [dados, setDados] = useState({
    nome: "", cpf: "", tel: "", email: "",
    meta: "", horasPorDia: "", diasEstudo: [], materias: [], dataProva: "",
  });

  const salvarEAvancar = async () => {
    setSalvando(true);
    setErroSalvar(null);
    try {
      // 1. Criar usuário no Supabase
      const usuario = await criarUsuario({
        nome: dados.nome,
        cpf: dados.cpf,
        telefone: dados.tel,
        email: dados.email,
      });

      // 2. Salvar cronograma vinculado ao usuário
      await salvarCronograma(usuario.id, {
        meta: dados.meta,
        horasDia: Number(dados.horasPorDia) || 2,
        diasSemana: dados.diasEstudo,
        materias: dados.materias,
        dataProva: dados.dataProva || null,
      });

      // 3. Salvar sessão local (para uso imediato no app)
      salvarSessaoLocal({ ...usuario, cronograma: { ...dados } });

      setPasso(3);
      setTimeout(() => navigate("/app"), 2000);
    } catch (err) {
      // Se CPF/email já cadastrado, ainda permite entrar
      if (err?.code === "23505") {
        setErroSalvar("CPF ou e-mail já cadastrado. Redirecionando...");
        salvarSessaoLocal({ ...dados, criadoEm: new Date().toISOString() });
        setPasso(3);
        setTimeout(() => navigate("/app"), 2000);
      } else {
        // Fallback: salva local mesmo se Supabase falhar
        salvarSessaoLocal({ ...dados, criadoEm: new Date().toISOString() });
        setPasso(3);
        setTimeout(() => navigate("/app"), 2000);
      }
    } finally {
      setSalvando(false);
    }
  };

  const steps = ["Dados", "Cronograma", "Pronto"];

  return (
    <div style={{
      minHeight: "100vh", background: T.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px", fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <img src="/logo.aprovadv.jpg" alt="AprovAdv" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.text, lineHeight: 1.1 }}>AprovAdv</div>
              <div style={{ fontSize: 10, color: T.accent, fontWeight: 700, letterSpacing: "0.1em" }}>.IA</div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: T.bgCard, border: `1px solid ${T.border}`,
          borderRadius: 20, padding: "36px 40px",
        }}>
          {/* Progress */}
          {passo < 3 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
              {steps.map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: i + 1 < passo ? T.accent : i + 1 === passo ? T.accent : T.bgSurface,
                      border: `2px solid ${i + 1 <= passo ? T.accent : T.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700,
                      color: i + 1 <= passo ? "#fff" : T.textDim,
                    }}>{i + 1 < passo ? "✓" : i + 1}</div>
                    <span style={{ fontSize: 12, color: i + 1 === passo ? T.text : T.textDim, fontWeight: i + 1 === passo ? 600 : 400 }}>{s}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ flex: 1, height: 1, background: i + 1 < passo ? T.accent : T.border, margin: "0 10px" }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {passo === 1 && <StepDados dados={dados} setDados={setDados} onNext={() => setPasso(2)} />}
          {passo === 2 && <StepCronograma dados={dados} setDados={setDados} onNext={salvarEAvancar} onBack={() => setPasso(1)} salvando={salvando} />}
          {passo === 3 && <StepSucesso nome={dados.nome} />}
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: T.textDim }}>
          Já tem conta?{" "}
          <button onClick={() => navigate("/app")} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontSize: 13, fontFamily: "inherit", fontWeight: 600 }}>
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}
