# Teste de Conexão - Diagnóstico Completo

## Execute este código no Console do Navegador (F12)

Cole e execute este código completo no console:

```javascript
(async function testConnection() {
  const url = 'https://gerenciadortarefa-production.up.railway.app/api/v1/health';
  console.log('🔍 Testando conexão com:', url);
  console.log('⏱️ Iniciando teste...');
  
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    const elapsed = Date.now() - startTime;
    
    console.log('✅ Resposta recebida em', elapsed + 'ms');
    console.log('📊 Status:', response.status, response.statusText);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📦 Dados:', data);
    
    return { success: true, data, elapsed };
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error('❌ Erro após', elapsed + 'ms');
    console.error('🔴 Tipo de erro:', error.name);
    console.error('🔴 Mensagem:', error.message);
    console.error('🔴 Erro completo:', error);
    
    if (error.name === 'AbortError') {
      console.error('⏰ TIMEOUT: O servidor não respondeu em 10 segundos');
      console.error('💡 Possíveis causas:');
      console.error('   1. Backend está offline');
      console.error('   2. URL está incorreta');
      console.error('   3. Problema de rede/firewall');
    } else if (error.message.includes('CORS')) {
      console.error('🚫 CORS: Requisição bloqueada por política CORS');
      console.error('💡 Solução: Adicione a URL do Vercel em ALLOWED_ORIGINS no Railway');
    } else if (error.message.includes('Failed to fetch')) {
      console.error('🌐 FALHA DE REDE: Não foi possível conectar ao servidor');
      console.error('💡 Possíveis causas:');
      console.error('   1. Backend está offline');
      console.error('   2. URL está incorreta');
      console.error('   3. Problema de DNS');
    }
    
    return { success: false, error: error.message, elapsed };
  }
})();
```

## Teste Alternativo com Axios (se disponível)

Se o fetch não funcionar, tente com axios:

```javascript
// Primeiro, verifique se axios está disponível
if (typeof axios !== 'undefined') {
  axios.get('https://gerenciadortarefa-production.up.railway.app/api/v1/health', {
    timeout: 10000,
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    console.log('✅ Sucesso:', response.data);
  })
  .catch(error => {
    console.error('❌ Erro:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
  });
} else {
  console.log('⚠️ Axios não está disponível no console');
}
```

## Verificar se o Backend está Online

Teste direto no navegador (abra em nova aba):
```
https://gerenciadortarefa-production.up.railway.app/api/v1/health
```

**Resultados esperados:**
- ✅ Se funcionar: Verá um JSON com `{ "status": "healthy", ... }`
- ❌ Se não funcionar: Verá erro de página ou timeout

## Verificar CORS

Execute este teste específico para CORS:

```javascript
fetch('https://gerenciadortarefa-production.up.railway.app/api/v1/health', {
  method: 'OPTIONS',
  mode: 'cors'
})
.then(response => {
  console.log('✅ Preflight OPTIONS funcionou');
  console.log('CORS Headers:', {
    'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
    'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
  });
})
.catch(error => {
  console.error('❌ Preflight falhou:', error);
});
```

## Próximos Passos Baseados no Resultado

### Se der TIMEOUT:
1. Verifique se o backend está rodando no Railway
2. Verifique os logs do Railway
3. Teste a URL diretamente no navegador

### Se der erro de CORS:
1. No Railway, adicione a URL do Vercel em `ALLOWED_ORIGINS`
2. Formato: `https://seu-projeto.vercel.app`
3. Reinicie o serviço no Railway

### Se der "Failed to fetch":
1. Verifique se a URL está correta
2. Verifique se o backend está acessível publicamente
3. Teste a URL diretamente no navegador

