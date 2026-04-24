# Eraldo Refrigeração Automotiva

Sistema completo para oficina de refrigeração automotiva:

- **Landing page** pública com WhatsApp, depoimentos, galeria e formulário de orçamento
- **Painel administrativo** para emissão de notas (A4 e bobina térmica 80mm), gestão de clientes, veículos, mecânicos, serviços e relatórios
- **API REST** em Node.js + Express com autenticação JWT e permissões por papel (admin / mecânico / atendente)
- **Banco** SQLite em JavaScript puro (sql.js + WebAssembly) — arquivo único, zero configuração

## Estrutura

```
eraldo/                ← raiz do projeto (é o que sobe na Hostinger)
├── src/               → código da API (rotas, middleware, db)
├── migrations/        → schema SQL e dados iniciais
├── public/            → frontend React já compilado (servido pelo Express)
├── frontend/          → código-fonte React (só necessário se for editar o visual)
├── package.json
├── .env.production    → template de produção
└── data/              → banco SQLite (gerado automaticamente)
```

**Para deploy basta apontar a Hostinger para esta pasta inteira.** Não há subpastas de backend/frontend separadas.

## Desenvolvimento local

### Pré-requisitos
- Node.js 18+

### Rodar o backend
```bash
cp .env.example .env   # ajustar JWT_SECRET se quiser
npm install
npm run dev            # inicia API em http://localhost:3001
```

Migrations rodam automaticamente na primeira execução.

Login: `AdminAr` / `86671266Hh@` ou `Eraldomot` / `Heloisa123`

### Rodar o frontend em modo dev (hot-reload)
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173 (com proxy para :3001)
```

### Rebuildar o frontend para produção
Da raiz:
```bash
npm run build:frontend   # builda e copia para ./public
```

## Deploy na Hostinger

Veja **[DEPLOY.md](DEPLOY.md)** para o guia completo. Resumo:

1. Clonar o repo na Hostinger (ou baixar ZIP e extrair)
2. Renomear `.env.production` para `.env` e ajustar `CORS_ORIGIN`
3. Criar aplicação Node.js no hPanel apontando para a pasta raiz, arquivo `src/server.js`
4. Rodar "NPM Install" e clicar em "Iniciar aplicação"

## API

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

## Permissões

- **admin** — acesso total
- **mecanico** — emite notas, consulta clientes e suas próprias notas
- **atendente** — emite notas, gerencia clientes

## Scripts

- `npm run dev` — servidor com auto-reload
- `npm run start` — servidor em produção
- `npm run migrate` — aplica migrations manualmente (normalmente automático)
- `npm run hash-password -- <senha>` — gera hash bcrypt para trocar senha manualmente
- `npm run build:frontend` — rebuilda o frontend e copia para `./public`

## Licença

Proprietário. Todos os direitos reservados a Eraldo Refrigeração Automotiva.
