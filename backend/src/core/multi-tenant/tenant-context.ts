import { TenantIdVO } from '../entities/tenant';

// Contexto Multi-tenant
export interface TenantContext {
  readonly tenantId: TenantIdVO;
  readonly userId?: string;
  readonly userRole?: string;
  readonly requestId: string;
  readonly timestamp: Date;
}

// Service de Contexto Multi-tenant
export interface ITenantContextService {
  getCurrentContext(): TenantContext | null;
  setContext(context: TenantContext): void;
  clearContext(): void;
  getTenantId(): TenantIdVO | null;
  getUserId(): string | null;
  getUserRole(): string | null;
}

// Implementação do Service de Contexto
export class TenantContextService implements ITenantContextService {
  private context: TenantContext | null = null;

  getCurrentContext(): TenantContext | null {
    return this.context;
  }

  setContext(context: TenantContext): void {
    this.context = context;
  }

  clearContext(): void {
    this.context = null;
  }

  getTenantId(): TenantIdVO | null {
    return this.context?.tenantId || null;
  }

  getUserId(): string | null {
    return this.context?.userId || null;
  }

  getUserRole(): string | null {
    return this.context?.userRole || null;
  }
}

// Middleware Multi-tenant
export class MultiTenantMiddleware {
  static create() {
    return (req: any, res: any, next: any) => {
      // Rotas públicas que não precisam de tenant
      const publicRoutes = [
        '/health',
        '/api/v1/health',
        '/api/v1/users/auth/login'
      ];

      if (publicRoutes.includes(req.path)) {
        return next();
      }

      // Extrair tenantId do header, subdomínio ou parâmetro
      const tenantId = MultiTenantMiddleware.extractTenantId(req);
      
      if (!tenantId || typeof tenantId !== 'string' || tenantId.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Tenant ID is required',
          message: 'Please provide tenant ID in header, subdomain or parameter'
        });
      }

      try {
        // Criar contexto do tenant
        const tenantIdVO = new TenantIdVO(tenantId.trim());
        const context: TenantContext = {
          tenantId: tenantIdVO,
          userId: req.user?.id,
          userRole: req.user?.role,
          requestId: req.headers['x-request-id'] || `req_${Date.now()}`,
          timestamp: new Date()
        };

        // Verificar se o contexto foi criado corretamente
        if (!context.tenantId || !context.tenantId.value) {
          return res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to create tenant context'
          });
        }

        // Definir contexto na requisição
        req.tenantContext = context;
        
        next();
      } catch (error) {
        return res.status(400).json({ 
          error: 'Invalid tenant ID',
          message: error instanceof Error ? error.message : 'Tenant ID validation failed'
        });
      }
    };
  }

  private static extractTenantId(req: any): string | null {
    // 1. Tentar extrair do header
    const headerTenantId = req.headers['x-tenant-id'];
    if (headerTenantId) {
      return headerTenantId;
    }

    // 2. Tentar extrair do usuário autenticado (do token JWT)
    if (req.user?.tenantId) {
      return req.user.tenantId;
    }

    // 3. Tentar extrair do subdomínio
    const host = req.headers.host;
    if (host) {
      const subdomain = host.split('.')[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
        return subdomain;
      }
    }

    // 4. Tentar extrair do parâmetro da query
    const queryTenantId = req.query.tenantId;
    if (queryTenantId) {
      return queryTenantId;
    }

    // 5. Tentar extrair do body (para POST/PUT)
    const bodyTenantId = req.body?.tenantId;
    if (bodyTenantId) {
      return bodyTenantId;
    }

    return null;
  }
}

export function RequireTenant() {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req = args[0];
      const res = args[1];
      
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'User must be authenticated'
        });
      }
      
      let tenantId: string | null = null;
      
      if (req.user?.tenantId) {
        tenantId = req.user.tenantId;
      }
      
      if (!tenantId) {
        tenantId = req.headers['x-tenant-id'] as string;
      }
      
      if (!tenantId && req.headers.host) {
        const subdomain = req.headers.host.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
          tenantId = subdomain;
        }
      }
      
      if (!tenantId && req.query.tenantId) {
        tenantId = req.query.tenantId as string;
      }
      
      if (!tenantId && req.body?.tenantId) {
        tenantId = req.body.tenantId;
      }
      
      if (!tenantId || typeof tenantId !== 'string' || tenantId.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Tenant ID is required',
          message: 'Please provide tenant ID. User must be authenticated with a valid tenant ID.'
        });
      }
      
      let tenantContext: TenantContext;
      try {
        const tenantIdVO = new TenantIdVO(tenantId.trim());
        tenantContext = {
          tenantId: tenantIdVO,
          userId: req.user?.id,
          userRole: req.user?.role,
          requestId: req.headers['x-request-id'] || `req_${Date.now()}`,
          timestamp: new Date()
        };
        
        req.tenantContext = tenantContext;
      } catch (error) {
        return res.status(400).json({ 
          error: 'Invalid tenant ID',
          message: error instanceof Error ? error.message : 'Tenant ID validation failed'
        });
      }

      const tenantIdValue = tenantContext.tenantId?.value;
      if (!tenantContext.tenantId || !tenantIdValue) {
        return res.status(500).json({ 
          error: 'Internal server error',
          message: 'Failed to create tenant context'
        });
      }

      if (args.length === 2) {
        args.push(tenantContext);
      } else if (args.length > 2) {
        args[2] = tenantContext;
      } else {
        args.push(tenantContext);
      }
      
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// Service de Isolamento de Dados
export interface ITenantDataIsolationService {
  filterByTenant<T>(data: T[], tenantId: TenantIdVO): T[];
  validateTenantAccess(entityTenantId: TenantIdVO, userTenantId: TenantIdVO): boolean;
  createTenantScopedQuery(baseQuery: any, tenantId: TenantIdVO): any;
}

