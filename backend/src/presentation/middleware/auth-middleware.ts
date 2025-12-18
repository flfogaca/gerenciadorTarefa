import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { injectable } from 'inversify';
import { ILogger } from '@/shared/logging/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userId: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

@injectable()
export class AuthMiddleware {
  constructor(private readonly logger: ILogger) {}

  static create() {
    const _logger = new (require('@/shared/logging/logger').Logger)();
    return new AuthMiddleware(_logger).authenticate;
  }

  authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // Rotas públicas que não precisam de autenticação
      const publicRoutes = [
        '/health',
        '/api/v1/health',
        '/api/v1/users/auth/login'
      ];

      if (publicRoutes.includes(req.path)) {
        return next();
      }

      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authorization header is required'
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      if (!token) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Token is required'
        });
        return;
      }

      // Verificar e decodificar o token
      const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as any;
      
      // Adicionar informações do usuário à requisição
      req.user = {
        id: decoded.id,
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        tenantId: decoded.tenantId
      };

      // Log da autenticação
      this.logger.info('User authenticated', {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        tenantId: decoded.tenantId,
        requestId: req.headers['x-request-id']
      });

      next();
    } catch (error) {
      this.logger.warn('Authentication failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: req.headers['x-request-id'],
        url: req.url,
        method: req.method
      });

      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid token'
        });
        return;
      }

      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Token expired'
        });
        return;
      }

      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication failed'
      });
    }
  };

  // Middleware opcional de autenticação (não falha se não houver token)
  static optional() {
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
      try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as any;
          
          req.user = {
            id: decoded.id,
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            tenantId: decoded.tenantId
          };
        }
        
        next();
      } catch (error) {
        // Em caso de erro, apenas continua sem usuário autenticado
        next();
      }
    };
  }

  // Middleware para verificar se o usuário tem um role específico
  static requireRole(requiredRole: string) {
    const _logger = new (require('@/shared/logging/logger').Logger)();
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
      if (!req.user) {
        _res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      if (req.user.role !== requiredRole && req.user.role !== 'SUPER_ADMIN') {
        _logger.warn('Insufficient permissions', {
          userId: req.user.userId,
          userRole: req.user.role,
          requiredRole,
          requestId: req.headers['x-request-id']
        });

        _res.status(403).json({
          error: 'Forbidden',
          message: `Role '${requiredRole}' is required`
        });
        return;
      }

      next();
    };
  }

  // Middleware para verificar se o usuário pertence ao tenant
  static requireTenant() {
    const _logger = new (require('@/shared/logging/logger').Logger)();
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
      if (!req.user) {
        _res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      const requestTenantId = req.headers['x-tenant-id'] as string;
      
      if (!requestTenantId) {
        _res.status(400).json({
          error: 'Bad Request',
          message: 'Tenant ID is required'
        });
        return;
      }

      if (req.user.tenantId !== requestTenantId && req.user.role !== 'SUPER_ADMIN') {
        _logger.warn('Tenant access denied', {
          userId: req.user.userId,
          userTenantId: req.user.tenantId,
          requestTenantId,
          requestId: req.headers['x-request-id']
        });

        _res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied for this tenant'
        });
        return;
      }

      next();
    };
  }
}
