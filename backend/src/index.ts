import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import * as Sentry from '@sentry/node';
import { ensureValidEnvironment } from '@/shared/validation/env-validator';

ensureValidEnvironment();
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Importar configurações
import { DIContainer } from '@/infrastructure/di/container';
import { TYPES } from '@/shared/types';
import { MultiTenantMiddleware } from '@/core/multi-tenant/tenant-context';

// Importar middlewares
import { ErrorHandler } from '@/presentation/middleware/error-handler';
import { RequestLogger } from '@/presentation/middleware/request-logger';
import { AuthMiddleware } from '@/presentation/middleware/auth-middleware';
import { MonitoringMiddleware, CacheMiddleware, AuditMiddleware } from '@/presentation/middleware/monitoring-middleware';

// Importar rotas
import { tenantRoutes } from '@/presentation/routes/tenant.routes';
import { userRoutes } from '@/presentation/routes/user.routes';
import { projectRoutes } from '@/presentation/routes/project.routes';
import { taskRoutes } from '@/presentation/routes/task.routes';
import { clientRoutes } from '@/presentation/routes/client.routes';
import { supplierRoutes } from '@/presentation/routes/supplier.routes';
import { reportsRoutes } from '@/presentation/routes/reports.routes';
import { monitoringRoutes } from '@/presentation/routes/monitoring.routes';
import { fileRoutes } from '@/presentation/routes/file.routes';
import { notificationRoutes } from '@/presentation/routes/notification.routes';
import { expenseRoutes } from '@/presentation/routes/expense.routes';
import { invoiceRoutes } from '@/presentation/routes/invoice.routes';
import { paymentRoutes } from '@/presentation/routes/payment.routes';
import { financialReportRoutes } from '@/presentation/routes/financial-report.routes';
import { templateRoutes } from '@/presentation/routes/template.routes';
import { userSettingsRoutes } from '@/presentation/routes/user-settings.routes';
import { tenantSettingsRoutes } from '@/presentation/routes/tenant-settings.routes';
import { importRoutes } from '@/presentation/routes/import.routes';

import { Logger } from '@/shared/logging/logger';
import { IDatabaseService } from '@/infrastructure/database/database.service';

class Application {
  private app: express.Application;
  private httpServer: ReturnType<typeof createServer>;
  private io: SocketIOServer;
  private container: any;
  private logger: Logger;
  private databaseService: IDatabaseService | null;

  constructor() {
    try {
      this.app = express();
      
      this.app.set('trust proxy', true);
      
      this.httpServer = createServer(this.app);
      this.io = new SocketIOServer(this.httpServer, {
        cors: {
          origin: process.env['ALLOWED_ORIGINS']?.split(',') || [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:3001'
          ],
          methods: ['GET', 'POST'],
          credentials: true
        }
      });
      
      this.configureCORS();
      this.configureHealthCheckRoutes();
      
      try {
        this.container = DIContainer.getContainer();
        this.logger = this.container.get(TYPES.Logger);
        this.databaseService = this.container.get(TYPES.DatabaseService);
      } catch (error) {
        console.error('⚠️ Erro ao inicializar container DI, usando fallback:', error);
        this.logger = new (require('@/shared/logging/logger').Logger)();
        this.databaseService = null;
      }
      
      this.configureSentry();
      this.configureMiddleware();
      this.configureSocketIO();
      this.configureRoutes();
      this.configureErrorHandling();
    } catch (error) {
      console.error('❌ Erro crítico no construtor:', error);
      throw error;
    }
  }

  private configureSentry(): void {
    if (process.env['NODE_ENV'] === 'development') return;
    const dsn = process.env['SENTRY_DSN'];
    if (!dsn) return;
    try {
      Sentry.init({
        dsn,
        environment: process.env['NODE_ENV'] || 'development',
        tracesSampleRate: 0.2,
        profilesSampleRate: 0.2
      });
    } catch (error) {
      this.logger.warn('Failed to initialize Sentry', { error });
    }
  }

