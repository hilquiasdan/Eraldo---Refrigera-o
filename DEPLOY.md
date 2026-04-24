# Deploy na Hostinger — Guia Rápido

> **Pré-requisito:** plano Hostinger **Business**, **Cloud Hosting** ou **VPS** com Node.js (planos Premium/Starter compartilhados não suportam).

✅ **UMA pasta só** — o `backend/` já contém o frontend buildado (`backend/public/`)
✅ **Banco SQLite embutido** — sem criação de banco no painel
✅ **JWT_SECRET já gerado** no `.env.production`
✅ **Migrations rodam automaticamente** no startup

Você só precisa: subir o `backend/` → configurar Node.js no painel → iniciar.

---

## Passo 1 — Subir o `backend/` para o servidor

**Forma mais fácil — Git via SSH** (se você tiver acesso SSH):
```bash
ssh u123456789@seu-servidor.hostinger.com
cd ~
git clone https://github.com/hilquiasdan/Eraldo---Refrigera-o.git eraldo
```

**Sem SSH — via Gerenciador de Arquivos:**
1. Baixe o ZIP do repositório no GitHub (botão **Code → Download ZIP**)
2. No hPanel → **Gerenciador de Arquivos** → faça upload do ZIP
3. Extraia para `~/eraldo/`

### Estrutura no servidor:

```
/home/u123456789/eraldo/
└── backend/              ← é só isso que importa
    ├── src/
    ├── migrations/
    ├── public/           ← frontend buildado (já vem no repo)
    ├── package.json
    ├── .env.production   ← renomear para .env (Passo 2)
    └── data/             ← criado automaticamente (banco SQLite)
```

> A pasta `frontend/` do repo existe apenas para rebuildar o frontend no futuro. **Você não precisa dela em produção.**

---

## Passo 2 — Configurar o `.env`

Dentro de `backend/`:

1. **Renomeie** `.env.production` para `.env`
2. **Abra** e ajuste apenas `CORS_ORIGIN` com seu domínio:

```env
CORS_ORIGIN=https://seudominio.com.br,https://www.seudominio.com.br
```

> **JWT_SECRET já vem pronto. Não há credenciais de banco (SQLite é um arquivo).**

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
   > Instala apenas pacotes JavaScript puros — **sem compilação nativa, sem Python, sem node-gyp**.
5. Clique em **"Iniciar aplicação"**

Na primeira execução, o servidor vai:
- Criar a pasta `data/`
- Criar o banco `eraldo.db`
- Rodar todas as migrations
- Popular com dados iniciais (usuário admin, mecânicos, serviços)

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

O banco é o arquivo `backend/data/eraldo.db`. Para fazer backup, basta copiar:

```bash
cp ~/eraldo/backend/data/eraldo.db ~/backups/eraldo-$(date +%Y%m%d).db
```

Recomendado: agendar cron job no hPanel para backup diário.

---

## Atualizar o sistema no futuro

```bash
cd ~/eraldo
git pull
cd backend
npm install --omit=dev    # só se package.json mudou
# clicar em "Reiniciar aplicação" no painel Node.js
```

> Migrations novas rodam automaticamente no startup. O banco existente é preservado.

---

## Rebuildar o frontend (se você mudar algo visual)

Localmente, na sua máquina:

```bash
cd backend
npm run build:frontend    # builda o frontend e copia para backend/public/
```

Depois faça `git add . && git commit && git push`, e no servidor:
```bash
cd ~/eraldo && git pull
# reiniciar aplicação no painel
```

---

## Trocar a senha do admin manualmente (CLI)

```bash
cd ~/eraldo/backend
npm run hash-password -- SuaNovaSenhaForte
```

Copie o hash e atualize via SQLite:

```bash
sqlite3 data/eraldo.db
> UPDATE users SET senha_hash = '$2a$10$...COLE_O_HASH...' WHERE email = 'admin@eraldorefrigeracao.com.br';
> .exit
```

---

## Troubleshooting

**502 Bad Gateway**
→ Aplicação Node.js não está rodando. Veja o log no painel. Verifique se `npm install` rodou com sucesso.

**Erro ao instalar dependências**
→ O projeto usa apenas pacotes JavaScript puros (`sql.js` é SQLite em WebAssembly, não precisa de compilação nativa). Se houver erro, confirme que está usando Node 18+ no painel.

**Frontend não carrega (404)**
→ Confirme que `backend/public/index.html` existe no servidor.

**"Token inválido" no login**
→ Limpe o localStorage do navegador (F12 → Application → Local Storage → Limpar).

**Banco "travado" (database is locked)**
→ O `journal_mode = WAL` já está habilitado. Se persistir, reinicie a aplicação.

**Mudei o domínio e o login não funciona**
→ Atualize `CORS_ORIGIN` no `.env` e reinicie.
