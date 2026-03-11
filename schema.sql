-- ============================================================
-- AprovAdv.IA — Schema do Banco de Dados (Supabase / PostgreSQL)
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- ─── USUÁRIOS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome        TEXT NOT NULL,
  cpf         TEXT UNIQUE NOT NULL,
  telefone    TEXT,
  email       TEXT UNIQUE NOT NULL,
  plano       TEXT DEFAULT 'free' CHECK (plano IN ('free', 'starter', 'pro')),
  criado_em   TIMESTAMPTZ DEFAULT NOW(),
  ultimo_acesso TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CRONOGRAMAS DE ESTUDO ───────────────────────────────────
CREATE TABLE IF NOT EXISTS cronogramas (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id  UUID REFERENCES usuarios(id) ON DELETE CASCADE UNIQUE,
  meta        TEXT,
  horas_dia   INT DEFAULT 2,
  dias_semana TEXT[] DEFAULT '{}',
  materias    TEXT[] DEFAULT '{}',
  data_prova  DATE,
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── HISTÓRICO DE QUESTÕES ────────────────────────────────────
CREATE TABLE IF NOT EXISTS questoes_historico (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id    UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  materia       TEXT,
  banca         TEXT,
  dificuldade   TEXT,
  enunciado     TEXT,
  gabarito      TEXT,
  resposta_aluno TEXT,
  acertou       BOOLEAN DEFAULT FALSE,
  tempo_segundos INT DEFAULT 0,
  criado_em     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SIMULADOS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS simulados (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id      UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo            TEXT,
  total_questoes  INT DEFAULT 0,
  acertos         INT DEFAULT 0,
  nota            FLOAT DEFAULT 0,
  tempo_minutos   INT DEFAULT 0,
  respostas       JSONB DEFAULT '[]',
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SESSÕES DE ESTUDO DIÁRIAS ────────────────────────────────
CREATE TABLE IF NOT EXISTS sessoes_estudo (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id            UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  data                  DATE DEFAULT CURRENT_DATE,
  questoes_respondidas  INT DEFAULT 0,
  acertos               INT DEFAULT 0,
  tempo_minutos         INT DEFAULT 0,
  criado_em             TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, data)
);

-- ─── ÍNDICES PARA PERFORMANCE ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_questoes_usuario ON questoes_historico(usuario_id);
CREATE INDEX IF NOT EXISTS idx_questoes_materia ON questoes_historico(materia);
CREATE INDEX IF NOT EXISTS idx_simulados_usuario ON simulados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario_data ON sessoes_estudo(usuario_id, data);

-- ─── ROW LEVEL SECURITY (RLS) ─────────────────────────────────
-- Permite acesso público para leitura/escrita via anon key
-- Em produção real, configure policies mais restritivas com Auth

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE cronogramas ENABLE ROW LEVEL SECURITY;
ALTER TABLE questoes_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_estudo ENABLE ROW LEVEL SECURITY;

-- Policies: permite tudo via anon key (ajuste conforme necessário)
CREATE POLICY "allow_all_usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_cronogramas" ON cronogramas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_questoes" ON questoes_historico FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_simulados" ON simulados FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_sessoes" ON sessoes_estudo FOR ALL USING (true) WITH CHECK (true);
