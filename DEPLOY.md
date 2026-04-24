# Deploy na Hostinger — Guia Rápido

> **Pré-requisito:** plano Hostinger **Business**, **Cloud Hosting** ou **VPS** com Node.js (planos Premium/Starter compartilhados não suportam).

✅ **UMA pasta só no servidor** — o repositório inteiro é a aplicação
✅ **Banco SQLite embutido** (`sql.js`) — sem criação de banco no painel
✅ **Zero compilação nativa** — sem Python, sem node-gyp
✅ **Frontend já vem buildado** em `public/`
✅ **JWT_SECRET pré-gerado** no `.env.production`
✅ **Migrations automáticas** no startup

---

## Passo 1 — Subir o projeto para o servidor

**Opção A — Git via SSH (mais fácil se disponível):**
```bash
ssh u123456789@seu-servidor.hostinger.com
cd ~
git clone https://github.com/hilquiasdan/Eraldo---Refrigera-o.git eraldo
```

**Opção B — Download ZIP e upload:**
1. No GitHub, clique em **Code → Download ZIP**
2. Extraia o ZIP no seu computador
3. No hPanel → **Gerenciador de Arquivos** → crie a pasta `eraldo/`
4. Faça upload de **todo o conteúdo** da pasta extraída para dentro de `eraldo/`
   > Não crie subpasta. Os arquivos (`src/`, `public/`, `package.json`, etc.) devem ficar na raiz de `eraldo/`.

### Estrutura esperada no servidor:

```
/home/u123456789/eraldo/
├── src/                  ← código da API
├── migrations/           ← SQL (roda automaticamente)
├── public/               ← frontend buildado
├── frontend/             ← código-fonte (só usar se for editar visual)
├── package.json
├── .env.production       ← renomear para .env (Passo 2)
└── data/                 ← criado automaticamente (banco SQLite)
```

---

## Passo 2 — Configurar o `.env`

Dentro de `eraldo/`:

1. **Renomeie** `.env.production` para `.env`
2. **Abra** e ajuste apenas `CORS_ORIGIN` com seu domínio:

```env
CORS_ORIGIN=https://seudominio.com.br,https://www.seudominio.com.br
```

> **JWT_SECRET já vem pronto. Não há credenciais de banco.**

---

## Passo 3 — Configurar Node.js no hPanel

1. **hPanel → Avançado → Node.js** (ou "Aplicações Node.js")
2. **"Criar aplicação":**
   - **Tipo/Framework:** Node.js (genérico) ou Express
   - **Versão Node:** **20** (recomendado)
   - **Modo:** Production
   - **Raiz da aplicação:** `/home/u123456789/eraldo`
   - **URL:** seu domínio
   - **Arquivo de inicialização / Startup file:** `src/server.js`
3. Clique em **"Salvar"**
4. Clique em **"Run NPM Install"** (ou no terminal: `npm install --omit=dev`)
   > Instala apenas pacotes JavaScript puros — sem compilação nativa.
5. Clique em **"Iniciar aplicação"**

Na primeira execução, o servidor vai:
- Criar a pasta `data/`
- Criar o banco `eraldo.db`
- Rodar migrations automaticamente
- Popular com dados iniciais

Log esperado:
```
> Aplicando 001_schema.sql...
  ✓ ok
> Aplicando 002_seed.sql...
  ✓ ok
2 migration(s) aplicada(s).
API rodando em http://localhost:3001
```

---

## Passo 4 — Testar

Acesse:
- `https://seudominio.com.br/` → landing page
- `https://seudominio.com.br/api/health` → `{"status":"ok"}`
- `https://seudominio.com.br/login` → tela de login

**Login admin:**
- `AdminAr` / `86671266Hh@`
- `Eraldomot` / `Heloisa123`

---

## Passo 5 — SSL (HTTPS)

No hPanel:
- **Domínios → SSL** → ativar **SSL grátis** (Let's Encrypt)
- Marcar **"Forçar HTTPS"**

---

## Backup do banco

O banco é o arquivo `data/eraldo.db`. Para backup:

```bash
cp ~/eraldo/data/eraldo.db ~/backups/eraldo-$(date +%F).db
```

Recomendado: agendar backup diário via cron do hPanel.

---

## Atualizar o sistema no futuro

```bash
cd ~/eraldo
git pull
npm install --omit=dev    # só se package.json mudou
# clicar em "Reiniciar aplicação" no painel
```

Migrations novas rodam automaticamente. O banco existente é preservado.

---

## Rebuildar o frontend (se mudar algo visual)

Localmente no seu computador:

```bash
cd eraldo
npm run build:frontend    # builda e copia para public/
git add . && git commit -m "update UI" && git push
```

No servidor: `git pull` e reiniciar.

---

## Troubleshooting

**Erro de permissão EACCES no `npm install`**
→ Garantido que **não vai acontecer**: o projeto usa `sql.js` (JavaScript puro em WebAssembly). Zero pacotes com compilação nativa.

**502 Bad Gateway**
→ Aplicação Node não está rodando. Veja o log no painel.

**Frontend não carrega (404)**
→ Confirme que `public/index.html` existe no servidor.

**"Token inválido" no login**
→ Limpe o localStorage do navegador.

**Mudei o domínio e o login não funciona**
→ Atualize `CORS_ORIGIN` no `.env` e reinicie.

---

## Trocar a senha do admin via terminal (opcional)

```bash
cd ~/eraldo
npm run hash-password -- SuaNovaSenhaForte
```

Copie o hash e rode via sqlite3 (se disponível) ou peça para eu fazer um endpoint.
