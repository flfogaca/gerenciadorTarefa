import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/presentation/middleware/auth-middleware';
import { TYPES } from '@/shared/types';
import { ITemplateService } from '@/core/interfaces/services';
import { RequirePermission } from '@/core/permissions/permission-system';
import { RequireTenant } from '@/core/multi-tenant/tenant-context';
import { ValidationService } from '@/shared/validation/validation.service';
import { Logger } from '@/shared/logging/logger';
import { TemplateIdVO } from '@/core/entities/template';
import { TenantIdVO } from '@/core/entities/tenant';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class TemplateController {
  private readonly createTemplateSchema = Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).optional(),
    category: Joi.string().required(),
    phases: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      tasks: Joi.array().items(Joi.object({
        title: Joi.string().required(),
        description: Joi.string().optional(),
        priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
        estimatedHours: Joi.number().min(0).optional(),
        assigneeRole: Joi.string().optional(),
        dependencies: Joi.array().items(Joi.string()).optional()
      })).optional(),
      duration: Joi.number().min(0).optional(),
      order: Joi.number().min(0).optional()
    })).optional(),
    tasks: Joi.array().items(Joi.object({
      title: Joi.string().required(),
      description: Joi.string().optional(),
      priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
      estimatedHours: Joi.number().min(0).optional(),
      assigneeRole: Joi.string().optional(),
      dependencies: Joi.array().items(Joi.string()).optional()
    })).optional(),
    isPublic: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string()).optional()
  });

  private readonly updateTemplateSchema = Joi.object({
    name: Joi.string().min(2).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    category: Joi.string().optional(),
    phases: Joi.array().items(Joi.object()).optional(),
    tasks: Joi.array().items(Joi.object()).optional(),
    isPublic: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    settings: Joi.object().optional()
  });

  private readonly useTemplateSchema = Joi.object({
    projectId: Joi.string().required()
  });

  constructor(
    @inject(TYPES.TemplateService) private readonly templateService: ITemplateService,
    @inject(TYPES.ValidationService) private readonly validationService: ValidationService,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  @RequirePermission('templates', 'create')
  @RequireTenant()
  async createTemplate(req: AuthenticatedRequest, res: Response, tenantContext: any): Promise<void> {
    try {
      const validationResult = await this.validationService.validate(this.createTemplateSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID is required'
        });
        return;
      }

      const templateId = `TMP-${uuidv4().substring(0, 8).toUpperCase()}`;
      const template = await this.templateService.create({
        templateId,
        tenantId: tenantContext.tenantId.value,
        name: req.body.name,
        description: req.body.description || '',
        category: req.body.category,
        createdBy: userId,
        phases: req.body.phases || [],
        tasks: req.body.tasks || [],
        isPublic: req.body.isPublic || false,
        tags: req.body.tags || []
      });

      this.logger.info('Template created successfully', {
        templateId: template.templateId.value,
        name: template.name,
        tenantId: template.tenantId.value,
        requestId: req.headers['x-request-id']
      });

      res.status(201).json({
        success: true,
        data: {
          template: {
            id: template.id,
            templateId: template.templateId.value,
            name: template.name,
            description: template.description,
            category: template.category,
            isDefault: template.isDefault,
            isPublic: template.isPublic,
            phases: template.phases,
            tasks: template.tasks,
            tags: template.tags,
            usageCount: template.usageCount,
            rating: template.rating,
            createdAt: template.createdAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to create template', {
        error: (error as Error).message,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create template'
      });
    }
  }

  @RequirePermission('templates', 'read')
  @RequireTenant()
  async getTemplates(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const limit = Number(req.query['limit']) || 50;
      const offset = Number(req.query['offset']) || 0;
      const category = req.query['category'] as string | undefined;
      const isPublic = req.query['isPublic'] as string | undefined;
      const search = req.query['search'] as string | undefined;

      const templates = await this.templateService.findByTenantId(tenantContext.tenantId.value);

      const filteredTemplates = templates
        .filter((t: any) => {
          if (category && t.category !== category) return false;
          if (isPublic !== undefined && t.isPublic !== (isPublic === 'true')) return false;
          if (search) {
            const searchLower = search.toLowerCase();
            return t.name.toLowerCase().includes(searchLower) ||
                   t.description.toLowerCase().includes(searchLower) ||
                   t.tags.some((tag: any) => tag.toLowerCase().includes(searchLower));
          }
          return true;
        })
        .slice(offset, offset + limit);

      res.status(200).json({
        success: true,
        data: {
          templates: filteredTemplates.map((t: any) => ({
            id: t.id,
            templateId: t.templateId.value,
            name: t.name,
            description: t.description,
            category: t.category,
            isDefault: t.isDefault,
            isPublic: t.isPublic,
            phases: t.phases,
            tasks: t.tasks,
            tags: t.tags,
            usageCount: t.usageCount,
            rating: t.rating,
            lastUsedAt: t.lastUsedAt,
            createdAt: t.createdAt
          })),
          total: filteredTemplates.length,
          limit,
          offset
        }
      });

    } catch (error) {
      this.logger.error('Failed to get templates', {
        error: (error as Error).message,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve templates'
      });
    }
  }

  @RequirePermission('templates', 'read')
  @RequireTenant()
  async getTemplate(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { templateId } = req.params;

      const template = await this.templateService.findByTemplateId(templateId!);

      if (!template) {
        res.status(404).json({
          error: 'Not found',
          message: 'Template not found'
        });
        return;
      }

      if (template.tenantId.value !== tenantContext.tenantId.value && !template.isPublic) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only access templates from your own tenant or public templates'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          template: {
            id: template.id,
            templateId: template.templateId.value,
            name: template.name,
            description: template.description,
            category: template.category,
            isDefault: template.isDefault,
            isPublic: template.isPublic,
            phases: template.phases,
            tasks: template.tasks,
            tags: template.tags,
            usageCount: template.usageCount,
            rating: template.rating,
            lastUsedAt: template.lastUsedAt,
            createdAt: template.createdAt,
            updatedAt: template.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to get template', {
        error: (error as Error).message,
        templateId: req.params['templateId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve template'
      });
    }
  }

  @RequirePermission('templates', 'update')
  @RequireTenant()
  async updateTemplate(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { templateId } = req.params;

      const validationResult = await this.validationService.validate(this.updateTemplateSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const template = await this.templateService.findByTemplateId(templateId!);
      if (!template) {
        res.status(404).json({
          error: 'Not found',
          message: 'Template not found'
        });
        return;
      }

      if (template.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update templates from your own tenant'
        });
        return;
      }

      const updatedTemplate = await this.templateService.update(template.id, req.body);

      res.status(200).json({
        success: true,
        data: {
          template: {
            id: updatedTemplate.id,
            templateId: updatedTemplate.templateId.value,
            name: updatedTemplate.name,
            description: updatedTemplate.description,
            category: updatedTemplate.category,
            isDefault: updatedTemplate.isDefault,
            isPublic: updatedTemplate.isPublic,
            phases: updatedTemplate.phases,
            tasks: updatedTemplate.tasks,
            tags: updatedTemplate.tags,
            updatedAt: updatedTemplate.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to update template', {
        error: (error as Error).message,
        templateId: req.params['templateId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update template'
      });
    }
  }

  @RequirePermission('templates', 'delete')
  @RequireTenant()
  async deleteTemplate(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { templateId } = req.params;

      const template = await this.templateService.findByTemplateId(templateId!);
      if (!template) {
        res.status(404).json({
          error: 'Not found',
          message: 'Template not found'
        });
        return;
      }

      if (template.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only delete templates from your own tenant'
        });
        return;
      }

      await this.templateService.delete(template.id);

      this.logger.info('Template deleted successfully', {
        templateId: template.templateId.value,
        requestId: req.headers['x-request-id']
      });

      res.status(200).json({
        success: true,
        data: {
          message: 'Template deleted successfully',
          templateId: template.templateId.value
        }
      });

    } catch (error) {
      this.logger.error('Failed to delete template', {
        error: (error as Error).message,
        templateId: req.params['templateId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete template'
      });
    }
  }

  @RequirePermission('templates', 'read')
  @RequireTenant()
  async useTemplate(req: AuthenticatedRequest, res: Response, tenantContext: any): Promise<void> {
    try {
      const { templateId } = req.params;

      const validationResult = await this.validationService.validate(this.useTemplateSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const template = await this.templateService.findByTemplateId(templateId!);
      if (!template) {
        res.status(404).json({
          error: 'Not found',
          message: 'Template not found'
        });
        return;
      }

      if (template.tenantId.value !== tenantContext.tenantId.value && !template.isPublic) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only use templates from your own tenant or public templates'
        });
        return;
      }

      await this.templateService.useTemplate(templateId!, req.body.projectId, tenantContext.tenantId.value);

      this.logger.info('Template used successfully', {
        templateId: template.templateId.value,
        projectId: req.body.projectId,
        requestId: req.headers['x-request-id']
      });

      res.status(200).json({
        success: true,
        data: {
          message: 'Template applied successfully',
          templateId: template.templateId.value,
          projectId: req.body.projectId
        }
      });

    } catch (error) {
      this.logger.error('Failed to use template', {
        error: (error as Error).message,
        templateId: req.params['templateId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to use template'
      });
    }
  }
}

