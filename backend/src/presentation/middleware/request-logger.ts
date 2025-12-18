import { Request, Response, NextFunction } from 'express';
import { injectable } from 'inversify';
import { ILogger } from '@/shared/logging/logger';

@injectable()
export class RequestLogger {
  constructor(private readonly logger: ILogger) {}

  static create() {
    const logger = new (require('@/shared/logging/logger').Logger)();
    return new RequestLogger(logger).logRequest;
  }

  logRequest = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const logger = this.logger;
    
    // Adicionar request ID ao header da resposta
    res.setHeader('X-Request-ID', requestId);
    req.headers['x-request-id'] = requestId;

    // Log da requisição recebida
    logger.info('Request received', {
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      contentType: req.get('Content-Type'),
      contentLength: req.get('Content-Length'),
      tenantId: req.headers['x-tenant-id'],
      userId: (req as any).user?.id
    });

    // Interceptar o método end da resposta para logar o tempo de resposta
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      const responseTime = Date.now() - startTime;
      
      // Log da resposta
      logger.info('Request completed', {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`
      });
      
      // Chamar o método original
      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };

  // Middleware para logar apenas requisições importantes
  static logImportantRequests() {
    const logger = new (require('@/shared/logging/logger').Logger)();
    return (req: Request, res: Response, next: NextFunction) => {
      const importantPaths = ['/api/v1/auth', '/api/v1/users', '/api/v1/tenants'];
      const isImportant = importantPaths.some(path => req.url.startsWith(path));
      
      if (isImportant) {
        const requestLogger = new RequestLogger(logger);
        return requestLogger.logRequest(req, res, next);
      }
      
      next();
    };
  }

  // Middleware para logar erros de requisição
  static logRequestErrors() {
    const logger = new (require('@/shared/logging/logger').Logger)();
    return (req: Request, res: Response, next: NextFunction) => {
      const originalSend = res.send;
      
      res.send = function(body: any) {
        if (res.statusCode >= 400) {
          logger.error('Request error', {
            requestId: req.headers['x-request-id'],
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            body: body,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            tenantId: req.headers['x-tenant-id'],
            userId: (req as any).user?.id
          });
        }
        
        return originalSend.call(this, body);
      };
      
      next();
    };
  }
}
