#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "🚂 Deploy do Backend no Railway"
echo "================================"
echo ""

echo "1️⃣  Fazendo login no Railway..."
railway login

echo ""
echo "2️⃣  Vincular projeto..."
railway link

echo ""
echo "3️⃣  Configurando variáveis de ambiente..."

railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set JWT_EXPIRES_IN=24h
railway variables set JWT_REFRESH_EXPIRES_IN=7d
railway variables set RATE_LIMIT_WINDOW_MS=900000
railway variables set RATE_LIMIT_MAX_REQUESTS=100
railway variables set AUTH_RATE_LIMIT_MAX=20
railway variables set BCRYPT_ROUNDS=12

echo ""
echo "4️⃣  Gerando e configurando secrets..."

JWT_SECRET=$(openssl rand -base64 64)
JWT_REFRESH=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 64)

railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set JWT_REFRESH_SECRET="$JWT_REFRESH"
railway variables set SESSION_SECRET="$SESSION_SECRET"

echo ""
read -p "5️⃣  Digite a URL do seu frontend para ALLOWED_ORIGINS: " FRONTEND_URL
if [ ! -z "$FRONTEND_URL" ]; then
  railway variables set ALLOWED_ORIGINS="$FRONTEND_URL"
  echo "✅ ALLOWED_ORIGINS configurado"
fi

echo ""
echo "6️⃣  Fazendo deploy..."
railway up

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📊 Status:"
railway status
echo ""
echo "🌐 URL:"
railway domain

