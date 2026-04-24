# Eraldo Refrigeração Automotiva

Sistema completo para oficina de refrigeração automotiva:

- **Landing page** pública com WhatsApp, depoimentos, galeria e formulário de orçamento
- **Painel administrativo** para emissão de notas (A4 e bobina térmica 80mm), gestão de clientes, veículos, mecânicos, serviços e relatórios
- **API REST** em Node.js + Express com autenticação JWT e permissões por papel (admin / mecânico / atendente)
- **Banco** SQLite (arquivo único — sem servidor de banco para configurar)

Monorepo:

```
backend/   → API Node/Express + SQLite (banco em backend/data/eraldo.db)
           → Frontend buildado servido de backend/public/
frontend/  → Código-fonte React (Vite) — só necessário se for rebuildar
project/   → Arquivos originais do protótipo (referência visual)
```

**Para deploy, só o `backend/` importa** — o frontend buildado já vem dentro dele em `backend/public/`.

## Desenvolvimento local

### Pré-requisitos
- Node.js 18+

### 1. Backend

```bash
cd backend
cp .env.example .env   # ajuste JWT_SECRET se quiser
npm install
npm run dev            # roda em http://localhost:3001
```

Migrations rodam automaticamente no startup. Banco fica em `backend/data/eraldo.db`.

Usuário demo: `admin@eraldorefrigeracao.com.br` / senha `eraldo123`

Para trocar a senha do admin:
```bash
npm run hash-password -- MinhaSenhaForte
# copie o hash e atualize via SQLite CLI:
# sqlite3 data/eraldo.db
# UPDATE users SET senha_hash = '<hash>' WHERE email = 'admin@eraldorefrigeracao.com.br';
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev            # roda em http://localhost:5173
```

O Vite está configurado com proxy — requisições a `/api/*` são encaminhadas ao backend em `localhost:3001`.

## Deploy na Hostinger (PRONTO PARA SUBIR — UMA PASTA SÓ)

Tudo já está pronto:
- ✅ Frontend buildado e incluído em `backend/public/`
- ✅ `JWT_SECRET` gerado em `backend/.env.production`
- ✅ Banco SQLite — não precisa configurar nada no painel
- ✅ Migrations rodam sozinhas no startup

**Veja o checklist completo em [DEPLOY.md](DEPLOY.md)** — em resumo:

1. Clonar o repo ou fazer upload só da pasta `backend/` para a Hostinger
2. Renomear `.env.production` para `.env` e ajustar `CORS_ORIGIN` com seu domínio
3. Criar aplicação Node.js no hPanel apontando para `backend/src/server.js`
4. Rodar "NPM Install" e clicar em "Iniciar aplicação"

## Estrutura da API

Todas as rotas (exceto `/api/auth/login` e `/api/config/publica`) exigem `Authorization: Bearer <token>`.

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/auth/login` | POST | Login (retorna JWT) |
| `/api/auth/me` | GET | Usuário autenticado |
| `/api/users` | CRUD | Gestão de usuários (admin) |
| `/api/clientes` | CRUD | Clientes (+ `/:id/veiculos`) |
| `/api/mecanicos` | CRUD | Mecânicos |
| `/api/servicos` | CRUD | Serviços padrão |
| `/api/notas` | CRUD | Notas fiscais internas |
| `/api/notas/:id/status` | PATCH | Mudar status de uma nota |
| `/api/dashboard/kpis` | GET | Indicadores do dashboard |
| `/api/dashboard/faturamento` | GET | Receita dos últimos N dias |
| `/api/dashboard/notas-recentes` | GET | Últimas notas |
| `/api/config` | GET/PUT | Configurações da empresa |

## Permissões por papel

- **admin** — acesso total, único que gerencia usuários e edita configurações
- **mecanico** — pode emitir notas, consultar clientes e próprias notas
- **atendente** — pode emitir notas, gerenciar clientes e consultar histórico

## Scripts úteis

**Backend (pasta `backend/`):**
- `npm run dev` — servidor com auto-reload (migrations rodam automaticamente)
- `npm run migrate` — aplica migrations manualmente (raramente precisa)
- `npm run hash-password -- <senha>` — gera hash bcrypt
- `npm run build:frontend` — builda o frontend e copia para `backend/public/`

**Frontend (pasta `frontend/` — só para desenvolvimento):**
- `npm run dev` — dev server com proxy para API (hot reload)
- `npm run build` — build otimizado em `dist/`
- `npm run preview` — preview do build

## Licença

Proprietário. Todos os direitos reservados a Eraldo Refrigeração Automotiva.
