# Deploy na Hostinger — Guia Definitivo

> ⚠️ **Pré-requisito:** plano Hostinger **Business**, **Cloud Hosting** ou **VPS** (Premium e Starter NÃO suportam Node.js persistente).

✅ **Zero configuração** — sobe os arquivos, aponta o painel e clica em iniciar
✅ **JWT_SECRET auto-gerado** no primeiro startup
✅ **Banco SQLite criado automaticamente**
✅ **Sem compilação nativa** (sql.js puro JavaScript)
✅ **Frontend já vem buildado** dentro do projeto

---

## Passo a passo (siga em ordem)

### 1️⃣ Baixar o projeto do GitHub

- Acesse https://github.com/hilquiasdan/Eraldo---Refrigera-o
- Clique no botão verde **"Code"** → **"Download ZIP"**
- Vai baixar `Eraldo---Refrigera-o-main.zip` (~2MB)

### 2️⃣ Subir o ZIP na Hostinger

1. hPanel → **Gerenciador de Arquivos**
2. Vá para a pasta `domains/seudominio/public_html/` OU `/home/SEU_USUARIO/` (preferência: fora do public_html para segurança)
3. Clique em **Upload Files** → escolha o ZIP
4. Aguarde upload (alguns segundos)

### 3️⃣ Extrair o ZIP no servidor

1. Clique com o botão direito no ZIP → **Extract**
2. Vai criar uma pasta tipo `Eraldo---Refrigera-o-main/`
3. **Renomeie essa pasta para `eraldo`** (clique direito → Rename)
4. **Apague o ZIP** (não precisa mais)

### 4️⃣ Criar a aplicação Node.js no painel

1. hPanel → **Avançado** → **Node.js** (ou "Setup Node.js App")
2. Clique em **"Create Application"** / **"Criar aplicação"**
3. Configure:

| Campo | Valor |
|-------|-------|
| **Node.js version** | **20.x** (mais recente disponível) |
| **Application mode** | **Production** |
| **Application root** | `eraldo` (ou caminho completo `/home/SEU_USUARIO/eraldo`) |
| **Application URL** | seu domínio principal |
| **Application startup file** | `app.js` |

4. Clique em **Create** / **Criar**

### 5️⃣ Instalar dependências

No painel da aplicação Node.js que acabou de criar:

1. Procure o botão **"Run NPM Install"** (ou "Install" / "Executar npm install")
2. Clique e aguarde 1-2 minutos
3. Quando terminar deve aparecer "Success" ou similar

> Se não tem botão visível, abra o **terminal SSH** (se disponível):
> ```bash
> cd ~/eraldo
> npm install --omit=dev
> ```

### 6️⃣ Iniciar a aplicação

No mesmo painel:
- Clique em **"Start application"** / **"Iniciar aplicação"**

### 7️⃣ Verificar que subiu

Acesse no navegador: `https://seudominio.com.br/api/health`

Deve retornar:
```json
{"status":"ok","timestamp":"..."}
```

Se retornou isso, **está funcionando**. Acesse:
- `https://seudominio.com.br/` — landing page
- `https://seudominio.com.br/login` — tela de login

**Login:**
- `AdminAr` / `86671266Hh@`
- `Eraldomot` / `Heloisa123`

---

## 🔧 Se NÃO funcionou

### Diagnóstico rápido

**1. Veja os logs da aplicação no painel**

No painel Node.js, procure por **"Logs"** ou **"View logs"**. Os primeiros 20 logs já dizem tudo:

✅ **Logs de sucesso esperados:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Eraldo Refrigeração — iniciando servidor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ .env.production carregado
✓ JWT_SECRET gerado e salvo em data/.jwt-secret
✓ Frontend servido de /home/.../eraldo/public
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✓ API rodando na porta XXXX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Problemas comuns

#### ❌ "Cannot find module 'express'"
**Causa:** `npm install` não rodou (ou falhou).
**Solução:** Clique em **"Run NPM Install"** no painel. Aguarde até terminar.

#### ❌ "ERR_MODULE_NOT_FOUND: ./src/server.js"
**Causa:** O painel está apontando para uma pasta errada.
**Solução:** Confira se "Application root" é `eraldo` (e dentro dela existem `src/`, `migrations/`, `public/`, `app.js`).

