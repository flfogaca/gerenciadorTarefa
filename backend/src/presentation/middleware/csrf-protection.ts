import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf-token';

const tokens = new Map<string, { token: string; expires: number }>();

export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

export function csrfProtection(options: {
  ignoreMethods?: string[];
  ignorePaths?: string[];
} = {}) {
  const ignoreMethods = options.ignoreMethods || ['GET', 'HEAD', 'OPTIONS'];
  const ignorePaths = options.ignorePaths || ['/api/v1/users/auth/login', '/api/v1/users/auth/refresh', '/api/v1/health'];

  return (req: Request, res: Response, next: NextFunction): void => {
    if (ignoreMethods.includes(req.method)) {
      next();
      return;
    }

    const shouldIgnore = ignorePaths.some(path => req.path.startsWith(path));
    if (shouldIgnore) {
      next();
      return;
    }

    const tokenFromHeader = req.headers[CSRF_HEADER_NAME] as string;
    const tokenFromCookie = req.cookies?.[CSRF_COOKIE_NAME];

    if (!tokenFromHeader && !tokenFromCookie) {
      res.status(403).json({
        error: 'CSRF token missing',
        message: 'CSRF protection: token not found'
      });
      return;
    }

    if (tokenFromHeader !== tokenFromCookie) {
      res.status(403).json({
        error: 'CSRF token mismatch',
        message: 'CSRF protection: token validation failed'
      });
      return;
    }

    next();
  };
}

export function csrfTokenGenerator() {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const token = generateCSRFToken();
    
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 3600000
    });

    res.setHeader('X-CSRF-Token', token);
    next();
  };
}

export function getCSRFToken(req: Request, res: Response): void {
  const token = generateCSRFToken();
  const sessionId = req.headers['authorization'] || req.ip || 'anonymous';
  
  tokens.set(sessionId, {
    token,
    expires: Date.now() + 3600000
  });

  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'strict',
    maxAge: 3600000
  });

  res.json({ csrfToken: token });
}

export function validateCSRFToken(req: Request, res: Response, next: NextFunction): void {
  const tokenFromHeader = req.headers[CSRF_HEADER_NAME] as string;
  const sessionId = req.headers['authorization'] || req.ip || 'anonymous';
  
  const stored = tokens.get(sessionId);
  
  if (!stored || stored.expires < Date.now()) {
    res.status(403).json({
      error: 'CSRF token expired',
      message: 'Please refresh your CSRF token'
    });
    return;
  }

  if (stored.token !== tokenFromHeader) {
    res.status(403).json({
      error: 'CSRF token invalid',
      message: 'CSRF validation failed'
    });
    return;
  }

  tokens.delete(sessionId);
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of tokens.entries()) {
    if (value.expires < now) {
      tokens.delete(key);
    }
  }
}, 300000);
