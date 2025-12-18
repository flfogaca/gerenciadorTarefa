#!/bin/bash

set -e

echo "🚂 Deploy do Backend GestorPro no Railway"
echo "=========================================="
echo ""

cd "$(dirname "$0")"

if ! command -v railway &> /dev/null; then
  echo "❌ Railway CLI não encontrado. Instalando..."
  npm install -g @railway/cli
fi

echo "📋 Verificando login..."
if ! railway whoami &> /dev/null; then
  echo "⚠️  Você precisa fazer login primeiro."
  echo "   Execute: railway login"
  echo "   Isso abrirá seu navegador para autenticação."
  exit 1
fi

echo "✅ Logado no Railway"
echo ""

echo "📦 Listando projetos disponíveis..."
railway list

echo ""
echo "🔗 Vincular projeto..."
echo "   Se você já tem um projeto, selecione-o na lista acima"
echo "   Ou execute: railway link"
echo ""

read -p "Deseja vincular um projeto agora? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  railway link
fi

echo ""
echo "🔍 Verificando projeto vinculado..."
if [ ! -f ".railway/project.json" ]; then
  echo "❌ Projeto não vinculado. Execute: railway link"
  exit 1
fi

echo "✅ Projeto vinculado"
echo ""

echo "🌍 Configurando variáveis de ambiente..."
echo "   Verificando se DATABASE_URL está configurado..."

if railway variables get DATABASE_URL &> /dev/null; then
  echo "✅ DATABASE_URL encontrado"
else
  echo "⚠️  DATABASE_URL não encontrado"
  echo "   Certifique-se de ter um serviço PostgreSQL no Railway"
  echo "   O Railway deve criar automaticamente a variável DATABASE_URL"
fi

echo ""
echo "📝 Variáveis de ambiente necessárias:"
echo "   - NODE_ENV=production"
echo "   - JWT_SECRET (gerar com: openssl rand -base64 64)"
echo "   - JWT_REFRESH_SECRET (gerar com: openssl rand -base64 64)"
echo "   - SESSION_SECRET (gerar com: openssl rand -base64 64)"
echo "   - ALLOWED_ORIGINS (URL do seu frontend)"
echo ""
echo "   Para adicionar variáveis, execute:"
echo "   railway variables set NOME_VARIAVEL=valor"
echo ""

read -p "Deseja configurar variáveis agora? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
  echo ""
  echo "Gerando secrets..."
  JWT_SECRET=$(openssl rand -base64 64)
  JWT_REFRESH=$(openssl rand -base64 64)
  SESSION_SECRET=$(openssl rand -base64 64)
  
  echo "Configurando variáveis..."
  railway variables set NODE_ENV=production
  railway variables set JWT_SECRET="$JWT_SECRET"
  railway variables set JWT_REFRESH_SECRET="$JWT_REFRESH"
  railway variables set SESSION_SECRET="$SESSION_SECRET"
  railway variables set JWT_EXPIRES_IN=24h
  railway variables set JWT_REFRESH_EXPIRES_IN=7d
  railway variables set PORT=3001
  railway variables set RATE_LIMIT_WINDOW_MS=900000
  railway variables set RATE_LIMIT_MAX_REQUESTS=100
  railway variables set AUTH_RATE_LIMIT_MAX=20
  railway variables set BCRYPT_ROUNDS=12
  
  echo ""
  echo "⚠️  IMPORTANTE: Configure ALLOWED_ORIGINS com a URL do seu frontend:"
  echo "   railway variables set ALLOWED_ORIGINS=https://seu-frontend.vercel.app"
  echo ""
fi

echo ""
echo "🚀 Iniciando deploy..."
echo ""

railway up

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "🔍 Verificando status..."
railway status

echo ""
echo "🌐 Para ver os logs:"
echo "   railway logs"
echo ""
echo "🔗 Para ver a URL do serviço:"
echo "   railway domain"
echo ""

