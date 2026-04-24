# Deploy na Hostinger — Guia Rápido

> **Pré-requisito:** plano Hostinger **Business**, **Cloud Hosting** ou **VPS** com Node.js (planos Premium/Starter compartilhados não suportam).

✅ **Banco SQLite embutido** — não precisa criar banco no painel
✅ **Frontend já buildado** em `frontend/dist/`
✅ **JWT_SECRET já gerado** no `.env.production`
✅ **Migrations rodam automaticamente** quando o servidor inicia

Você só precisa: subir os arquivos → configurar Node.js no painel → iniciar.

---

## Passo 1 — Subir os arquivos

Suba para o servidor (Hostinger) o conteúdo do repositório.

**Forma mais fácil — Git via SSH** (se você tiver acesso SSH):
```bash
ssh u123456789@seu-servidor.hostinger.com
cd ~
git clone https://github.com/hilquiasdan/Eraldo---Refrigera-o.git eraldo
```

**Sem SSH — via Gerenciador de Arquivos:**
1. Baixe o ZIP do repositório no GitHub (botão **Code → Download ZIP**)
2. No hPanel → **Gerenciador de Arquivos** → faça upload do ZIP
3. Extraia para uma pasta como `~/eraldo/`

### Estrutura esperada no servidor:

```
/home/u123456789/eraldo/
├── backend/
│   ├── src/
│   ├── migrations/
│   ├── package.json
│   ├── .env.production    ← renomeie para .env (Passo 2)
│   └── data/              ← criado automaticamente (banco SQLite)
└── frontend/
    └── dist/
```

---

## Passo 2 — Configurar o `.env`

Via terminal SSH ou Gerenciador de Arquivos:

1. **Renomeie** `backend/.env.production` para `backend/.env`
2. **Abra** e ajuste apenas a linha `CORS_ORIGIN` com seu domínio real:

```env
CORS_ORIGIN=https://seudominio.com.br,https://www.seudominio.com.br
```

> **JWT_SECRET já vem pronto. Não precisa mudar.**
> **Não há credenciais de banco — SQLite usa um arquivo local.**

---

## Passo 3 — Configurar Node.js no hPanel

1. **hPanel → Avançado → Node.js** (ou "Aplicações Node.js")
2. **"Criar aplicação":**
   - **Versão Node:** 18 ou superior
   - **Modo:** Production
   - **Raiz da aplicação:** `/home/u123456789/eraldo/backend`
   - **URL:** seu domínio
   - **Arquivo de inicialização:** `src/server.js`
3. Clique em **"Salvar"**
4. Clique em **"Run NPM Install"** (ou abra o terminal e rode `npm install --omit=dev`)
   > Isso vai instalar o `better-sqlite3` (binário pré-compilado para Linux x64)
5. Clique em **"Iniciar aplicação"**

Na primeira execução, o servidor vai:
- Criar a pasta `backend/data/`
- Criar o arquivo `eraldo.db`
- Rodar todas as migrations (criar tabelas + dados iniciais)

Você verá no log:
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
- `https://seudominio.com.br/api/health` → deve retornar `{"status":"ok"}`
- `https://seudominio.com.br/login` → tela de login

**Login admin:**
- Email: `admin@eraldorefrigeracao.com.br`
- Senha: `eraldo123`

> **IMPORTANTE:** troque a senha imediatamente após o primeiro login (em **Usuários** no admin).

---

## Passo 5 — SSL (HTTPS)

No hPanel:
- **Domínios → SSL** → ativar **SSL grátis** (Let's Encrypt)
- Marcar **"Forçar HTTPS"**

---

## Backup do banco

O banco é o arquivo `backend/data/eraldo.db`. Para fazer backup, basta copiar este arquivo:

```bash
cp ~/eraldo/backend/data/eraldo.db ~/backups/eraldo-$(date +%Y%m%d).db
```

Recomendado: agendar um cron job no hPanel para backup diário.

---

## Atualizar o sistema no futuro

```bash
cd ~/eraldo
git pull
cd backend
npm install --omit=dev    # só se package.json mudou
# clicar em "Reiniciar aplicação" no painel Node.js
```

> Migrations novas rodam automaticamente no startup. O banco existente não é perdido.

---

## Trocar a senha do admin manualmente (CLI)

Se preferir trocar via terminal em vez do painel:

```bash
cd ~/eraldo/backend
npm run hash-password -- SuaNovaSenhaForte
```

Copie o hash e atualize via SQLite CLI:

```bash
sqlite3 data/eraldo.db
> UPDATE users SET senha_hash = '$2a$10$...COLE_O_HASH...' WHERE email = 'admin@eraldorefrigeracao.com.br';
> .exit
```

---

## Troubleshooting

**502 Bad Gateway**
→ Aplicação Node.js não está rodando. Veja o log no painel. Verifique se `npm install` rodou com sucesso.

**Erro ao instalar `better-sqlite3`**
→ Confirme que o servidor é Linux x64 (padrão Hostinger) e Node 18+. O pacote tem binários pré-compilados, mas se falhar, instale build-tools: `apt install build-essential python3` (em VPS) ou contate suporte (em Business/Cloud).

**Frontend não carrega (404)**
→ Confirme que `frontend/dist/index.html` existe no servidor.

**"Token inválido" no login**
→ Limpe o localStorage do navegador (F12 → Application → Local Storage → Limpar).

**Banco "travado" (database is locked)**
→ Pode acontecer se múltiplos processos acessarem o mesmo arquivo. O `journal_mode = WAL` já está habilitado, mas se persistir, reinicie a aplicação.

**Mudei o domínio e o login não funciona**
→ Atualize `CORS_ORIGIN` no `.env` e reinicie.
