import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { MonitoringService } from '@/application/services/monitoring.service';
import { AuditService } from '@/application/services/audit.service';
import { CacheService } from '@/application/services/cache.service';

export interface MonitoredRequest extends Request {
  startTime?: number;
}

@injectable()
export class MonitoringMiddleware {
  constructor(
    @inject(TYPES.MonitoringService) private readonly monitoringService: MonitoringService
  ) {}

  static create() {
    const container = require('@/infrastructure/di/container').DIContainer.getContainer();
    const monitoringService = container.get(TYPES.MonitoringService);
    
    return new MonitoringMiddleware(monitoringService).monitor;
  }

  monitor = async (req: MonitoredRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.startTime = Date.now();

      const originalSend = res.send;
      const self = this;
      res.send = function(this: Response, data: any) {
        const responseTime = Date.now() - (req.startTime || 0);
        
        self.monitoringService.trackRequest(
          req.method,
          req.path,
          res.statusCode,
          responseTime
        );

        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Monitoring middleware error:', error);
      next();
    }
  };
}

@injectable()
export class CacheMiddleware {
  constructor(
    @inject(TYPES.CacheService) private readonly cacheService: CacheService
  ) {}

  static create(_ttl: number = 300) {
    const container = require('@/infrastructure/di/container').DIContainer.getContainer();
    const cacheService = container.get(TYPES.CacheService);
    
    return new CacheMiddleware(cacheService).cache.bind(new CacheMiddleware(cacheService));
  }

  cache = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const excluded = [
        '/api/v1/users/me',
        '/api/v1/users/auth/login',
        '/api/v1/users/auth/refresh'
      ];
      if (excluded.includes(req.path)) {
        return next();
      }
      const cacheKey = `cache:${req.method}:${req.originalUrl}`;
      const cachedData = await this.cacheService.get(cacheKey);

      if (cachedData) {
        res.json(cachedData);
        return;
      }

      const originalSend = res.send;
      const self = this;
      res.send = function(this: Response, data: any) {
        if (res.statusCode === 200) {
          self.cacheService.set(cacheKey, JSON.parse(data), { ttl: 300 });
        }
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
}

@injectable()
export class AuditMiddleware {
  constructor(
    @inject(TYPES.AuditService) private readonly auditService: AuditService
  ) {}

  static create() {
    const container = require('@/infrastructure/di/container').DIContainer.getContainer();
    const auditService = container.get(TYPES.AuditService);
    
    return new AuditMiddleware(auditService).audit.bind(new AuditMiddleware(auditService));
  }

  audit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const originalSend = res.send;
      const self = this;
      res.send = function(this: Response, data: any) {
        if (req.method !== 'GET' && res.statusCode < 400) {
          const userId = (req as any).user?.userId || (req as any).user?.id || 'admin-user-1';
          self.auditService.logAction(
            userId,
            `${req.method} ${req.path}`,
            req.originalUrl,
            {
              statusCode: res.statusCode,
              ip: req.ip,
              userAgent: req.get('User-Agent')
            }
          ).catch((error: any) => {
            console.error('Failed to log audit action:', error);
          });
        }
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Audit middleware error:', error);
      next();
    }
  };
}

export class ErrorTrackingMiddleware {
  static create() {
    return new ErrorTrackingMiddleware().track.bind(new ErrorTrackingMiddleware());
  }

  track = async (error: Error, req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const container = require('@/infrastructure/di/container').DIContainer.getContainer();
      const monitoringService = container.get(TYPES.MonitoringService);
      
      await monitoringService.trackError(error, {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.userId
      });

      next(error);
    } catch (trackingError) {
      console.error('Error tracking failed:', trackingError);
      next(error);
    }
  };
}