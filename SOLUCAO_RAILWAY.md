# 🔧 Solução: Railway matando o container

## Problema Identificado

O Railway está encerrando o container logo após iniciar porque:
1. ❌ Health check não está configurado corretamente
2. ❌ CORS está bloqueando (mas não é o problema principal)
3. ❌ O container pode estar sendo encerrado por falta de resposta do health check

## ✅ Correções Aplicadas

### 1. Health Check no Railway
Adicionei configuração de health check no `railway.json`:
```json
{
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100
  }
}
```

### 2. Logs de Debug CORS
Adicionei logs para verificar se `ALLOWED_ORIGINS` está sendo lida corretamente.

## 🔧 Ações Necessárias no Railway

### Passo 1: Atualizar ALLOWED_ORIGINS
No Railway, vá em **Variables** e atualize `ALLOWED_ORIGINS`:

```
http://localhost:3000,http://localhost:5173,http://localhost:3001,https://gerenciador-tarefa-sigma.vercel.app
```

**IMPORTANTE:**
- ✅ Sem espaços entre as URLs
- ✅ URL completa do Vercel com `https://`
- ✅ Separado por vírgula

### Passo 2: Verificar Health Check
O Railway agora vai verificar `/health` para saber se o app está rodando.

### Passo 3: Fazer Redeploy
1. No Railway, vá em **Deployments**
2. Clique em **Redeploy** ou aguarde o próximo deploy automático
3. Aguarde o deploy completar

### Passo 4: Verificar Logs
Após o redeploy, verifique os logs:
- ✅ Deve ver: `✅ Servidor iniciado com sucesso na porta 8080!`
- ✅ Deve ver: `🔐 CORS - Origins permitidas: ...`
- ❌ Se ver `SIGTERM` logo depois: problema de health check

## 🧪 Teste Após Correções

### 1. Teste Health Check Direto
Abra no navegador:
```
https://gerenciadortarefa-production.up.railway.app/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"2025-12-19T..."}
```

### 2. Teste API Health
```
https://gerenciadortarefa-production.up.railway.app/api/v1/health
```

### 3. Teste de CORS no Console
No console do navegador (na página do Vercel):
```javascript
fetch('https://gerenciadortarefa-production.up.railway.app/api/v1/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

## ⚠️ Se Ainda Não Funcionar

### Verificar Variáveis de Ambiente
Certifique-se de que estas variáveis estão configuradas no Railway:
- ✅ `DATABASE_URL` - **OBRIGATÓRIA**
- ✅ `ALLOWED_ORIGINS` - Deve conter URL do Vercel
- ✅ `PORT` - Railway define automaticamente (geralmente 8080)
- ✅ `NODE_ENV=production`

### Verificar Logs do Railway
1. Vá em **Deployments** > **View Logs**
2. Procure por:
   - `✅ Servidor iniciado` - Backend iniciou
   - `🔐 CORS - Origins permitidas` - CORS configurado
   - `SIGTERM` - Container sendo encerrado (problema)
   - Erros de banco de dados

### Se o Container Ainda Estiver Sendo Encerrado

1. **Verifique se o build está completo:**
   - Logs devem mostrar `✅ Servidor iniciado`
   - Não deve ter erros de compilação

2. **Verifique se o health check está respondendo:**
   - Teste `/health` diretamente no navegador
   - Deve retornar JSON imediatamente

3. **Verifique recursos:**
   - Railway pode estar encerrando por falta de recursos
   - Verifique o plano do Railway

## 📋 Checklist Final

- [ ] `railway.json` atualizado com health check
- [ ] `ALLOWED_ORIGINS` atualizado no Railway (com URL do Vercel)
- [ ] Redeploy feito no Railway
- [ ] Logs mostram servidor iniciado
- [ ] `/health` responde no navegador
- [ ] CORS não está bloqueando (logs mostram origins permitidas)
- [ ] Container não está sendo encerrado (não vê SIGTERM logo após iniciar)

## 🆘 Próximos Passos se Persistir

1. **Verifique os logs completos** do Railway
2. **Teste o health check** diretamente
3. **Verifique se há erros** de banco de dados
4. **Contate suporte do Railway** se o problema persistir

