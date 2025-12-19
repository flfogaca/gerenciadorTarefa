#!/bin/bash

echo "=========================================="
echo "  Verificar Configuração do Redis"
echo "=========================================="
echo ""

echo "📋 Verificando variáveis do Redis..."
railway variables | grep -i redis

echo ""
echo "✅ Se você vê REDIS_URL acima, o Redis está configurado!"
echo ""
echo "Se não aparecer nada, siga estes passos:"
echo "1. Acesse: https://railway.app/dashboard"
echo "2. Selecione o projeto 'Gerenciador De Tarefas'"
echo "3. Clique em 'New' → 'Database' → 'Redis'"
echo "4. Aguarde o Redis ser criado"
echo "5. Execute este script novamente"
echo ""

