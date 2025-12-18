#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "🚂 Deploy do Backend no Railway"
echo "================================"
echo ""

echo "1️⃣  Fazendo login no Railway (abrirá navegador)..."
railway login

echo ""
echo "2️⃣  Listando projetos disponíveis..."
railway list

echo ""
echo "3️⃣  Vincular projeto existente..."
railway link

echo ""
echo "4️⃣  Verificando variáveis de ambiente..."
echo "Configurando variáveis básicas..."

railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set JWT_EXPIRES_IN=24h
railway variables set JWT_REFRESH_EXPIRES_IN=7d
railway variables set RATE_LIMIT_WINDOW_MS=900000
railway variables set RATE_LIMIT_MAX_REQUESTS=100
railway variables set AUTH_RATE_LIMIT_MAX=20
railway variables set BCRYPT_ROUNDS=12

echo ""
echo "5️⃣  Gerando secrets..."
JWT_SECRET=$(openssl rand -base64 64)
JWT_REFRESH=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 64)

railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set JWT_REFRESH_SECRET="$JWT_REFRESH"
railway variables set SESSION_SECRET="$SESSION_SECRET"

echo ""
echo "⚠️  IMPORTANTE: Configure ALLOWED_ORIGINS:"
echo "   railway variables set ALLOWED_ORIGINS=https://seu-frontend.vercel.app"
echo ""

read -p "Digite a URL do seu frontend para ALLOWED_ORIGINS (ou Enter para pular): " FRONTEND_URL
if [ ! -z "$FRONTEND_URL" ]; then
  railway variables set ALLOWED_ORIGINS="$FRONTEND_URL"
  echo "✅ ALLOWED_ORIGINS configurado: $FRONTEND_URL"
fi

echo ""
echo "6️⃣  Fazendo deploy..."
railway up

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📊 Status do serviço:"
railway status

echo ""
echo "🌐 URL do serviço:"
railway domain

echo ""
echo "📋 Para ver logs: railway logs"
echo "📋 Para abrir dashboard: railway open"

