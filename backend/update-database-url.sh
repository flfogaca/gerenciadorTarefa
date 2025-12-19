#!/bin/bash

echo "=========================================="
echo "  Atualizar DATABASE_URL no Railway"
echo "=========================================="
echo ""
echo "Siga estes passos:"
echo ""
echo "1. Acesse: https://supabase.com/dashboard"
echo "2. Selecione seu projeto"
echo "3. Vá em Settings > Database"
echo "4. Clique na aba 'Connection pooling'"
echo "5. Copie a connection string completa"
echo ""
echo "Exemplo do formato esperado:"
echo "postgresql://postgres.xsjstlmbiglwlqugiyxl:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
echo ""
echo "IMPORTANTE: Substitua [PASSWORD] pela senha real: eS7tM9qVzCypndSh"
echo ""
read -p "Cole a connection string completa aqui: " CONNECTION_STRING

if [ -z "$CONNECTION_STRING" ]; then
    echo "❌ Connection string vazia. Operação cancelada."
    exit 1
fi

echo ""
echo "Atualizando DATABASE_URL no Railway..."
railway variables --set "DATABASE_URL=$CONNECTION_STRING"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ DATABASE_URL atualizado com sucesso!"
    echo ""
    echo "O Railway fará um novo deploy automaticamente."
    echo "Acompanhe os logs com: railway logs --follow"
else
    echo ""
    echo "❌ Erro ao atualizar DATABASE_URL"
    exit 1
fi

