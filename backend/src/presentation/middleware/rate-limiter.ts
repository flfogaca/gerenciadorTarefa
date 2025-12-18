import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from './auth-middleware';

const getKeyGenerator = (type: 'ip' | 'user' | 'tenant' | 'combined') => {
  return (req: Request): string => {
    const authReq = req as AuthenticatedRequest;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    switch (type) {
      case 'ip':
        return ip;
      case 'user':
        return authReq.user?.userId || ip;
      case 'tenant':
        return authReq.user?.tenantId || ip;
      case 'combined':
        return `${authReq.user?.tenantId || 'anon'}_${authReq.user?.userId || ip}`;
      default:
        return ip;
    }
  };
};

const createRateLimitMessage = (retryAfter: number) => ({
  error: 'Too Many Requests',
  message: 'Você excedeu o limite de requisições. Tente novamente mais tarde.',
  retryAfter: Math.ceil(retryAfter / 1000),
});

export const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10),
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
  keyGenerator: getKeyGenerator('ip'),
  message: createRateLimitMessage(900000),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/api/v1/health',
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env['AUTH_RATE_LIMIT_MAX'] || '20', 10),
  keyGenerator: getKeyGenerator('ip'),
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: 900,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: getKeyGenerator('ip'),
  message: {
    error: 'Too Many Requests',
    message: 'Muitas solicitações de recuperação de senha. Aguarde 1 hora.',
    retryAfter: 3600,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: getKeyGenerator('user'),
  message: createRateLimitMessage(60000),
  standardHeaders: true,
  legacyHeaders: false,
});

export const tenantRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  keyGenerator: getKeyGenerator('tenant'),
  message: {
    error: 'Too Many Requests',
    message: 'Seu tenant excedeu o limite de requisições.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: getKeyGenerator('user'),
  message: {
    error: 'Too Many Requests',
    message: 'Limite de uploads atingido. Aguarde 1 hora.',
    retryAfter: 3600,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const reportRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  keyGenerator: getKeyGenerator('user'),
  message: {
    error: 'Too Many Requests',
    message: 'Limite de geração de relatórios atingido. Aguarde 5 minutos.',
    retryAfter: 300,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const createDynamicRateLimiter = (
  windowMs: number,
  maxRequests: number,
  keyType: 'ip' | 'user' | 'tenant' | 'combined' = 'user'
) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    keyGenerator: getKeyGenerator(keyType),
    message: createRateLimitMessage(windowMs),
    standardHeaders: true,
    legacyHeaders: false,
  });
};



