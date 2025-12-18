import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: ComponentHealth;
    redis: ComponentHealth;
    memory: ComponentHealth;
    disk?: ComponentHealth;
  };
}

interface ComponentHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  message?: string;
  details?: Record<string, any>;
}

const prisma = new PrismaClient();

async function checkDatabase(): Promise<ComponentHealth> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;
    
    return {
      status: responseTime < 1000 ? 'up' : 'degraded',
      responseTime,
      message: responseTime < 1000 ? 'Database is responding normally' : 'Database is slow',
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      message: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

async function checkRedis(): Promise<ComponentHealth> {
  const redisUrl = process.env['REDIS_URL'];
  
  if (!redisUrl) {
    return {
      status: 'down',
      message: 'Redis not configured',
    };
  }

  const start = Date.now();
  let redis: Redis | null = null;

  try {
    redis = new Redis(redisUrl, {
      connectTimeout: 5000,
      maxRetriesPerRequest: 1,
    });

    await redis.ping();
    const responseTime = Date.now() - start;

    return {
      status: responseTime < 500 ? 'up' : 'degraded',
      responseTime,
      message: 'Redis is responding normally',
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      message: error instanceof Error ? error.message : 'Redis connection failed',
    };
  } finally {
    if (redis) {
      redis.disconnect();
    }
  }
}

function checkMemory(): ComponentHealth {
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
  const rssMB = Math.round(used.rss / 1024 / 1024);
  const usagePercent = (used.heapUsed / used.heapTotal) * 100;

  let status: 'up' | 'degraded' | 'down' = 'up';
  if (usagePercent > 90) {
    status = 'down';
  } else if (usagePercent > 75) {
    status = 'degraded';
  }

  return {
    status,
    message: `Memory usage: ${usagePercent.toFixed(1)}%`,
    details: {
      heapUsed: `${heapUsedMB}MB`,
      heapTotal: `${heapTotalMB}MB`,
      rss: `${rssMB}MB`,
      usagePercent: `${usagePercent.toFixed(1)}%`,
    },
  };
}

export async function healthCheck(_req: Request, res: Response): Promise<void> {
  try {
    const [database, redis, memory] = await Promise.all([
      checkDatabase().catch(() => ({ status: 'down' as const, message: 'Database check failed' })),
      checkRedis().catch(() => ({ status: 'down' as const, message: 'Redis check failed' })),
      Promise.resolve(checkMemory()),
    ]);

    const checks = { database, redis, memory };

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (database.status === 'down') {
      overallStatus = 'unhealthy';
    } else if (
      database.status === 'degraded' ||
      memory.status === 'degraded'
    ) {
      overallStatus = 'degraded';
    }

    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env['npm_package_version'] || '1.0.0',
      checks,
    };

    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    res.status(statusCode).json(result);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env['npm_package_version'] || '1.0.0',
      checks: {
        database: { status: 'down', message: 'Health check error' },
        redis: { status: 'down', message: 'Health check error' },
        memory: { status: 'down', message: 'Health check error' },
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function livenessCheck(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
}

export async function readinessCheck(_req: Request, res: Response): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      message: 'Database not available',
    });
  }
}