#### ❌ "EACCES" ao instalar
**Causa:** Não vai mais acontecer — usamos `sql.js` (puro JavaScript).
Se acontecer com outro pacote, contate suporte Hostinger pedindo permissão para `npm install`.

#### ❌ Frontend abre mas API retorna CORS error
**Causa:** Domínio configurado errado no `.env`.
**Solução:** O sistema está configurado para aceitar **qualquer origem** por padrão se você não mexer no `.env`. Se mexeu, abra `.env` ou `.env.production` e:
- Ou apague o valor de `CORS_ORIGIN=` (deixa vazio = aceita tudo)
- Ou coloque seu domínio: `CORS_ORIGIN=https://seudominio.com.br,https://www.seudominio.com.br`
- Reinicie a aplicação no painel

#### ❌ Página em branco / 502 Bad Gateway
**Causa:** A aplicação Node não está rodando.
**Solução:**
1. Veja os logs (se tem erro, copie a mensagem completa)
2. Confira se "Application startup file" é `app.js`
3. Tente parar e iniciar de novo

#### ❌ "Estrutura aninhada" (subpasta dentro de subpasta)
Verifique a estrutura no servidor:
```bash
# Estrutura CORRETA:
eraldo/
├── app.js              ← entry point
├── src/
├── migrations/
├── public/
└── package.json

# Estrutura ERRADA:
eraldo/
└── Eraldo---Refrigera-o-main/   ← subpasta sobrando
    ├── app.js
    ├── src/
    └── ...
```

Se está errada: entre na subpasta interna, mova todo o conteúdo para a pasta acima, apague a vazia.

---

## 📂 Estrutura no servidor (referência)

```
/home/SEU_USUARIO/eraldo/
├── app.js                  ← arquivo de inicialização (apontar aqui no painel)
├── src/                    ← código da API
│   ├── server.js
│   ├── db/
│   ├── middleware/
│   └── routes/
├── migrations/             ← SQL inicial
├── public/                 ← frontend buildado
├── frontend/               ← código-fonte (não precisa em produção)
├── package.json
├── .env.production         ← config (servidor lê isso automaticamente)
└── data/                   ← banco SQLite (criado em runtime, NÃO apague depois)
    ├── eraldo.db
    └── .jwt-secret
```

---

## 🔄 Atualizar o sistema no futuro

Via SSH (se disponível):
```bash
cd ~/eraldo
git pull
npm install --omit=dev    # só se package.json mudou
# painel: "Restart application"
```

Sem SSH:
1. Baixe o ZIP novo do GitHub
2. Faça upload
3. Substitua os arquivos `src/`, `public/`, `package.json`, `migrations/`
4. **NÃO substitua a pasta `data/`** (perde os dados!)
5. Reinicie a aplicação no painel

---

## 💾 Backup do banco

O banco é o arquivo `data/eraldo.db`. Para fazer backup:

Via SSH:
```bash
cp ~/eraldo/data/eraldo.db ~/backups/eraldo-$(date +%F).db
```

Via Gerenciador de Arquivos: clique direito no `data/eraldo.db` → Download.

Ou agendar backup automático em **hPanel → Backups**.

---

## 🔐 Trocar senha do admin

**Forma 1 — pelo painel (mais fácil):**
- Faça login
- Vá em "Usuários" no menu
- Edite o usuário e defina nova senha

**Forma 2 — via terminal SSH:**
```bash
cd ~/eraldo
npm run hash-password -- SuaNovaSenhaForte
# copie o hash gerado
```

Depois, abra o banco e atualize:
```bash
node -e "
import('./src/db/pool.js').then(async ({query}) => {
  await query('UPDATE users SET senha_hash = ? WHERE nome = ?',
    ['COLE-O-HASH-AQUI', 'AdminAr']);
  console.log('Atualizado');
  process.exit(0);
});
"
```

---

## 📞 Login do sistema

Após subir, acesse `https://seudominio.com.br/login`:

| Usuário | Senha |
|---------|-------|
| `AdminAr` | `86671266Hh@` |
| `Eraldomot` | `Heloisa123` |

Ambos têm acesso total (admin).
