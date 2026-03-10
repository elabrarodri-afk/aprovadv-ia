# AprovAdv.IA — Plataforma de Estudos Jurídicos com IA

## 🚀 Como colocar no ar (passo a passo)

### Passo 1: Criar conta no GitHub (grátis)
1. Acesse [github.com](https://github.com)
2. Clique em **Sign up**
3. Crie sua conta com e-mail e senha

### Passo 2: Instalar o Git e Node.js no seu computador
- **Node.js**: Baixe em [nodejs.org](https://nodejs.org) (versão LTS)
- **Git**: Baixe em [git-scm.com](https://git-scm.com)

### Passo 3: Subir o projeto para o GitHub
Abra o terminal/prompt de comando na pasta do projeto e execute:

```bash
# Instalar dependências (só na primeira vez)
npm install

# Testar localmente
npm run dev
# Acesse http://localhost:5173 para ver o projeto

# Inicializar Git
git init
git add .
git commit -m "AprovAdv.IA - primeira versão"

# Criar repositório no GitHub (pelo site github.com > New repository)
# Nome sugerido: aprovadv-ia
# Depois conecte:
git remote add origin https://github.com/SEU-USUARIO/aprovadv-ia.git
git branch -M main
git push -u origin main
```

### Passo 4: Criar conta na Vercel e fazer deploy
1. Acesse [vercel.com](https://vercel.com)
2. Clique em **Sign up** → **Continue with GitHub**
3. Autorize o acesso ao GitHub
4. Clique em **Add New...** → **Project**
5. Selecione o repositório **aprovadv-ia**
6. A Vercel detecta automaticamente que é um projeto Vite
7. Clique em **Deploy**
8. Em ~1 minuto seu site estará no ar!

### Passo 5: Conectar seu domínio aprovadv.com.br
1. No painel da Vercel, vá em **Settings** → **Domains**
2. Digite `aprovadv.com.br` e clique **Add**
3. A Vercel vai mostrar os registros DNS necessários
4. No painel do seu registrador de domínio (ex: Registro.br, GoDaddy):
   - Adicione um registro **A** apontando para `76.76.21.21`
   - Adicione um registro **CNAME** de `www` apontando para `cname.vercel-dns.com`
5. Aguarde até 48h para propagação DNS (geralmente leva minutos)

### Passo 6: Configurar HTTPS
A Vercel configura HTTPS automaticamente quando o domínio é conectado.

---

## 📁 Estrutura do Projeto

```
aprovadv/
├── index.html              # Página principal
├── package.json            # Dependências
├── vite.config.js          # Config do Vite
├── vercel.json             # Config de deploy
└── src/
    ├── main.jsx            # Entry point
    ├── App.jsx             # Rotas e navegação
    ├── theme.js            # Cores e tokens
    └── pages/
        ├── Landing.jsx     # Landing page (aprovadv.com.br)
        ├── Dashboard.jsx   # Dashboard do aluno
        ├── Questoes.jsx    # Banco de questões com IA
        ├── Simulado.jsx    # Simulados 1ª e 2ª fase
        ├── Flashcards.jsx  # Revisão com flashcards
        ├── Tutor.jsx       # IA Tutor
        └── Cronograma.jsx  # Cronograma personalizado
```

## 🔗 Rotas

| Rota | Página |
|------|--------|
| `/` | Landing page |
| `/app` | Dashboard |
| `/app/questoes` | Banco de questões |
| `/app/simulado` | Simulados |
| `/app/flashcards` | Flashcards |
| `/app/tutor` | IA Tutor |
| `/app/cronograma` | Cronograma |

## 🛠 Comandos

```bash
npm install       # Instalar dependências
npm run dev       # Rodar localmente (localhost:5173)
npm run build     # Gerar build de produção
npm run preview   # Preview do build
```
