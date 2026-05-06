# 🌾 Controle de Colheita

Aplicativo de gestão de produção agrícola — Soja, Sorgo, Trigo, Milho e Feijão.

---

## 🚀 Como publicar no Cloudflare Pages (via GitHub)

### Passo 1 — Instalar o Git e Node.js (se não tiver)
- Git: https://git-scm.com/downloads
- Node.js (versão 18+): https://nodejs.org

### Passo 2 — Criar repositório no GitHub
1. Acesse https://github.com e faça login (ou crie uma conta grátis)
2. Clique em **"New repository"**
3. Dê o nome: `colheita-app`
4. Deixe como **Public**
5. Clique em **"Create repository"**

### Passo 3 — Enviar os arquivos para o GitHub
Abra o terminal (Prompt de Comando no Windows, Terminal no Mac/Linux) e execute:

```bash
# Entre na pasta do projeto
cd caminho/para/colheita-app

# Inicie o git
git init

# Adicione todos os arquivos
git add .

# Faça o primeiro commit
git commit -m "primeiro commit"

# Conecte ao repositório do GitHub (troque SEU_USUARIO pelo seu usuário)
git remote add origin https://github.com/SEU_USUARIO/colheita-app.git

# Envie os arquivos
git push -u origin main
```

### Passo 4 — Publicar no Cloudflare Pages
1. Acesse https://dash.cloudflare.com e faça login (ou crie conta grátis)
2. No menu lateral, clique em **"Workers & Pages"**
3. Clique em **"Create application"** → **"Pages"** → **"Connect to Git"**
4. Conecte sua conta do GitHub e selecione o repositório `colheita-app`
5. Configure o build:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. Clique em **"Save and Deploy"**

✅ Pronto! Em alguns minutos o app estará online com um link `.pages.dev`.

---

## 🔄 Atualizar o app no futuro
Sempre que quiser atualizar, basta rodar no terminal:
```bash
git add .
git commit -m "atualização"
git push
```
O Cloudflare vai rebuildar e publicar automaticamente.

---

## 💻 Rodar localmente (opcional)
```bash
npm install
npm run dev
```
Acesse http://localhost:5173
