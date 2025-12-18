import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/presentation/middleware/auth-middleware';
import { TYPES } from '@/shared/types';
import { ITenantSettingsService } from '@/core/interfaces/services';
import { RequirePermission } from '@/core/permissions/permission-system';
import { RequireTenant } from '@/core/multi-tenant/tenant-context';
import { ValidationService } from '@/shared/validation/validation.service';
import { Logger } from '@/shared/logging/logger';
import Joi from 'joi';

@injectable()
export class TenantSettingsController {
  private readonly updateSettingsSchema = Joi.object({
    settings: Joi.object().optional(),
    features: Joi.object().optional(),
    integrations: Joi.object().optional(),
    branding: Joi.object().optional(),
    limits: Joi.object().optional()
  });

  constructor(
    @inject(TYPES.TenantSettingsService) private readonly tenantSettingsService: ITenantSettingsService,
    @inject(TYPES.ValidationService) private readonly validationService: ValidationService,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  @RequirePermission('settings', 'read')
  @RequireTenant()
  async getTenantSettings(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      let settings = await this.tenantSettingsService.findByTenantId(tenantContext.tenantId.value);

      if (!settings) {
        settings = await this.tenantSettingsService.getOrCreate(tenantContext.tenantId.value);
      }

      res.status(200).json({
        success: true,
        data: {
          settings: {
            id: settings.id,
            tenantId: settings.tenantId.value,
            settings: settings.settings,
            features: settings.features,
            integrations: settings.integrations,
            branding: settings.branding,
            limits: settings.limits,
            createdAt: settings.createdAt,
            updatedAt: settings.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to get tenant settings', {
        error: (error as Error).message,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve tenant settings'
      });
    }
  }

  @RequirePermission('settings', 'update')
  @RequireTenant()
  async updateTenantSettings(req: AuthenticatedRequest, res: Response, tenantContext: any): Promise<void> {
    try {
      const validationResult = await this.validationService.validate(this.updateSettingsSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      let settings = await this.tenantSettingsService.findByTenantId(tenantContext.tenantId.value);

      if (!settings) {
        settings = await this.tenantSettingsService.getOrCreate(tenantContext.tenantId.value);
      }

      const updatedSettings = await this.tenantSettingsService.update(settings.id, req.body);

      this.logger.info('Tenant settings updated successfully', {
        tenantId: updatedSettings.tenantId.value,
        requestId: req.headers['x-request-id']
      });

      res.status(200).json({
        success: true,
        data: {
          settings: {
            id: updatedSettings.id,
            tenantId: updatedSettings.tenantId.value,
            settings: updatedSettings.settings,
            features: updatedSettings.features,
            integrations: updatedSettings.integrations,
            branding: updatedSettings.branding,
            limits: updatedSettings.limits,
            updatedAt: updatedSettings.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to update tenant settings', {
        error: (error as Error).message,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update tenant settings'
      });
    }
  }
}

