import { PrismaClient } from '@prisma/client';
import { spawnSync } from 'child_process';
import { injectable, inject } from 'inversify';
import { ILogger } from '@/shared/logging/logger';
import { TYPES } from '@/shared/types';
import { promises as fs } from 'fs';
import path from 'path';

export interface IDatabaseService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  runMigrations(): Promise<void>;
  getClient(): PrismaClient;
  isConnected(): boolean;
  healthCheck(): Promise<boolean>;
  createDatabase(schemaName: string): Promise<void>;
  dropDatabase(schemaName: string): Promise<void>;
  backupDatabase(schemaName: string, backupPath: string): Promise<void>;
  restoreDatabase(schemaName: string, backupPath: string): Promise<void>;
}

@injectable()
export class DatabaseService implements IDatabaseService {
  private prisma: PrismaClient;
  private isConnectedFlag: boolean = false;

  constructor(@inject(TYPES.Logger) private readonly logger: ILogger) {
    if (!logger) {
      throw new Error('Logger is required but not provided');
    }
    this.prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.prisma.$on('query' as never, (event: any) => {
      this.logger.debug('Prisma query executed', {
        query: event.query,
        params: event.params,
        duration: event.duration
      });
    });

    this.prisma.$on('warn' as never, (event: any) => {
      this.logger.warn('Prisma warning', { message: event.message });
    });

    this.prisma.$on('error' as never, (event: any) => {
      this.logger.error('Prisma error', { message: event.message, target: event.target });
    });
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      this.isConnectedFlag = true;
      
      this.logger.info('Database connected successfully', {
        database: process.env['DATABASE_URL']?.split('@')[1]?.split('/')[0] || 'unknown',
        environment: process.env['NODE_ENV'] || 'development'
      });
    } catch (error) {
      this.logger.error('Failed to connect to database', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      this.isConnectedFlag = false;
      
      this.logger.info('Database disconnected successfully');
    } catch (error) {
      this.logger.error('Failed to disconnect from database', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async runMigrations(): Promise<void> {
    try {
      const isCI = process.env['CI'] === 'true';
      const disableAutoMigrate = process.env['DISABLE_AUTO_MIGRATE'] === 'true';
      if (disableAutoMigrate) {
        await this.prisma.$queryRaw`SELECT 1`;
        this.logger.info('Auto-migrate disabled. Skipped running migrations.');
        return;
      }

      const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
      const args = ['prisma', 'migrate', 'deploy'];
      const result = spawnSync(cmd, args, { stdio: 'pipe', encoding: 'utf-8' });

      if (result.status !== 0) {
        this.logger.error('Prisma migrate deploy failed', {
          status: result.status,
          stderr: result.stderr
        });
        if (isCI || process.env['NODE_ENV'] === 'production') throw new Error('Migrations failed');
      } else {
        this.logger.info('Database migrations deployed', { stdout: result.stdout?.slice(0, 5000) });
      }
    } catch (error) {
      this.logger.error('Failed to run database migrations', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  getClient(): PrismaClient {
    if (!this.isConnectedFlag) {
      throw new Error('Database is not connected');
    }
    return this.prisma;
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  // Métodos utilitários para operações comuns
  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  async getDatabaseInfo(): Promise<any> {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT 
          current_database() as database_name,
          version() as version,
          current_user as current_user,
          inet_server_addr() as server_address,
          inet_server_port() as server_port
      `;
      
      return result;
    } catch (error) {
      this.logger.error('Failed to get database info', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  async getConnectionCount(): Promise<number> {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT count(*) as connection_count 
        FROM pg_stat_activity 
        WHERE state = 'active'
      ` as any[];
      
      return parseInt(result[0]?.connection_count || '0');
    } catch (error) {
      this.logger.error('Failed to get connection count', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }

  async createDatabase(schemaName: string): Promise<void> {
    const safeName = this.sanitizeIdentifier(schemaName);
    await this.prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${safeName}"`);
    this.logger.info('Schema created or already exists', { schema: safeName });
  }

  async dropDatabase(schemaName: string): Promise<void> {
    const safeName = this.sanitizeIdentifier(schemaName);
    await this.prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${safeName}" CASCADE`);
    this.logger.info('Schema dropped', { schema: safeName });
  }

  async backupDatabase(schemaName: string, backupPath: string): Promise<void> {
    const safeName = this.sanitizeIdentifier(schemaName);
    const absolutePath = path.resolve(backupPath);
    const payload = {
      schema: safeName,
      timestamp: new Date().toISOString()
    };

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, JSON.stringify(payload, null, 2), 'utf-8');
    this.logger.info('Schema backup metadata written', { schema: safeName, backupPath: absolutePath });
  }

  async restoreDatabase(schemaName: string, backupPath: string): Promise<void> {
    const safeName = this.sanitizeIdentifier(schemaName);
    const absolutePath = path.resolve(backupPath);

    const exists = await fs
      .access(absolutePath)
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      throw new Error(`Backup file not found at ${absolutePath}`);
    }

    this.logger.warn('Restore operation currently replays metadata only', { schema: safeName, backupPath: absolutePath });
  }

  private sanitizeIdentifier(value: string): string {
    const normalized = value.replace(/[^a-zA-Z0-9_]/g, '_');
    if (!normalized || normalized.length === 0) {
      throw new Error('Invalid schema identifier');
    }
    return normalized;
  }
}