export class TenantDataIsolationService implements ITenantDataIsolationService {
  filterByTenant<T>(data: T[], tenantId: TenantIdVO): T[] {
    return data.filter((item: any) => 
      item.tenantId && item.tenantId.equals(tenantId)
    );
  }

  validateTenantAccess(entityTenantId: TenantIdVO, userTenantId: TenantIdVO): boolean {
    return entityTenantId.equals(userTenantId);
  }

  createTenantScopedQuery(baseQuery: any, tenantId: TenantIdVO): any {
    return {
      ...baseQuery,
      where: {
        ...baseQuery.where,
        tenantId: tenantId.value
      }
    };
  }
}

// Service de Configuração Multi-tenant
export interface ITenantConfigurationService {
  getTenantConfig(tenantId: TenantIdVO): Promise<any>;
  updateTenantConfig(tenantId: TenantIdVO, config: any): Promise<void>;
  getTenantDatabaseConfig(tenantId: TenantIdVO): Promise<any>;
  getTenantFeatures(tenantId: TenantIdVO): Promise<string[]>;
}

export class TenantConfigurationService implements ITenantConfigurationService {
  constructor(
    private readonly tenantRepository: any // ITenantRepository
  ) {}

  async getTenantConfig(tenantId: TenantIdVO): Promise<any> {
    const tenant = await this.tenantRepository.findByTenantId(tenantId);
    
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    return tenant.settings;
  }

  async updateTenantConfig(tenantId: TenantIdVO, config: any): Promise<void> {
    const tenant = await this.tenantRepository.findByTenantId(tenantId);
    
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const updatedTenant = tenant.updateSettings(config);
    await this.tenantRepository.update(updatedTenant);
  }

  async getTenantDatabaseConfig(tenantId: TenantIdVO): Promise<any> {
    return {
      database: `tenant_${tenantId.value}`,
      schema: tenantId.value,
      connectionString: process.env['DATABASE_URL']?.replace(
        'tenant_db',
        `tenant_${tenantId.value}`
      )
    };
  }

  async getTenantFeatures(tenantId: TenantIdVO): Promise<string[]> {
    const config = await this.getTenantConfig(tenantId);
    return config.features || [];
  }
}

// Service de Migração Multi-tenant
export interface ITenantMigrationService {
  createTenantDatabase(tenantId: TenantIdVO): Promise<void>;
  migrateTenantDatabase(tenantId: TenantIdVO): Promise<void>;
  dropTenantDatabase(tenantId: TenantIdVO): Promise<void>;
  backupTenantData(tenantId: TenantIdVO): Promise<string>;
  restoreTenantData(tenantId: TenantIdVO, backupPath: string): Promise<void>;
}

export class TenantMigrationService implements ITenantMigrationService {
  constructor(
    private readonly databaseService: any // IDatabaseService
  ) {}

  async createTenantDatabase(tenantId: TenantIdVO): Promise<void> {
    const databaseName = `tenant_${tenantId.value}`;
    if (this.databaseService?.createDatabase) {
      await this.databaseService.createDatabase(databaseName);
    }
    if (this.databaseService?.runMigrations) {
      await this.databaseService.runMigrations();
    }
  }

  async migrateTenantDatabase(tenantId: TenantIdVO): Promise<void> {
    if (this.databaseService?.runMigrations) {
      await this.databaseService.runMigrations();
    }
  }

  async dropTenantDatabase(tenantId: TenantIdVO): Promise<void> {
    const databaseName = `tenant_${tenantId.value}`;
    if (this.databaseService?.dropDatabase) {
      await this.databaseService.dropDatabase(databaseName);
    }
  }

  async backupTenantData(tenantId: TenantIdVO): Promise<string> {
    const databaseName = `tenant_${tenantId.value}`;
    const backupPath = `backups/tenant_${tenantId.value}_${Date.now()}.sql`;
    
    if (this.databaseService?.backupDatabase) {
      await this.databaseService.backupDatabase(databaseName, backupPath);
    }
    return backupPath;
  }

  async restoreTenantData(tenantId: TenantIdVO, backupPath: string): Promise<void> {
    const databaseName = `tenant_${tenantId.value}`;
    if (this.databaseService?.restoreDatabase) {
      await this.databaseService.restoreDatabase(databaseName, backupPath);
    }
  }
}
