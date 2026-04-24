# Eraldo Refrigeração Automotiva

Sistema completo para oficina de refrigeração automotiva:

- **Landing page** pública com WhatsApp, depoimentos, galeria e formulário de orçamento
- **Painel administrativo** para emissão de notas (A4 e bobina térmica 80mm), gestão de clientes, veículos, mecânicos, serviços e relatórios
- **API REST** em Node.js + Express com autenticação JWT e permissões por papel (admin / mecânico / atendente)
- **Banco** MySQL

Monorepo:

```
backend/   → API Node/Express + MySQL
frontend/  → SPA React (Vite) com landing + admin
project/   → Arquivos originais do protótipo (referência visual)
```

## Desenvolvimento local

### Pré-requisitos
- Node.js 18+
- MySQL 8+

### 1. Configurar o banco

```bash
mysql -u root -p
```
```sql
CREATE DATABASE eraldo_refrigeracao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'eraldo'@'localhost' IDENTIFIED BY 'senhaforte';
GRANT ALL ON eraldo_refrigeracao.* TO 'eraldo'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # edite com suas credenciais MySQL e JWT_SECRET
npm install
npm run migrate        # cria tabelas + dados iniciais
npm run dev            # roda em http://localhost:3001
```

Usuário demo: `admin@eraldorefrigeracao.com.br` / senha `eraldo123`

Para trocar a senha do admin:
```bash
npm run hash-password -- MinhaSenhaForte
# copie o hash e rode:
# UPDATE users SET senha_hash = '<hash>' WHERE email = 'admin@eraldorefrigeracao.com.br';
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev            # roda em http://localhost:5173
```

O Vite está configurado com proxy — requisições a `/api/*` são encaminhadas ao backend em `localhost:3001`.

## Deploy na Hostinger (PRONTO PARA SUBIR)

O frontend já está **buildado** (`frontend/dist/`) e o `.env.production` já tem o `JWT_SECRET` gerado.

**Veja o checklist completo em [DEPLOY.md](DEPLOY.md)** — em resumo:

1. Criar banco MySQL no hPanel
2. Importar `backend/migrations/001_schema.sql` e `002_seed.sql` no phpMyAdmin
3. Fazer upload das pastas `backend/` e `frontend/dist/`
4. Renomear `backend/.env.production` para `backend/.env` e preencher 3 dados do banco
5. Configurar Node.js no painel apontando para `backend/src/server.js` → Iniciar

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

**Backend:**
- `npm run dev` — servidor com auto-reload
- `npm run migrate` — aplica schema + seeds
- `npm run hash-password -- <senha>` — gera hash bcrypt

**Frontend:**
- `npm run dev` — dev server com proxy para API
- `npm run build` — build otimizado em `dist/`
- `npm run preview` — preview do build

## Licença

Proprietário. Todos os direitos reservados a Eraldo Refrigeração Automotiva.
