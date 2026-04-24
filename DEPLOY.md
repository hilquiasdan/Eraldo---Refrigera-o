# Deploy na Hostinger

Este guia cobre o deploy em **Hostinger Business, Cloud Hosting ou VPS** — qualquer plano com Node.js habilitado.

> Planos **Premium / Starter compartilhados** geralmente NÃO suportam Node.js persistente. Use Business ou superior.

## 1. Criar o banco MySQL no hPanel

1. Acesse **hPanel → Bancos de dados → Bancos de dados MySQL**
2. Clique em "Criar novo banco":
   - Nome: `eraldo_refrigeracao` (o painel vai prefixar com seu usuário, ex.: `u123_eraldo`)
   - Usuário: `eraldo_admin`
   - Senha: gere uma forte e **anote**
3. Anote também o **host** do MySQL (geralmente `localhost` na Hostinger, mas em alguns planos é um hostname externo — confira no painel)

## 2. Importar o schema

No hPanel, abra **phpMyAdmin** do banco recém-criado e importe os arquivos na ordem:

1. `backend/migrations/001_schema.sql`
2. `backend/migrations/002_seed.sql`

Ou, se você tem SSH: faça upload do projeto e rode `npm run migrate` (mais abaixo).

## 3. Fazer build do frontend

No seu computador, antes de enviar:

```bash
cd frontend
npm install
npm run build
```

Isso gera a pasta `frontend/dist/`. Em produção o backend serve essa pasta automaticamente.

## 4. Enviar os arquivos

Você precisa subir para a Hostinger:
- `backend/` (sem `node_modules`)
- `frontend/dist/` (não precisa do código-fonte do front em produção)

Formas comuns:
- **Git**: se a Hostinger tiver git integrado, clone o repo direto no servidor.
- **FTP**: use FileZilla e arraste as pastas para `public_html/` ou uma pasta fora dele (veja passo 5).
- **SSH + rsync**: `rsync -avz backend frontend/dist user@host:~/eraldo/`

### Estrutura recomendada no servidor

```
/home/u123/eraldo/
├── backend/
│   ├── src/
│   ├── migrations/
│   ├── package.json
│   └── .env              ← criar aqui
└── frontend/
    └── dist/             ← só essa pasta
```

## 5. Configurar Node.js no hPanel

1. Vá em **hPanel → Avançado → Node.js** (ou "Aplicações Node.js")
2. Clique em "Criar aplicação":
   - **Versão Node**: 18 ou superior
   - **Modo**: Production
   - **Raiz da aplicação**: `/home/u123/eraldo/backend`
   - **URL**: seu domínio (ex.: `eraldorefrigeracao.com.br`)
   - **Arquivo de inicialização**: `src/server.js`
3. Salve. O painel vai gerar um virtualenv Node para você.

## 6. Criar o arquivo `.env`

Via SSH ou pelo gerenciador de arquivos, crie `backend/.env`:

```env
NODE_ENV=production
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_USER=u123_eraldo_admin
DB_PASSWORD=SENHA_FORTE_DO_BANCO
DB_NAME=u123_eraldo_refrigeracao

JWT_SECRET=GERE-UMA-STRING-ALEATORIA-DE-PELO-MENOS-32-CARACTERES
JWT_EXPIRES_IN=7d

CORS_ORIGIN=https://eraldorefrigeracao.com.br,https://www.eraldorefrigeracao.com.br
```

> **Gere um JWT_SECRET forte** — execute localmente:
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
> ```

## 7. Instalar dependências e migrar o banco

No painel Node.js, use o terminal integrado — ou por SSH:

```bash
cd ~/eraldo/backend
npm install --omit=dev
npm run migrate        # se ainda não importou pelo phpMyAdmin
```

## 8. Trocar a senha do admin

Ainda no SSH:

```bash
cd ~/eraldo/backend
npm run hash-password -- SuaSenhaFortalEraldo
# copie o hash e rode no phpMyAdmin ou via CLI:
# UPDATE users SET senha_hash='$2a$10$...' WHERE email='admin@eraldorefrigeracao.com.br';
```

## 9. Ajustar o caminho do frontend no backend

Em produção o `backend/src/server.js` serve o frontend buildado de `../../frontend/dist`. Se a sua estrutura no servidor for diferente, ajuste para o caminho correto — ou mantenha a estrutura recomendada.

## 10. Iniciar a aplicação

No painel Node.js, clique em **"Iniciar aplicação"**. Verifique o log — deve aparecer:

```
API rodando em http://localhost:3001
```

A Hostinger faz o proxy do seu domínio para essa porta automaticamente.

## 11. Testar

- `https://seudominio.com.br/` — landing page
- `https://seudominio.com.br/login` — tela de login
- `https://seudominio.com.br/api/health` — deve retornar `{"status":"ok"}`

## 12. Domínio + SSL

No hPanel:
- **Domínios → SSL** → ativar SSL grátis (Let's Encrypt) para o domínio
- Verificar que está redirecionando para HTTPS

## Atualizações futuras

Quando quiser atualizar o sistema:

```bash
# local:
cd frontend && npm run build

# upload da pasta frontend/dist + backend/src (se mudou)
# no servidor:
cd ~/eraldo/backend
npm install --omit=dev     # só se package.json mudou
# clicar em "Reiniciar aplicação" no painel Node.js
```

## Backup do banco

Configure backups automáticos em **hPanel → Bancos de dados → Backups** OU faça manualmente:

```bash
mysqldump -h localhost -u u123_eraldo_admin -p u123_eraldo_refrigeracao > backup.sql
```

## Troubleshooting

**502 Bad Gateway**
- Aplicação Node.js não está rodando — verifique o log no painel
- A porta configurada no `.env` bate com a do painel?

**Erro de conexão com banco**
- `DB_HOST` correto? Na Hostinger geralmente é `localhost`, mas alguns planos usam um host externo
- O usuário do banco tem permissão? Precisa ser o mesmo criado no passo 1

**"Token inválido"**
- `JWT_SECRET` mudou depois que o usuário fez login — ele precisa logar de novo

**Não consigo acessar o admin**
- Limpe o localStorage do navegador (`eraldo.token`, `eraldo.user`)
- Senha hash no banco está correta? Rode o `hash-password` de novo

## Suporte Hostinger específico

A interface Node.js da Hostinger pode variar. O essencial é:
1. Apontar para a pasta `backend/`
2. Arquivo inicial `src/server.js`
3. Variáveis de ambiente via `.env`
4. Banco MySQL criado pelo hPanel
5. Proxy reverso do domínio → porta Node

Se tiver dúvida, a FAQ "Como hospedar Node.js" na base de conhecimento da Hostinger cobre o básico.
