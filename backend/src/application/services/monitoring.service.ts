import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { ILogger } from '@/shared/logging/logger';
import * as Sentry from '@sentry/node';
import { performance } from 'perf_hooks';
import { IDatabaseService } from '@/infrastructure/database/database.service';
import { CacheService } from '@/application/services/cache.service';
import { promises as fs } from 'fs';
import path from 'path';

export interface MetricData {
  name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
  timestamp: Date;
}

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  details?: any;
  timestamp: Date;
}

export interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  memoryUsage: NodeJS.MemoryUsage;
  uptime: number;
}

@injectable()
export class MonitoringService {
  private requestCount = 0;
  private totalResponseTime = 0;
  private errorCount = 0;
  private startTime = Date.now();
  private metrics: Map<string, MetricData[]> = new Map();

  constructor(
    @inject(TYPES.Logger) private readonly logger: ILogger,
    @inject(TYPES.DatabaseService) private readonly databaseService: IDatabaseService,
    @inject(TYPES.CacheService) private readonly cacheService: CacheService
  ) {
    this.initializeSentry();
    this.startPerformanceMonitoring();
  }

  private initializeSentry(): void {
    if (process.env['SENTRY_DSN']) {
      Sentry.init({
        dsn: process.env['SENTRY_DSN'],
        environment: process.env['NODE_ENV'] || 'development',
        tracesSampleRate: 1.0,
        integrations: [
          new Sentry.Integrations.Http({ tracing: true }),
          new Sentry.Integrations.Express(),
        ],
      });

      this.logger.info('Sentry initialized for monitoring');
    } else {
      this.logger.warn('Sentry DSN not configured, monitoring will be limited');
    }
  }

  private startPerformanceMonitoring(): void {
    setInterval(() => {
      this.collectSystemMetrics();
    }, 60000); // Collect metrics every minute

    setInterval(() => {
      this.logPerformanceMetrics();
    }, 300000); // Log performance every 5 minutes
  }

  async trackRequest(method: string, path: string, statusCode: number, responseTime: number): Promise<void> {
    try {
      this.requestCount++;
      this.totalResponseTime += responseTime;

      if (statusCode >= 400) {
        this.errorCount++;
      }

      const metric: MetricData = {
        name: 'http_request',
        value: responseTime,
        unit: 'ms',
        tags: {
          method,
          path,
          status_code: statusCode.toString()
        },
        timestamp: new Date()
      };

      this.addMetric('http_requests', metric);

      if (process.env['SENTRY_DSN']) {
        Sentry.addBreadcrumb({
          message: `${method} ${path}`,
          category: 'http',
          data: {
            method,
            path,
            status_code: statusCode,
            response_time: responseTime
          },
          level: statusCode >= 400 ? 'error' : 'info'
        });
      }

    } catch (error) {
      this.logger.error('Failed to track request', {
        error: error instanceof Error ? error.message : 'Unknown error',
        method,
        path,
        statusCode,
        responseTime
      });
    }
  }

  async trackError(error: Error, context?: any): Promise<void> {
    try {
      this.errorCount++;

      const metric: MetricData = {
        name: 'error',
        value: 1,
        unit: 'count',
        tags: {
          error_type: error.name,
          error_message: error.message
        },
        timestamp: new Date()
      };

      this.addMetric('errors', metric);

      if (process.env['SENTRY_DSN']) {
        Sentry.withScope((scope) => {
          if (context) {
            Object.keys(context).forEach(key => {
              scope.setContext(key, context[key]);
            });
          }
          Sentry.captureException(error);
        });
      }

      this.logger.error('Error tracked', {
        error: error.message,
        stack: error.stack,
        context
      });

    } catch (trackingError) {
      this.logger.error('Failed to track error', {
        error: trackingError instanceof Error ? trackingError.message : 'Unknown error',
        originalError: error.message
      });
    }
  }

