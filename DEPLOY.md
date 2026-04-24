# Deploy na Hostinger — Guia Rápido

> **Pré-requisito:** plano Hostinger **Business**, **Cloud Hosting** ou **VPS** com Node.js (planos Premium/Starter compartilhados não suportam).

O frontend já está **buildado** (`frontend/dist/`) e o `.env` já tem o `JWT_SECRET` gerado. Você só precisa:
1. Criar o banco
2. Subir os arquivos
3. Preencher 3 dados no `.env`
4. Iniciar a aplicação

---

## Passo 1 — Criar o banco MySQL no hPanel

1. Acesse **hPanel → Bancos de dados → Bancos de dados MySQL**
2. Clique em **"Criar novo banco"**:
   - Nome do banco: `eraldo_refrigeracao`
   - Usuário: `eraldo_admin`
   - Senha: gere uma forte e **anote**
3. **Anote os 3 valores** que o painel mostrou:
   - `DB_NAME` (ex: `u123456789_eraldo_refrigeracao`)
   - `DB_USER` (ex: `u123456789_eraldo_admin`)
   - `DB_PASSWORD` (a senha que você criou)

---

## Passo 2 — Importar o banco

No hPanel, abra **phpMyAdmin** do banco recém-criado e importe **na ordem**:

1. `backend/migrations/001_schema.sql`
2. `backend/migrations/002_seed.sql`

> Isso cria todas as tabelas e o usuário admin demo.

---

## Passo 3 — Subir os arquivos

Você precisa subir essas duas pastas para o servidor:

- `backend/` (pasta inteira, **sem** `node_modules`)
- `frontend/dist/` (já vem buildada no repo)

### Estrutura recomendada no servidor:

```
/home/u123456789/eraldo/
├── backend/
│   ├── src/
│   ├── migrations/
│   ├── package.json
│   └── .env             ← criado no Passo 4
└── frontend/
    └── dist/
```

**Como subir:**
- **Git (mais fácil):** se a Hostinger tiver Git integrado, clone diretamente: `git clone https://github.com/hilquiasdan/Eraldo---Refrigera-o.git eraldo`
- **FTP:** use FileZilla, arraste as pastas
- **Gerenciador de arquivos do hPanel:** zip → upload → extrair

---

## Passo 4 — Configurar o `.env`

No servidor, vá em `backend/` e:

1. **Renomeie** o arquivo `.env.production` para `.env`
2. **Abra e preencha 3 campos** com os dados anotados no Passo 1:

```env
DB_USER=u123456789_eraldo_admin       ← cole aqui
DB_PASSWORD=SuaSenhaForte             ← cole aqui
DB_NAME=u123456789_eraldo_refrigeracao ← cole aqui
```

E **substitua** o domínio em `CORS_ORIGIN`:
```env
CORS_ORIGIN=https://seudominio.com.br,https://www.seudominio.com.br
```

> O `JWT_SECRET` já vem pronto, não precisa mudar.

---

## Passo 5 — Configurar Node.js no hPanel

1. **hPanel → Avançado → Node.js** (ou "Aplicações Node.js")
2. **"Criar aplicação":**
   - **Versão Node:** 18 ou superior
   - **Modo:** Production
   - **Raiz da aplicação:** `/home/u123456789/eraldo/backend`
   - **URL:** seu domínio
   - **Arquivo de inicialização:** `src/server.js`
3. Clique em **"Salvar"**
4. Clique em **"Run NPM Install"** (ou abra o terminal e rode `npm install --omit=dev`)
5. Clique em **"Iniciar aplicação"**

---

## Passo 6 — Testar

Acesse:
- `https://seudominio.com.br/` → landing page
- `https://seudominio.com.br/api/health` → deve retornar `{"status":"ok"}`
- `https://seudominio.com.br/login` → tela de login

**Login admin:**
- Email: `admin@eraldorefrigeracao.com.br`
- Senha: `eraldo123`

> **IMPORTANTE:** troque a senha do admin imediatamente após o primeiro login.

---

## Passo 7 — SSL (HTTPS)

No hPanel:
- **Domínios → SSL** → ativar **SSL grátis** (Let's Encrypt)
- Marcar **"Forçar HTTPS"**

---

## Trocar a senha do admin

Via SSH (terminal Hostinger):

```bash
cd ~/eraldo/backend
npm run hash-password -- SuaNovaSenhaForte
```

Copie o hash gerado e rode no phpMyAdmin:

```sql
UPDATE users
SET senha_hash = '$2a$10$...COLE_O_HASH_AQUI...'
WHERE email = 'admin@eraldorefrigeracao.com.br';
```

---

## Atualizar o sistema no futuro

```bash
cd ~/eraldo
git pull
cd backend
npm install --omit=dev
# clicar em "Reiniciar aplicação" no painel
```

---

## Troubleshooting

**502 Bad Gateway**
→ Aplicação Node.js não está rodando. Veja o log no painel.

**Erro de conexão com banco**
→ Confira `DB_USER`, `DB_PASSWORD`, `DB_NAME` no `.env`. O usuário precisa ter o prefixo do hPanel (`u123456789_`).

**Frontend não carrega (404)**
→ Confirme que `frontend/dist/index.html` existe. Se não, rode `cd frontend && npm install && npm run build` localmente e faça upload.

**"Token inválido"**
→ Limpe o localStorage do navegador e faça login de novo.
