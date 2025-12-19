# Guia de Deployment - GestorPro

## Índice
- [Requisitos](#requisitos)
- [Configuração HTTPS/SSL](#configuração-httpsssl)
- [Deploy com Docker](#deploy-com-docker)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Banco de Dados](#banco-de-dados)
- [Monitoramento](#monitoramento)

## Requisitos

- Docker 20.10+
- Docker Compose 2.0+
- Domínio configurado (para produção)
- Certificado SSL (Let's Encrypt ou comercial)

## Configuração HTTPS/SSL

### Opção 1: Traefik (Recomendado)

Crie um arquivo `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL}"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "letsencrypt:/letsencrypt"
    networks:
      - gestorpro-network

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`${DOMAIN}`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
    networks:
      - gestorpro-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`${DOMAIN}`) && PathPrefix(`/api`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
    environment:
      - NODE_ENV=production
      # ... outras variáveis
    networks:
      - gestorpro-network

volumes:
  letsencrypt:

networks:
  gestorpro-network:
    driver: bridge
```

### Opção 2: Nginx com Certbot

1. Instale o Certbot:
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

2. Obtenha o certificado:
```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

3. Configure o Nginx (`/etc/nginx/sites-available/gestorpro`):
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=63072000" always;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

4. Ative o site:
```bash
sudo ln -s /etc/nginx/sites-available/gestorpro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

5. Configure renovação automática:
```bash
sudo crontab -e
# Adicione:
0 12 * * * /usr/bin/certbot renew --quiet
```

### Opção 3: Cloudflare (Mais Simples)

1. Configure seu domínio no Cloudflare
2. Ative SSL/TLS modo "Full (strict)"
3. Gere um certificado Origin no Cloudflare
4. Configure no servidor:

```nginx
ssl_certificate /etc/ssl/cloudflare/cert.pem;
ssl_certificate_key /etc/ssl/cloudflare/key.pem;
```

## Deploy com Docker

### Produção

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/gestorpro.git
cd gestorpro
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
nano .env
```

3. Inicie os containers:
```bash
docker-compose up -d
```

4. Execute as migrations:
```bash
docker-compose exec backend npx prisma migrate deploy
```

5. Execute o seed (opcional):
```bash
docker-compose exec backend npm run seed
```

### Comandos Úteis

```bash
# Ver logs
docker-compose logs -f

# Reiniciar serviços
docker-compose restart

# Parar tudo
docker-compose down

# Rebuild
docker-compose up -d --build

# Acessar container
docker-compose exec backend sh
```

## Variáveis de Ambiente

### Obrigatórias para Produção

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NODE_ENV` | Ambiente | `production` |
| `DATABASE_URL` | URL do PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret do JWT (min 32 chars) | `gere-um-secret-forte-aqui` |
| `JWT_REFRESH_SECRET` | Secret do Refresh Token | `outro-secret-forte-aqui` |
| `ALLOWED_ORIGINS` | Origens permitidas (CORS) | `https://seu-dominio.com` |

### Opcionais

| Variável | Descrição | Default |
|----------|-----------|---------|
| `PORT` | Porta do backend | `3001` |
| `REDIS_URL` | URL do Redis | - |
| `SENTRY_DSN` | DSN do Sentry | - |
| `SMTP_HOST` | Host do servidor SMTP | - |

### Gerando Secrets Seguros

```bash
# Linux/Mac
openssl rand -base64 48

# Node.js
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

## Banco de Dados

### Backup

```bash
# Backup manual
docker-compose exec postgres pg_dump -U postgres gestorpro > backup.sql

# Restaurar
docker-compose exec -T postgres psql -U postgres gestorpro < backup.sql
```

### Supabase

Se usando Supabase, backups são automáticos. Acesse o dashboard para:
- Visualizar backups
- Restaurar point-in-time
- Exportar dados

## Monitoramento

### Health Checks

- Frontend: `https://seu-dominio.com/health`
- Backend: `https://seu-dominio.com/api/v1/health`

### Logs

```bash
# Backend logs
docker-compose logs -f backend

# Todos os logs
docker-compose logs -f
```

### Sentry (Erros)

1. Crie conta em https://sentry.io
2. Crie um projeto Node.js
3. Configure `SENTRY_DSN` no `.env`

### Uptime Monitoring

Recomendados:
- UptimeRobot (gratuito)
- Pingdom
- StatusCake

Configure para monitorar:
- `https://seu-dominio.com` (frontend)
- `https://seu-dominio.com/api/v1/health` (backend)

## Checklist de Produção

- [ ] HTTPS configurado e funcionando
- [ ] Variáveis de ambiente seguras
- [ ] Backups automáticos configurados
- [ ] Monitoramento de uptime ativo
- [ ] Sentry configurado para erros
- [ ] Rate limiting ajustado
- [ ] CORS configurado corretamente
- [ ] Logs centralizados
- [ ] Firewall configurado
- [ ] DNS configurado corretamente





