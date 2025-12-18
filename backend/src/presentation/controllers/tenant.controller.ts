import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { 
  ICreateTenantUseCase,
  CreateTenantResponse,
  IUpdateTenantUseCase,
  UpdateTenantResponse,
  IGetTenantUseCase,
  GetTenantResponse,
  IListTenantsUseCase,
  ListTenantsResponse
} from '@/application/use-cases';
import { TYPES } from '@/shared/types';
import { RequirePermission } from '@/core/permissions/permission-system';
import { RequireTenant } from '@/core/multi-tenant/tenant-context';
import { ValidationService } from '@/shared/validation/validation.service';
import { Logger } from '@/shared/logging/logger';
import Joi from 'joi';

@injectable()
export class TenantController {
  private readonly createTenantSchema = Joi.object({
    tenantId: Joi.string().min(3).max(50).pattern(/^[a-zA-Z0-9_-]+$/).required(),
    name: Joi.string().min(2).max(100).required(),
    domain: Joi.string().min(3).max(100).pattern(/^[a-zA-Z0-9.-]+$/).required(),
    adminEmail: Joi.string().email().required(),
    adminPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
    adminFirstName: Joi.string().min(2).max(50).required(),
    adminLastName: Joi.string().min(2).max(50).required(),
    settings: Joi.object().optional()
  });

