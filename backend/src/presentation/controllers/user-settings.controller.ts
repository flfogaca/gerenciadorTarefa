import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/presentation/middleware/auth-middleware';
import { TYPES } from '@/shared/types';
import { IUserSettingsService } from '@/core/interfaces/services';
import { RequirePermission } from '@/core/permissions/permission-system';
import { RequireTenant } from '@/core/multi-tenant/tenant-context';
import { ValidationService } from '@/shared/validation/validation.service';
import { Logger } from '@/shared/logging/logger';
import Joi from 'joi';

@injectable()
export class UserSettingsController {
  private readonly updateSettingsSchema = Joi.object({
    settings: Joi.object().optional(),
    preferences: Joi.object().optional(),
    notifications: Joi.object().optional(),
    theme: Joi.string().valid('light', 'dark', 'auto').optional(),
    language: Joi.string().optional(),
    timezone: Joi.string().optional()
  });

  constructor(
    @inject(TYPES.UserSettingsService) private readonly userSettingsService: IUserSettingsService,
    @inject(TYPES.ValidationService) private readonly validationService: ValidationService,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  @RequirePermission('settings', 'read')
  @RequireTenant()
  async getMySettings(req: AuthenticatedRequest, res: Response, tenantContext: any): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID is required'
        });
        return;
      }

      let settings = await this.userSettingsService.findByUserId(userId);

      if (!settings) {
        settings = await this.userSettingsService.getOrCreate(userId, tenantContext.tenantId.value);
      }

      if (settings.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only access your own settings'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          settings: {
            id: settings.id,
            userId: settings.userId.value,
            tenantId: settings.tenantId.value,
            settings: settings.settings,
            preferences: settings.preferences,
            notifications: settings.notifications,
            theme: settings.theme,
            language: settings.language,
            timezone: settings.timezone,
            createdAt: settings.createdAt,
            updatedAt: settings.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to get user settings', {
        error: (error as Error).message,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve user settings'
      });
    }
  }

  @RequirePermission('settings', 'update')
  @RequireTenant()
  async updateMySettings(req: AuthenticatedRequest, res: Response, tenantContext: any): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID is required'
        });
        return;
      }

      const validationResult = await this.validationService.validate(this.updateSettingsSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      let settings = await this.userSettingsService.findByUserId(userId);

      if (!settings) {
        settings = await this.userSettingsService.getOrCreate(userId, tenantContext.tenantId.value);
      }

      if (settings.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update your own settings'
        });
        return;
      }

      const updatedSettings = await this.userSettingsService.update(settings.id, req.body);

      this.logger.info('User settings updated successfully', {
        userId: updatedSettings.userId.value,
        requestId: req.headers['x-request-id']
      });

      res.status(200).json({
        success: true,
        data: {
          settings: {
            id: updatedSettings.id,
            userId: updatedSettings.userId.value,
            tenantId: updatedSettings.tenantId.value,
            settings: updatedSettings.settings,
            preferences: updatedSettings.preferences,
            notifications: updatedSettings.notifications,
            theme: updatedSettings.theme,
            language: updatedSettings.language,
            timezone: updatedSettings.timezone,
            updatedAt: updatedSettings.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to update user settings', {
        error: (error as Error).message,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update user settings'
      });
    }
  }
}

