#!/bin/bash

echo "🔍 Verificando configuração para Railway..."
echo ""

ERRORS=0

if [ ! -f "railway.json" ]; then
  echo "❌ railway.json não encontrado"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ railway.json encontrado"
fi

if [ ! -f "package.json" ]; then
  echo "❌ package.json não encontrado"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ package.json encontrado"
  
  if grep -q '"build"' package.json; then
    echo "✅ Script de build encontrado no package.json"
  else
    echo "⚠️  Script de build não encontrado no package.json"
  fi
  
  if grep -q '"start"' package.json; then
    echo "✅ Script de start encontrado no package.json"
  else
    echo "❌ Script de start não encontrado no package.json"
    ERRORS=$((ERRORS + 1))
  fi
fi

if [ ! -f "Dockerfile" ]; then
  echo "⚠️  Dockerfile não encontrado (Railway usará Nixpacks)"
else
  echo "✅ Dockerfile encontrado"
fi

if [ ! -f "nixpacks.toml" ]; then
  echo "⚠️  nixpacks.toml não encontrado (opcional)"
else
  echo "✅ nixpacks.toml encontrado"
fi

if [ ! -f "prisma/schema.prisma" ]; then
  echo "❌ prisma/schema.prisma não encontrado"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Prisma schema encontrado"
fi

if [ ! -f ".railwayignore" ]; then
  echo "⚠️  .railwayignore não encontrado (recomendado)"
else
  echo "✅ .railwayignore encontrado"
fi

if [ ! -f ".dockerignore" ]; then
  echo "⚠️  .dockerignore não encontrado (opcional)"
else
  echo "✅ .dockerignore encontrado"
fi

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "✅ Configuração completa! Pronto para deploy no Railway."
else
  echo "❌ Encontrados $ERRORS erro(s). Corrija antes de fazer deploy."
fi

exit $ERRORS

