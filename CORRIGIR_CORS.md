# 🔧 Como Corrigir CORS no Railway

## ✅ Sua Configuração Atual

Você tem no Railway:
```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:3001,https://gerenciador-tarefa-sigma.vercel.app
```

## 🔍 Verificações Necessárias

### 1. Confirmar URL do Vercel

**IMPORTANTE:** Verifique se a URL do seu frontend no Vercel está correta:

1. Acesse https://vercel.com
2. Selecione seu projeto
3. Vá em **Deployments**
4. Clique no último deployment
5. **Copie a URL exata** que aparece (algo como `https://seu-projeto.vercel.app`)

**Possíveis URLs:**
- `https://gerenciador-tarefa-sigma.vercel.app` ✅ (se for essa)
- `https://gerenciador-tarefa-sigma-xyz.vercel.app` (pode ter sufixo)
- `https://seu-projeto.vercel.app` (pode ser diferente)

### 2. Atualizar ALLOWED_ORIGINS no Railway

No Railway, vá em **Variables** e atualize `ALLOWED_ORIGINS`:

**Formato correto (sem espaços, separado por vírgula):**
```
http://localhost:3000,http://localhost:5173,http://localhost:3001,https://gerenciador-tarefa-sigma.vercel.app
```

**⚠️ IMPORTANTE:**
- ✅ Sem espaços entre as URLs
- ✅ Separado por vírgula
- ✅ URLs completas com `http://` ou `https://`
- ❌ Não coloque espaços extras
- ❌ Não coloque barra no final (`/`)

### 3. Verificar se o Backend está Rodando

**ANTES de testar CORS, verifique se o backend está respondendo:**

1. No Railway, verifique se o serviço está **Active**
2. Teste diretamente no navegador:
   ```
   https://gerenciadortarefa-production.up.railway.app/health
   ```
3. Se não carregar, o problema **NÃO é CORS**, é que o backend está offline

## 🧪 Teste de CORS

Após atualizar `ALLOWED_ORIGINS` e fazer redeploy no Railway, teste:

### No Console do Navegador (na página do Vercel):

```javascript
fetch('https://gerenciadortarefa-production.up.railway.app/api/v1/health', {
  method: 'GET',
  mode: 'cors',
  credentials: 'omit'
})
.then(r => r.json())
.then(data => console.log('✅ CORS OK:', data))
.catch(error => {
  console.error('❌ Erro:', error);
  if (error.message.includes('CORS')) {
    console.error('🚫 Problema de CORS - Verifique ALLOWED_ORIGINS');
  }
});
```

## 📋 Checklist

- [ ] URL do Vercel confirmada e correta
- [ ] `ALLOWED_ORIGINS` atualizado no Railway (sem espaços)
- [ ] Redeploy feito no Railway após alterar variável
- [ ] Backend está **Active** no Railway
- [ ] Endpoint `/health` responde diretamente no navegador
- [ ] Teste de CORS executado no console

## 🔄 Após Alterar ALLOWED_ORIGINS

1. **Salve a variável** no Railway
2. **Faça redeploy** do serviço no Railway (ou aguarde restart automático)
3. **Aguarde 1-2 minutos** para o backend reiniciar
4. **Teste novamente**

## ⚠️ Problema Principal: Backend Offline

**Lembre-se:** Se o backend não está respondendo (timeout), o problema **NÃO é CORS**. 

Primeiro resolva:
1. ✅ Backend está **Active** no Railway?
2. ✅ Variável `DATABASE_URL` está configurada?
3. ✅ Logs do Railway mostram que o servidor iniciou?

Depois teste CORS.

## 📝 Exemplo de Configuração Correta

```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:3001,https://gerenciador-tarefa-sigma.vercel.app
```

**Sem espaços, sem barras no final, URLs completas.**