  private configureMiddleware(): void {
    // Segurança
    this.app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // Compressão
    this.app.use(compression());

    // Rate Limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => req.path === '/health' || req.path === '/api/v1/health' || req.path.startsWith('/health/'),
    });
    this.app.use(limiter);

    // Logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => {
          this.logger.info(message.trim());
        }
      }
    }));

    // Parser de JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    const path = require('path');
    const uploadDir = process.env['UPLOAD_PATH'] || './uploads';
    this.app.use('/uploads', express.static(path.resolve(uploadDir)));

    // Middleware de request ID
    this.app.use((req, res, next) => {
      req.headers['x-request-id'] = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      res.setHeader('X-Request-ID', req.headers['x-request-id']);
      next();
    });

    // Middleware de autenticação
    this.app.use(AuthMiddleware.create());

    // Middleware Multi-tenant
    this.app.use(MultiTenantMiddleware.create());

    // Middleware de logging de requests
    this.app.use(RequestLogger.create());

    // Middleware de monitoramento
    this.app.use(MonitoringMiddleware.create());

    // Middleware de cache (apenas para rotas GET)
    this.app.use(CacheMiddleware.create(300)); // 5 minutos de cache

    // Middleware de auditoria
    this.app.use(AuditMiddleware.create());
  }

  private configureCORS(): void {
    const allowedOriginsRaw = process.env['ALLOWED_ORIGINS'] || '';
    console.log('🔐 CORS - ALLOWED_ORIGINS raw:', allowedOriginsRaw);
    
    this.app.use(cors({
      origin: (origin, callback) => {
        const allowedOrigins = allowedOriginsRaw
          .split(',')
          .map(url => url.trim())
          .filter(url => url.length > 0);
        
        const defaultOrigins = [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:3001',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001'
        ];
        
        const allOrigins = allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins;
        console.log('🔐 CORS - Origins permitidas:', allOrigins.join(', '));
        
        if (!origin) {
          callback(null, true);
          return;
        }
        
        if (allOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log(`⚠️ CORS: Origin não permitida: ${origin}`);
          console.log(`📋 Origins permitidas: ${allOrigins.join(', ')}`);
          callback(null, true);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Request-ID', 'Accept'],
      exposedHeaders: ['X-Request-ID'],
      preflightContinue: false,
      optionsSuccessStatus: 204
    }));
    
    this.app.options('*', (req, res) => {
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-ID, X-Request-ID, Accept');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.sendStatus(204);
    });
  }

  private configureHealthCheckRoutes(): void {
    this.app.get('/health', (_req, res) => {
      res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });
    
    this.app.get('/api/v1/health', (_req, res) => {
      res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });
    
    this.app.get('/health/live', (_req, res) => {
      res.status(200).json({ status: 'alive' });
    });
    
    this.app.get('/health/ready', (_req, res) => {
      res.status(200).json({ status: 'ready' });
    });
  }

  private configureRoutes(): void {
    const { healthCheck, livenessCheck, readinessCheck } = require('@/presentation/middleware/health-check');
    this.app.get('/health/detailed', healthCheck);
    this.app.get('/health/live', livenessCheck);
    this.app.get('/health/ready', readinessCheck);

    // API Documentation
    const { swaggerSpec } = require('@/presentation/routes/swagger');
    this.app.get('/api/v1/docs.json', (_req, res) => {
      res.json(swaggerSpec);
    });
    
    this.app.get('/api/v1/docs', (_req, res) => {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>GestorPro API Docs</title>
          <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
          <script>
            SwaggerUIBundle({
              url: '/api/v1/docs.json',
              dom_id: '#swagger-ui',
              presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
              layout: 'BaseLayout'
            });
          </script>
        </body>
        </html>
      `;
      res.type('html').send(html);
    });
    this.app.use('/api/v1/tenants', tenantRoutes);
    this.app.use('/api/v1/users', userRoutes);
    this.app.use('/api/v1/projects', projectRoutes);
    this.app.use('/api/v1/tasks', taskRoutes);
    this.app.use('/api/v1/clients', clientRoutes);
    this.app.use('/api/v1/suppliers', supplierRoutes);
    this.app.use('/api/v1/reports', reportsRoutes);
    this.app.use('/api/v1/monitoring', monitoringRoutes);
    this.app.use('/api/v1/files', fileRoutes);
    this.app.use('/api/v1/notifications', notificationRoutes);
    this.app.use('/api/v1/expenses', expenseRoutes);
    this.app.use('/api/v1/invoices', invoiceRoutes);
    this.app.use('/api/v1/payments', paymentRoutes);
    this.app.use('/api/v1/financial-reports', financialReportRoutes);
    this.app.use('/api/v1/templates', templateRoutes);
    this.app.use('/api/v1/users/me/settings', userSettingsRoutes);
    this.app.use('/api/v1/tenants/settings', tenantSettingsRoutes);
    this.app.use('/api/v1/import', importRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`
      });
    });
  }

  private configureSocketIO(): void {
    this.io.on('connection', (socket) => {
      this.logger.info('Client connected', { socketId: socket.id });
      
      socket.on('disconnect', () => {
        this.logger.info('Client disconnected', { socketId: socket.id });
      });

      socket.on('error', (error) => {
        this.logger.error('Socket error', { socketId: socket.id, error });
      });
    });
  }

  private configureErrorHandling(): void {
    this.app.use(ErrorHandler.handle);
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      const port = parseInt(process.env['PORT'] || '3001', 10);
      const host = process.env['HOST'] || '0.0.0.0';
      
      console.log(`🔧 Configurando servidor na porta ${port}, host ${host}...`);
      
      this.httpServer.on('error', (error: Error) => {
        console.error('❌ Erro ao iniciar servidor:', error);
        this.logger.error('Server error', { error: error.message });
        reject(error);
      });

    this.httpServer.on('listening', () => {
      console.log('✅ Servidor está escutando!');
      console.log(`✅ Servidor HTTP escutando em ${host}:${port}`);
      this.logger.info(`Server running on ${host}:${port}`);
      this.logger.info(`Environment: ${process.env['NODE_ENV'] || 'development'}`);
      console.log(`✅ Servidor iniciado com sucesso na porta ${port}!`);
      console.log(`🚀 Backend rodando em: http://${host}:${port}`);
      console.log(`🔌 WebSocket/Socket.IO disponível em: ws://${host}:${port}/socket.io`);
      console.log(`🏥 Health check disponível em: http://${host}:${port}/health`);
      console.log(`📊 API disponível em: http://${host}:${port}/api/v1`);
      console.log(`🔗 Health da API: http://${host}:${port}/api/v1/health`);
      
      if (this.databaseService) {
        setTimeout(async () => {
          try {
            console.log('🔌 Tentando conectar ao banco de dados...');
            if (this.databaseService) {
              await this.databaseService.connect();
            }
            this.logger.info('Database connected successfully');
            console.log('✅ Banco de dados conectado!');

            console.log('🔄 Executando migrações...');
            const { spawnSync } = require('child_process');
            const migrateResult = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
              stdio: 'inherit',
              env: process.env
            });
            
            if (migrateResult.status === 0) {
              this.logger.info('Database migrations completed');
              console.log('✅ Migrações concluídas!');
            } else {
              console.log('⚠️ Migrações falharam, mas servidor continua rodando');
            }
          } catch (error) {
            console.error('⚠️ Erro ao conectar ao banco:', error);
            if (this.logger) {
              this.logger.error('Failed to connect to database', {
                error: (error as Error).message,
                stack: (error as Error).stack
              });
              this.logger.warn('Server started but database connection failed. Some features may not work.');
            }
          }
        }, 1000);
      } else {
        console.log('⚠️ DatabaseService não disponível, servidor rodando sem banco');
      }
      
      resolve();
    });
      
    this.httpServer.listen(port, host);
    });
  }

  public async stop(): Promise<void> {
    try {
      this.io.close();
      this.httpServer.close();
      if (this.databaseService) {
        await this.databaseService.disconnect();
      }
      this.logger.info('Application stopped gracefully');
    } catch (error) {
      this.logger.error('Error stopping application', {
        error: (error as Error).message
      });
    }
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

// Inicializar aplicação
const app = new Application();

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  const logger = new (require('@/shared/logging/logger').Logger)();
  logger.error('Unhandled promise rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined
  });
});

process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  const logger = new (require('@/shared/logging/logger').Logger)();
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

// Iniciar aplicação
console.log('🚀 Iniciando aplicação GestorPro Backend...');
app.start().catch((error) => {
  console.error('❌ Failed to start application:', error);
  console.error('Error details:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