  private readonly updateTenantSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    domain: Joi.string().min(3).max(100).pattern(/^[a-zA-Z0-9.-]+$/).optional(),
    settings: Joi.object().optional()
  });

  constructor(
    @inject(TYPES.CreateTenantUseCase) private readonly createTenantUseCase: ICreateTenantUseCase,
    @inject(TYPES.UpdateTenantUseCase) private readonly updateTenantUseCase: IUpdateTenantUseCase,
    @inject(TYPES.GetTenantUseCase) private readonly getTenantUseCase: IGetTenantUseCase,
    @inject(TYPES.ListTenantsUseCase) private readonly listTenantsUseCase: IListTenantsUseCase,
    @inject(TYPES.ValidationService) private readonly validationService: ValidationService,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  @RequirePermission('tenant', 'create')
  async createTenant(req: Request, res: Response): Promise<void> {
    try {
      // Validação de entrada
      const validationResult = await this.validationService.validate(this.createTenantSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      // Executar caso de uso
      const result: CreateTenantResponse = await this.createTenantUseCase.execute(req.body);

      // Log da ação
      this.logger.info('Tenant created successfully', {
        tenantId: result.tenant.tenantId.value,
        adminEmail: result.adminUser.email.value,
        requestId: req.headers['x-request-id']
      });

      // Resposta de sucesso
      res.status(201).json({
        success: true,
        data: {
          tenant: {
            id: result.tenant.id,
            tenantId: result.tenant.tenantId.value,
            name: result.tenant.name,
            domain: result.tenant.domain,
            isActive: result.tenant.isActive,
            createdAt: result.tenant.createdAt
          },
          adminUser: {
            id: result.adminUser.id,
            userId: result.adminUser.userId.value,
            email: result.adminUser.email.value,
            firstName: result.adminUser.firstName,
            lastName: result.adminUser.lastName,
            role: result.adminUser.role,
            createdAt: result.adminUser.createdAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to create tenant', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create tenant'
      });
    }
  }

  @RequirePermission('tenant', 'read')
  @RequireTenant()
  async getTenant(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { tenantId } = req.params;

      if (!tenantId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Tenant ID is required'
        });
        return;
      }

      // Verificar se o usuário tem acesso ao tenant
      if (tenantContext.tenantId.value !== tenantId) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only access your own tenant'
        });
        return;
      }

      const result: GetTenantResponse = await this.getTenantUseCase.execute({ tenantId });

      res.status(200).json({
        success: true,
        data: {
          tenant: {
            id: result.tenant.id,
            tenantId: result.tenant.tenantId.value,
            name: result.tenant.name,
            domain: result.tenant.domain,
            settings: result.tenant.settings,
            isActive: result.tenant.isActive,
            createdAt: result.tenant.createdAt,
            updatedAt: result.tenant.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to get tenant', {
        error: (error as Error).message,
        tenantId: req.params['tenantId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve tenant'
      });
    }
  }

  @RequirePermission('tenant', 'update')
  @RequireTenant()
  async updateTenant(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { tenantId } = req.params;

      if (!tenantId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Tenant ID is required'
        });
        return;
      }

      // Verificar se o usuário tem acesso ao tenant
      if (tenantContext.tenantId.value !== tenantId) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update your own tenant'
        });
        return;
      }

      // Validação de entrada
      const validationResult = await this.validationService.validate(this.updateTenantSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const result: UpdateTenantResponse = await this.updateTenantUseCase.execute({
        tenantId,
        ...req.body
      });

      res.status(200).json({
        success: true,
        data: {
          tenant: {
            id: result.tenant.id,
            tenantId: result.tenant.tenantId.value,
            name: result.tenant.name,
            domain: result.tenant.domain,
            settings: result.tenant.settings,
            isActive: result.tenant.isActive,
            createdAt: result.tenant.createdAt,
            updatedAt: result.tenant.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to update tenant', {
        error: (error as Error).message,
        tenantId: req.params['tenantId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update tenant'
      });
    }
  }

  async getPublicSettings(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listTenantsUseCase.execute({ limit: 1 });
      const tenant = result.tenants[0];

      if (!tenant) {
        res.status(200).json({
          success: true,
          data: {
            allowUserRegistration: false,
          }
        });
        return;
      }

      const settings = tenant.settings as any || {};

      res.status(200).json({
        success: true,
        data: {
          allowUserRegistration: settings.allowUserRegistration === true,
          requireEmailVerification: settings.requireEmailVerification !== false,
        }
      });
    } catch (error) {
      res.status(200).json({
        success: true,
        data: {
          allowUserRegistration: false,
        }
      });
    }
  }

  @RequirePermission('tenant', 'read')
  async listTenants(req: Request, res: Response): Promise<void> {
    try {
      const limitParam = req.query['limit'] as string | undefined;
      const offsetParam = req.query['offset'] as string | undefined;
      const isActiveParam = req.query['isActive'] as string | undefined;
      const domainParam = req.query['domain'] as string | undefined;

      const limitValue = limitParam !== undefined ? Number(limitParam) : undefined;
      const offsetValue = offsetParam !== undefined ? Number(offsetParam) : undefined;

      if (limitValue !== undefined && (!Number.isInteger(limitValue) || limitValue < 1)) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Invalid limit value'
        });
        return;
      }

      if (offsetValue !== undefined && (!Number.isInteger(offsetValue) || offsetValue < 0)) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Invalid offset value'
        });
        return;
      }

      const filters: { isActive?: boolean; domain?: string } = {};

      if (isActiveParam === 'true') {
        filters.isActive = true;
      } else if (isActiveParam === 'false') {
        filters.isActive = false;
      }

      if (domainParam !== undefined && domainParam.trim().length === 0) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Invalid domain value'
        });
        return;
      }

      if (domainParam) {
        filters.domain = domainParam;
      }

      const hasFilters = Object.keys(filters).length > 0;

      const result: ListTenantsResponse = await this.listTenantsUseCase.execute({
        limit: limitValue,
        offset: offsetValue,
        filters: hasFilters ? filters : undefined
      });

      res.status(200).json({
        success: true,
        data: {
          tenants: result.tenants.map(tenant => ({
            id: tenant.id,
            tenantId: tenant.tenantId.value,
            name: tenant.name,
            domain: tenant.domain,
            settings: tenant.settings,
            isActive: tenant.isActive,
            createdAt: tenant.createdAt,
            updatedAt: tenant.updatedAt
          })),
          total: result.total,
          limit: limitValue ?? 10,
          offset: offsetValue ?? 0
        }
      });

    } catch (error) {
      this.logger.error('Failed to list tenants', {
        error: (error as Error).message,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to list tenants'
      });
    }
  }
}
