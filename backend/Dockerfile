FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

RUN npx prisma generate

COPY . .

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl dumb-init curl

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

RUN mkdir -p /app/logs /app/uploads && \
    chown -R nodejs:nodejs /app

USER nodejs

ENV NODE_ENV=production

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/index.js"]
