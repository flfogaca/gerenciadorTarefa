import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { ILogger } from '@/shared/logging/logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memory: string;
}

@injectable()
export class CacheService {
  private cache: Map<string, { value: any; expires: number }> = new Map();
  private stats = {
    hits: 0,
    misses: 0
  };

  constructor(
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {
    this.logger.info('Cache service initialized with in-memory storage');
  }

  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const cached = this.cache.get(fullKey);
      
      if (cached && cached.expires > Date.now()) {
        this.stats.hits++;
        this.logger.debug('Cache hit', { key: fullKey });
        return cached.value;
      } else {
        this.stats.misses++;
        this.logger.debug('Cache miss', { key: fullKey });
        if (cached) {
          this.cache.delete(fullKey); // Remove expired entry
        }
        return null;
      }
    } catch (error) {
      this.logger.error('Failed to get from cache', {
        error: error instanceof Error ? error.message : 'Unknown error',
        key
      });
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const expires = options?.ttl ? Date.now() + (options.ttl * 1000) : Date.now() + (3600 * 1000); // Default 1 hour
      
      this.cache.set(fullKey, { value, expires });
      
      this.logger.debug('Value cached', { key: fullKey, ttl: options?.ttl });
    } catch (error) {
      this.logger.error('Failed to set cache', {
        error: error instanceof Error ? error.message : 'Unknown error',
        key
      });
    }
  }

  async del(key: string, options?: CacheOptions): Promise<void> {
    try {
      const fullKey = this.buildKey(key, options?.prefix);
      this.cache.delete(fullKey);
      
      this.logger.debug('Cache key deleted', { key: fullKey });
    } catch (error) {
      this.logger.error('Failed to delete cache key', {
        error: error instanceof Error ? error.message : 'Unknown error',
        key
      });
    }
  }

  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const cached = this.cache.get(fullKey);
      
      return cached ? cached.expires > Date.now() : false;
    } catch (error) {
      this.logger.error('Failed to check cache key existence', {
        error: error instanceof Error ? error.message : 'Unknown error',
        key
      });
      return false;
    }
  }

  async expire(key: string, ttl: number, options?: CacheOptions): Promise<void> {
    try {
      const fullKey = this.buildKey(key, options?.prefix);
      const cached = this.cache.get(fullKey);
      
      if (cached) {
        cached.expires = Date.now() + (ttl * 1000);
        this.cache.set(fullKey, cached);
      }
      
      this.logger.debug('Cache key expiration set', { key: fullKey, ttl });
    } catch (error) {
      this.logger.error('Failed to set cache key expiration', {
        error: error instanceof Error ? error.message : 'Unknown error',
        key,
        ttl
      });
    }
  }

  async flush(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        const keys = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
        keys.forEach(key => this.cache.delete(key));
        this.logger.info('Cache flushed with pattern', { pattern, keysCount: keys.length });
      } else {
        this.cache.clear();
        this.logger.info('Cache flushed completely');
      }
    } catch (error) {
      this.logger.error('Failed to flush cache', {
        error: error instanceof Error ? error.message : 'Unknown error',
        pattern
      });
    }
  }

  async getStats(): Promise<CacheStats> {
    try {
      const memoryUsage = process.memoryUsage();
      const keys = this.cache.size;
      
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        keys,
        memory: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
      };
    } catch (error) {
      this.logger.error('Failed to get cache stats', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        keys: 0,
        memory: 'unknown'
      };
    }
  }

  async getUserCache(userId: string, tenantId: string): Promise<any> {
    const key = `user:${tenantId}:${userId}`;
    return this.get(key, { prefix: 'gestorpro', ttl: 3600 });
  }

  async setUserCache(userId: string, tenantId: string, userData: any): Promise<void> {
    const key = `user:${tenantId}:${userId}`;
    await this.set(key, userData, { prefix: 'gestorpro', ttl: 3600 });
  }

  async getProjectCache(projectId: string, tenantId: string): Promise<any> {
    const key = `project:${tenantId}:${projectId}`;
    return this.get(key, { prefix: 'gestorpro', ttl: 1800 });
  }

  async setProjectCache(projectId: string, tenantId: string, projectData: any): Promise<void> {
    const key = `project:${tenantId}:${projectId}`;
    await this.set(key, projectData, { prefix: 'gestorpro', ttl: 1800 });
  }

  async getTaskCache(taskId: string, tenantId: string): Promise<any> {
    const key = `task:${tenantId}:${taskId}`;
    return this.get(key, { prefix: 'gestorpro', ttl: 1800 });
  }

  async setTaskCache(taskId: string, tenantId: string, taskData: any): Promise<void> {
    const key = `task:${tenantId}:${taskId}`;
    await this.set(key, taskData, { prefix: 'gestorpro', ttl: 1800 });
  }

  async getTenantCache(tenantId: string): Promise<any> {
    const key = `tenant:${tenantId}`;
    return this.get(key, { prefix: 'gestorpro', ttl: 7200 });
  }

  async setTenantCache(tenantId: string, tenantData: any): Promise<void> {
    const key = `tenant:${tenantId}`;
    await this.set(key, tenantData, { prefix: 'gestorpro', ttl: 7200 });
  }

  async invalidateUserCache(userId: string, tenantId: string): Promise<void> {
    const key = `user:${tenantId}:${userId}`;
    await this.del(key, { prefix: 'gestorpro' });
  }

  async invalidateProjectCache(projectId: string, tenantId: string): Promise<void> {
    const key = `project:${tenantId}:${projectId}`;
    await this.del(key, { prefix: 'gestorpro' });
  }

  async invalidateTaskCache(taskId: string, tenantId: string): Promise<void> {
    const key = `task:${tenantId}:${taskId}`;
    await this.del(key, { prefix: 'gestorpro' });
  }

  async invalidateTenantCache(tenantId: string): Promise<void> {
    const key = `tenant:${tenantId}`;
    await this.del(key, { prefix: 'gestorpro' });
  }

  async invalidateAllTenantCache(tenantId: string): Promise<void> {
    const pattern = `gestorpro:*:${tenantId}:*`;
    await this.flush(pattern);
  }

  async getSessionCache(sessionId: string): Promise<any> {
    const key = `session:${sessionId}`;
    return this.get(key, { prefix: 'gestorpro', ttl: 86400 });
  }

  async setSessionCache(sessionId: string, sessionData: any): Promise<void> {
    const key = `session:${sessionId}`;
    await this.set(key, sessionData, { prefix: 'gestorpro', ttl: 86400 });
  }

  async deleteSessionCache(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await this.del(key, { prefix: 'gestorpro' });
  }

  async getRateLimitCache(key: string): Promise<number> {
    const cacheKey = `rate_limit:${key}`;
    const value = await this.get<number>(cacheKey, { prefix: 'gestorpro', ttl: 60 });
    return value || 0;
  }

  async setRateLimitCache(key: string, count: number): Promise<void> {
    const cacheKey = `rate_limit:${key}`;
    await this.set(cacheKey, count, { prefix: 'gestorpro', ttl: 60 });
  }

  async incrementRateLimitCache(key: string): Promise<number> {
    const current = await this.getRateLimitCache(key);
    const newCount = current + 1;
    await this.setRateLimitCache(key, newCount);
    return newCount;
  }

  private buildKey(key: string, prefix?: string): string {
    if (prefix) {
      return `${prefix}:${key}`;
    }
    return key;
  }
}
