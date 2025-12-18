import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { MonitoringService } from '@/application/services/monitoring.service';
import { CacheService } from '@/application/services/cache.service';
import { AuditService } from '@/application/services/audit.service';
import { ILogger } from '@/shared/logging/logger';

@injectable()
export class MonitoringController {
  constructor(
    @inject(TYPES.MonitoringService) private readonly monitoringService: MonitoringService,
    @inject(TYPES.CacheService) private readonly cacheService: CacheService,
    @inject(TYPES.AuditService) private readonly auditService: AuditService,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  async getHealthCheck(_req: Request, res: Response): Promise<void> {
    try {
      this.logger.info('Health check requested');

      const healthChecks = await this.monitoringService.getHealthChecks();
      const performanceMetrics = await this.monitoringService.getPerformanceMetrics();

      const overallStatus = healthChecks.every(check => check.status === 'healthy') 
        ? 'healthy' 
        : healthChecks.some(check => check.status === 'unhealthy') 
          ? 'unhealthy' 
          : 'degraded';

      res.status(overallStatus === 'healthy' ? 200 : 503).json({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: performanceMetrics.uptime,
        checks: healthChecks,
        metrics: {
          requestCount: performanceMetrics.requestCount,
          averageResponseTime: performanceMetrics.averageResponseTime,
          errorRate: performanceMetrics.errorRate,
          memoryUsage: performanceMetrics.memoryUsage
        }
      });
    } catch (error) {
      this.logger.error('Health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      });
    }
  }

  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info('Metrics requested', { category: req.query['category'] });

      const category = req.query['category'] as string;
      const metrics = await this.monitoringService.getMetrics(category);
      const performanceMetrics = await this.monitoringService.getPerformanceMetrics();

      res.json({
        timestamp: new Date().toISOString(),
        category: category || 'all',
        metrics,
        performance: performanceMetrics
      });
    } catch (error) {
      this.logger.error('Failed to get metrics', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        error: 'Failed to retrieve metrics'
      });
    }
  }

  async getCacheStats(_req: Request, res: Response): Promise<void> {
    try {
      this.logger.info('Cache stats requested');

      const stats = await this.cacheService.getStats();

      res.json({
        timestamp: new Date().toISOString(),
        stats
      });
    } catch (error) {
      this.logger.error('Failed to get cache stats', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        error: 'Failed to retrieve cache statistics'
      });
    }
  }

  async flushCache(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info('Cache flush requested', { pattern: req.body.pattern });

      const pattern = req.body.pattern;
      await this.cacheService.flush(pattern);

      res.json({
        message: 'Cache flushed successfully',
        pattern: pattern || 'all',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to flush cache', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        error: 'Failed to flush cache'
      });
    }
  }

  async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info('Audit logs requested', { 
        userId: req.query['userId'],
        action: req.query['action'],
        resource: req.query['resource']
      });

      const filters: any = {};
      if (req.query['userId']) filters.userId = req.query['userId'] as string;
      if (req.query['action']) filters.action = req.query['action'] as string;
      if (req.query['resource']) filters.resource = req.query['resource'] as string;
      if (req.query['startDate']) filters.startDate = new Date(req.query['startDate'] as string);
      if (req.query['endDate']) filters.endDate = new Date(req.query['endDate'] as string);
      if (req.query['limit']) filters.limit = parseInt(req.query['limit'] as string);

      const logs = await this.auditService.getAuditLogs(filters);

      res.json({
        timestamp: new Date().toISOString(),
        filters,
        logs,
        count: logs.length
      });
    } catch (error) {
      this.logger.error('Failed to get audit logs', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        error: 'Failed to retrieve audit logs'
      });
    }
  }

  async getUserAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params['userId'];
      this.logger.info('User audit logs requested', { userId });

      const logs = await this.auditService.getUserAuditLogs(userId!);

      res.json({
        timestamp: new Date().toISOString(),
        userId,
        logs,
        count: logs.length
      });
    } catch (error) {
      this.logger.error('Failed to get user audit logs', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.params['userId']
      });

      res.status(500).json({
        error: 'Failed to retrieve user audit logs'
      });
    }
  }

  async getSystemInfo(_req: Request, res: Response): Promise<void> {
    try {
      this.logger.info('System info requested');

      const performanceMetrics = await this.monitoringService.getPerformanceMetrics();
      const cacheStats = await this.cacheService.getStats();

      res.json({
        timestamp: new Date().toISOString(),
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage()
        },
        application: {
          environment: process.env['NODE_ENV'],
          port: process.env['PORT'],
          version: process.env['npm_package_version'] || '1.0.0'
        },
        performance: performanceMetrics,
        cache: cacheStats
      });
    } catch (error) {
      this.logger.error('Failed to get system info', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        error: 'Failed to retrieve system information'
      });
    }
  }

  async trackCustomMetric(req: Request, res: Response): Promise<void> {
    try {
      const { name, value, tags } = req.body;
      
      this.logger.info('Custom metric tracking requested', { name, value, tags });

      await this.monitoringService.trackBusinessMetric(name, value, tags);

      res.json({
        message: 'Metric tracked successfully',
        metric: { name, value, tags },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to track custom metric', {
        error: error instanceof Error ? error.message : 'Unknown error',
        metric: req.body
      });

      res.status(500).json({
        error: 'Failed to track metric'
      });
    }
  }
}