  async trackBusinessMetric(name: string, value: number, tags?: Record<string, string>): Promise<void> {
    try {
      const metric: MetricData = {
        name,
        value,
        unit: 'count',
        tags: tags || {},
        timestamp: new Date()
      };

      this.addMetric('business_metrics', metric);

      this.logger.info('Business metric tracked', { name, value, tags });

    } catch (error) {
      this.logger.error('Failed to track business metric', {
        error: error instanceof Error ? error.message : 'Unknown error',
        name,
        value,
        tags
      });
    }
  }

  async trackUserAction(userId: string, action: string, details?: any): Promise<void> {
    try {
      const metric: MetricData = {
        name: 'user_action',
        value: 1,
        unit: 'count',
        tags: {
          user_id: userId,
          action
        },
        timestamp: new Date()
      };

      this.addMetric('user_actions', metric);

      if (process.env['SENTRY_DSN']) {
        Sentry.addBreadcrumb({
          message: `User action: ${action}`,
          category: 'user',
          data: {
            userId,
            action,
            details
          },
          level: 'info'
        });
      }

    } catch (error) {
      this.logger.error('Failed to track user action', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        action,
        details
      });
    }
  }

  async trackDatabaseQuery(query: string, duration: number, success: boolean): Promise<void> {
    try {
      const metric: MetricData = {
        name: 'database_query',
        value: duration,
        unit: 'ms',
        tags: {
          query_type: this.extractQueryType(query),
          success: success.toString()
        },
        timestamp: new Date()
      };

      this.addMetric('database_queries', metric);

    } catch (error) {
      this.logger.error('Failed to track database query', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query,
        duration,
        success
      });
    }
  }

  async trackCacheOperation(operation: string, hit: boolean, duration?: number): Promise<void> {
    try {
      const metric: MetricData = {
        name: 'cache_operation',
        value: hit ? 1 : 0,
        unit: 'count',
        tags: {
          operation,
          hit: hit.toString()
        },
        timestamp: new Date()
      };

      this.addMetric('cache_operations', metric);

      if (duration !== undefined) {
        const durationMetric: MetricData = {
          name: 'cache_duration',
          value: duration,
          unit: 'ms',
          tags: {
            operation
          },
          timestamp: new Date()
        };

        this.addMetric('cache_durations', durationMetric);
      }

    } catch (error) {
      this.logger.error('Failed to track cache operation', {
        error: error instanceof Error ? error.message : 'Unknown error',
        operation,
        hit,
        duration
      });
    }
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const averageResponseTime = this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0;
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;

    return {
      requestCount: this.requestCount,
      averageResponseTime,
      errorRate,
      memoryUsage: process.memoryUsage(),
      uptime: Date.now() - this.startTime
    };
  }

  async getHealthChecks(): Promise<HealthCheckResult[]> {
    const checks: HealthCheckResult[] = [];

    // Database health check
    checks.push(await this.checkDatabaseHealth());

    // Redis health check
    checks.push(await this.checkRedisHealth());

    // Memory health check
    checks.push(await this.checkMemoryHealth());

    // Disk health check
    checks.push(await this.checkDiskHealth());

    return checks;
  }

  async getMetrics(category?: string): Promise<MetricData[]> {
    if (category) {
      return this.metrics.get(category) || [];
    }

    const allMetrics: MetricData[] = [];
    this.metrics.forEach(metrics => {
      allMetrics.push(...metrics);
    });

    return allMetrics;
  }

  async createPerformanceTimer(name: string): Promise<() => void> {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.trackBusinessMetric(`performance_${name}`, duration, {
        timer: name
      });
    };
  }

  private addMetric(category: string, metric: MetricData): void {
    if (!this.metrics.has(category)) {
      this.metrics.set(category, []);
    }

    const metrics = this.metrics.get(category)!;
    metrics.push(metric);

    // Keep only last 1000 metrics per category
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000);
    }
  }

  private collectSystemMetrics(): void {
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      this.addMetric('system_metrics', {
        name: 'memory_heap_used',
        value: memoryUsage.heapUsed,
        unit: 'bytes',
        timestamp: new Date()
      });

      this.addMetric('system_metrics', {
        name: 'memory_heap_total',
        value: memoryUsage.heapTotal,
        unit: 'bytes',
        timestamp: new Date()
      });

      this.addMetric('system_metrics', {
        name: 'memory_rss',
        value: memoryUsage.rss,
        unit: 'bytes',
        timestamp: new Date()
      });

      this.addMetric('system_metrics', {
        name: 'cpu_user',
        value: cpuUsage.user,
        unit: 'microseconds',
        timestamp: new Date()
      });

      this.addMetric('system_metrics', {
        name: 'cpu_system',
        value: cpuUsage.system,
        unit: 'microseconds',
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to collect system metrics', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async logPerformanceMetrics(): Promise<void> {
    try {
      const metrics = await this.getPerformanceMetrics();
      
      this.logger.info('Performance metrics', {
        requestCount: metrics.requestCount,
        averageResponseTime: metrics.averageResponseTime,
        errorRate: metrics.errorRate,
        memoryUsage: metrics.memoryUsage,
        uptime: metrics.uptime
      });

    } catch (error) {
      this.logger.error('Failed to log performance metrics', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private extractQueryType(query: string): string {
    const trimmedQuery = query.trim().toLowerCase();
    if (trimmedQuery.startsWith('select')) return 'SELECT';
    if (trimmedQuery.startsWith('insert')) return 'INSERT';
    if (trimmedQuery.startsWith('update')) return 'UPDATE';
    if (trimmedQuery.startsWith('delete')) return 'DELETE';
    return 'OTHER';
  }

  private async checkDatabaseHealth(): Promise<HealthCheckResult> {
    try {
      const start = performance.now();
      const isHealthy = await this.databaseService.healthCheck();
      const duration = performance.now() - start;

      if (!isHealthy) {
        return {
          service: 'database',
          status: 'unhealthy',
          message: 'Database health check failed',
          details: { latency: duration },
          timestamp: new Date()
        };
      }

      return {
        service: 'database',
        status: 'healthy',
        message: 'Database connection is healthy',
        details: { latency: duration },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        message: 'Database connection failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date()
      };
    }
  }

  private async checkRedisHealth(): Promise<HealthCheckResult> {
    try {
      const key = `health:${Date.now()}`;
      await this.cacheService.set(key, 'ok', { ttl: 2 });
      const value = await this.cacheService.get<string>(key);
      await this.cacheService.del(key);

      if (value !== 'ok') {
        return {
          service: 'cache',
          status: 'degraded',
          message: 'Cache service returned unexpected value',
          details: { value },
          timestamp: new Date()
        };
      }

      return {
        service: 'cache',
        status: 'healthy',
        message: 'Cache service is responding normally',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        service: 'cache',
        status: 'unhealthy',
        message: 'Cache service health check failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date()
      };
    }
  }

  private async checkMemoryHealth(): Promise<HealthCheckResult> {
    try {
      const memoryUsage = process.memoryUsage();
      const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

      if (memoryUsagePercent > 90) {
        return {
          service: 'memory',
          status: 'unhealthy',
          message: 'Memory usage is critically high',
          details: { usage: memoryUsagePercent },
          timestamp: new Date()
        };
      } else if (memoryUsagePercent > 75) {
        return {
          service: 'memory',
          status: 'degraded',
          message: 'Memory usage is high',
          details: { usage: memoryUsagePercent },
          timestamp: new Date()
        };
      }

      return {
        service: 'memory',
        status: 'healthy',
        message: 'Memory usage is normal',
        details: { usage: memoryUsagePercent },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        service: 'memory',
        status: 'unhealthy',
        message: 'Memory health check failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date()
      };
    }
  }

  private async checkDiskHealth(): Promise<HealthCheckResult> {
    try {
      const uploadPath = process.env['UPLOAD_PATH'] || path.resolve(process.cwd(), 'uploads');
      await fs.mkdir(uploadPath, { recursive: true });

      const testFile = path.join(uploadPath, `.health_${Date.now()}`);
      await fs.writeFile(testFile, 'disk-health-check');
      await fs.unlink(testFile);

      return {
        service: 'disk',
        status: 'healthy',
        message: 'Disk write/read operations succeeded',
        details: { path: uploadPath },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        service: 'disk',
        status: 'unhealthy',
        message: 'Disk health check failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date()
      };
    }
  }
}
