# Guia de Troubleshooting - Erro de Conexão

## Problema: "Erro de conexão. Verifique sua internet e tente novamente."

Este erro ocorre quando o frontend não consegue se conectar ao backend. Siga os passos abaixo para resolver.

## 1. Verificar Variáveis de Ambiente no Vercel

### Passo 1: Acesse o Dashboard do Vercel
1. Vá para https://vercel.com
2. Selecione seu projeto
3. Vá em **Settings** > **Environment Variables**

### Passo 2: Verifique as Variáveis
Certifique-se de que você tem:

```
VITE_API_BASE_URL=https://gerenciadortarefa-production.up.railway.app/api/v1
```

**IMPORTANTE:**
- A URL deve terminar com `/api/v1`
- Não deve ter barra no final: `https://...app/api/v1` ✅ (correto)
- Não deve ser: `https://...app/api/v1/` ❌ (errado)

### Passo 3: Rebuild após alterar variáveis
Após alterar variáveis de ambiente no Vercel:
1. Vá em **Deployments**
2. Clique nos três pontos (...) do último deployment
3. Selecione **Redeploy**

## 2. Verificar Backend no Railway

### ⚠️ PROBLEMA CRÍTICO: Backend não está respondendo (TIMEOUT)

Se você está recebendo timeout, o backend provavelmente está **offline** ou não está iniciando corretamente.

### Passo 1: Verificar Status do Serviço (CRÍTICO)
1. Acesse https://railway.app
2. Selecione seu projeto `gerenciadortarefa-production`
3. **VERIFIQUE SE O SERVIÇO ESTÁ "Active" (verde)**
4. Se estiver **Inactive** ou com erro:
   - Clique em **Deploy** ou **Redeploy**
   - Aguarde o deploy completar
   - **Este é provavelmente o problema!**

### Passo 2: Verificar Logs do Railway (IMPORTANTE)
1. No Railway, vá na aba **Deployments**
2. Clique no último deployment
3. Vá em **View Logs** ou **Logs**
4. Procure por:
   - ✅ `✅ Servidor iniciado com sucesso na porta X` - Backend está rodando
   - ✅ `✅ Servidor HTTP escutando em` - Backend está escutando
   - ❌ Erros de conexão com banco de dados - **Problema de DATABASE_URL**
   - ❌ Erros de variáveis faltando - **Adicione as variáveis**
   - ❌ Erros de porta - **Problema de configuração**

### Passo 3: Verificar a URL do backend
1. No Railway, vá em **Settings** > **Networking**
2. Copie a URL pública (deve ser algo como: `gerenciadortarefa-production.up.railway.app`)
3. **Teste diretamente no navegador:** `https://gerenciadortarefa-production.up.railway.app/health`
4. **Resultados:**
   - ✅ Se retornar JSON: Backend está funcionando
   - ❌ Se não carregar: Backend está offline (veja Passo 1)

### Passo 4: Verificar Variáveis de Ambiente (CRÍTICO)
1. No Railway, vá em **Variables**
2. **Verifique se `DATABASE_URL` existe** - Sem ela o backend não inicia!
3. Verifique outras variáveis obrigatórias:
   - `PORT` (Railway geralmente define automaticamente)
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS` (deve conter URL do Vercel)

### Passo 5: Verificar variável ALLOWED_ORIGINS no Railway
1. No Railway, vá em **Variables**
2. Verifique se existe `ALLOWED_ORIGINS`
3. Deve conter a URL do seu frontend no Vercel, por exemplo:
   ```
   ALLOWED_ORIGINS=https://seu-projeto.vercel.app,http://localhost:5173
   ```
4. Se não existir, adicione:
   ```bash
   railway variables set ALLOWED_ORIGINS="https://seu-projeto.vercel.app,http://localhost:5173"
   ```

## 3. Verificar no Console do Navegador

### Passo 1: Abrir DevTools
1. Pressione `F12` ou `Ctrl+Shift+I` (Windows/Linux) ou `Cmd+Option+I` (Mac)
2. Vá na aba **Console**

### Passo 2: Verificar logs
Ao tentar fazer login, você deve ver:
- `API Base URL configurada: https://...` (confirma que a variável foi carregada)
- `Tentando fazer login em: https://...` (mostra a URL completa)

### Passo 3: Verificar erros
Se houver erros de CORS, você verá:
```
Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy
```

## 4. Testar Conexão Manualmente

### No Console do Navegador
Abra o console e execute:

```javascript
fetch('https://gerenciadortarefa-production.up.railway.app/api/v1/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Resultados possíveis:**
- ✅ Sucesso: O backend está acessível
- ❌ Erro de CORS: Adicione a URL do Vercel em `ALLOWED_ORIGINS` no Railway
- ❌ Erro de rede: O backend pode estar offline ou a URL está incorreta

## 5. Checklist Rápido

- [ ] `VITE_API_BASE_URL` está configurada no Vercel
- [ ] URL termina com `/api/v1` (sem barra no final)
- [ ] Rebuild feito no Vercel após alterar variáveis
- [ ] Backend está **Active** no Railway
- [ ] Endpoint `/api/v1/health` responde corretamente
- [ ] `ALLOWED_ORIGINS` no Railway contém a URL do Vercel
- [ ] Console do navegador mostra a URL correta sendo usada

## 6. Problemas Comuns

### Problema: Variável não está sendo carregada
**Solução:** Variáveis do Vite precisam começar com `VITE_`. Certifique-se de que está usando `VITE_API_BASE_URL` e não `API_BASE_URL`.

### Problema: CORS bloqueando requisições
**Solução:** Adicione a URL exata do seu frontend no Vercel na variável `ALLOWED_ORIGINS` do Railway. Exemplo:
```
ALLOWED_ORIGINS=https://seu-projeto.vercel.app
```

### Problema: Timeout
**Solução:** O timeout foi aumentado para 30 segundos. Se ainda ocorrer, verifique se o backend está respondendo rapidamente.

### Problema: URL incorreta
**Solução:** Verifique se a URL no Vercel corresponde exatamente à URL pública do Railway, incluindo o protocolo `https://`.

## 7. Contato e Suporte

Se o problema persistir após seguir todos os passos:
1. Verifique os logs do Railway (aba **Deployments** > **View Logs**)
2. Verifique os logs do Vercel (aba **Deployments** > selecione o deployment > **Functions**)
3. Compartilhe os erros do console do navegador

