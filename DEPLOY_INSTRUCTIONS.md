# Instruções de Deploy - GestorPro

## Arquitetura de Deploy

```
GitHub Repository
       |
       ├──> Vercel (Frontend React)
       |        └── https://seu-app.vercel.app
       |
       └──> Railway (Backend Node.js + PostgreSQL)
                └── https://seu-backend.railway.app
```

---

## 1. Deploy do Backend no Railway

### 1.1 Configuração Inicial

1. Acesse [railway.app](https://railway.app) e faça login com GitHub
2. Clique em "New Project" > "Deploy from GitHub repo"
3. Selecione o repositório e escolha a pasta `backend`

### 1.2 Variáveis de Ambiente (Railway Dashboard)

Adicione as seguintes variáveis em **Variables**:

```env
# Obrigatórias
DATABASE_URL=<será gerada automaticamente pelo Railway PostgreSQL>
JWT_SECRET=<gere com: openssl rand -base64 64>
JWT_REFRESH_SECRET=<gere com: openssl rand -base64 64>
NODE_ENV=production

# CORS - Adicione seu domínio Vercel
ALLOWED_ORIGINS=https://seu-app.vercel.app,https://www.seu-app.vercel.app

# Opcionais
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=noreply@gestorpro.com

# Features
ENABLE_TWO_FACTOR_AUTH=false
ENABLE_REGISTRATION=true
ENABLE_EMAIL_VERIFICATION=false
```

### 1.3 Adicionar PostgreSQL

1. No projeto Railway, clique em "New" > "Database" > "PostgreSQL"
2. A variável `DATABASE_URL` será adicionada automaticamente
3. As migrations serão executadas automaticamente no deploy

### 1.4 Configurações de Build (railway.json)

O arquivo `railway.json` já está configurado:
- Build: `npm run build && npx prisma generate && npx prisma migrate deploy`
- Start: `npm start`
- Health check: `/api/v1/health`

---

## 2. Deploy do Frontend no Vercel

### 2.1 Configuração Inicial

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em "Add New" > "Project"
3. Importe o repositório
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (raiz do projeto)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.2 Variáveis de Ambiente (Vercel Dashboard)

Adicione em **Settings > Environment Variables**:

```env
VITE_API_BASE_URL=https://seu-backend.railway.app/api/v1
```

### 2.3 Configurações (vercel.json)

O arquivo `vercel.json` já está configurado com:
- Rewrites para SPA (Single Page Application)
- Headers de segurança
- Cache para assets estáticos

---

## 3. Após o Deploy

### 3.1 Testar Conexão

1. Acesse `https://seu-backend.railway.app/health`
2. Deve retornar: `{ "status": "healthy", ... }`

### 3.2 Seed do Banco (Primeira vez)

Se precisar popular o banco com dados iniciais:

```bash
# No Railway, acesse o terminal do serviço
npm run seed
```

### 3.3 Verificar CORS

Se houver erros de CORS:
1. Verifique se `ALLOWED_ORIGINS` no Railway inclui o domínio do Vercel
2. Inclua tanto `https://` quanto `https://www.` se aplicável

---

## 4. CI/CD Automático

O pipeline está configurado em `.github/workflows/ci.yml`:

- ✅ Lint do código
- ✅ Type checking
- ✅ Testes automatizados
- ✅ Build de produção
- ✅ Audit de segurança

### Deploy Automático

- **Push para `main`**: Deploy automático no Railway e Vercel
- **Pull Requests**: Executam CI mas não fazem deploy

---

## 5. URLs Importantes

### Documentação API
- Swagger UI: `https://seu-backend.railway.app/api/v1/docs`
- OpenAPI JSON: `https://seu-backend.railway.app/api/v1/docs.json`

### Health Checks
- Backend: `https://seu-backend.railway.app/health`
- API: `https://seu-backend.railway.app/api/v1/health`

---

## 6. Troubleshooting

### Erro de Conexão Frontend -> Backend

1. Verifique `VITE_API_BASE_URL` no Vercel
2. Verifique `ALLOWED_ORIGINS` no Railway
3. Certifique-se que não há `/` no final das URLs

### Erro de Banco de Dados

1. Verifique se o PostgreSQL está rodando no Railway
2. Execute migrations manualmente: `npx prisma migrate deploy`
3. Verifique a variável `DATABASE_URL`

### Erro de Autenticação

1. Verifique `JWT_SECRET` (mínimo 32 caracteres)
2. Verifique `JWT_REFRESH_SECRET`
3. Ambos devem ser strings seguras e diferentes

---

## 7. Monitoramento

### Railway
- Logs em tempo real no dashboard
- Métricas de CPU/Memória
- Alertas de erro

### Vercel
- Analytics de performance
- Logs de deploy
- Preview de PRs

### Sentry (Opcional)
Configure `SENTRY_DSN` para monitoramento de erros em produção.

---

## 8. Segurança em Produção

✅ **Implementado:**
- JWT com tokens seguros
- Rate limiting
- CORS restrito
- Helmet (headers de segurança)
- Validação de input
- Hash bcrypt para senhas
- 2FA (opcional)

⚠️ **Verificar:**
- [ ] Certificado SSL ativo (Railway e Vercel fornecem automaticamente)
- [ ] Secrets não commitados no Git
- [ ] Variáveis de ambiente configuradas
- [ ] Backups do banco configurados (Supabase/Railway)





