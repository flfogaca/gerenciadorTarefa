import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { 
  ICreateProjectUseCase, 
  IUpdateProjectUseCase, 
  IGetProjectUseCase,
  IListProjectsUseCase,
  IChangeProjectStatusUseCase,
  IDeleteProjectUseCase,
  CreateProjectResponse,
  UpdateProjectResponse,
  GetProjectResponse,
  ListProjectsRequest,
  ListProjectsResponse,
  ChangeProjectStatusResponse,
  DeleteProjectResponse
} from '@/application/use-cases';
import { TYPES } from '@/shared/types';
import { RequirePermission } from '@/core/permissions/permission-system';
import { RequireTenant } from '@/core/multi-tenant/tenant-context';
import { ValidationService } from '@/shared/validation/validation.service';
import { Logger } from '@/shared/logging/logger';
import { DIContainer } from '@/infrastructure/di/container';
import { IProjectService } from '@/core/interfaces/services';
import Joi from 'joi';

@injectable()
export class ProjectController {
  private readonly createProjectSchema = Joi.object({
    projectId: Joi.string().optional(),
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(3).max(1000).required(),
    clientId: Joi.string().required(),
    managerId: Joi.string().required(),
    tenantId: Joi.string().required(),
    size: Joi.string().valid('small', 'medium', 'large').allow(null, '').optional(),
    budget: Joi.object({
      planned: Joi.number().positive().required(),
      spent: Joi.number().min(0).default(0),
      currency: Joi.string().length(3).required(),
      categories: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        planned: Joi.number().positive().required(),
        spent: Joi.number().min(0).default(0),
        description: Joi.string().optional()
      })).default([])
    }).required(),
    timeline: Joi.object({
      startDate: Joi.alternatives().try(Joi.date(), Joi.string().isoDate()).required(),
      endDate: Joi.alternatives().try(Joi.date(), Joi.string().isoDate()).custom((value, helpers) => {
        const startDate = helpers.state.ancestors[0]?.startDate;
        if (startDate) {
          const start = new Date(startDate);
          const end = new Date(value);
          if (end <= start) {
            return helpers.error('any.custom', { message: 'endDate must be greater than startDate' });
          }
        }
        return value;
      }).required(),
      milestones: Joi.array().items(Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        dueDate: Joi.date().required(),
        completed: Joi.boolean().default(false),
        description: Joi.string().optional()
      })).default([])
    }).required()
  });

  private readonly updateProjectSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().min(3).max(1000).optional(),
    clientId: Joi.string().optional(),
    managerId: Joi.string().optional(),
    budget: Joi.object({
      planned: Joi.number().positive().required(),
      spent: Joi.number().min(0).required(),
      currency: Joi.string().length(3).required(),
      categories: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        planned: Joi.number().positive().required(),
        spent: Joi.number().min(0).required(),
        description: Joi.string().optional()
      }))
    }).optional(),
    timeline: Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().greater(Joi.ref('startDate')).required(),
      milestones: Joi.array().items(Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        dueDate: Joi.date().required(),
        completed: Joi.boolean().required(),
        description: Joi.string().optional()
      }))
    }).optional()
  });

  private readonly changeStatusSchema = Joi.object({
    status: Joi.string().valid('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED').required()
  });

  constructor(
    @inject(TYPES.CreateProjectUseCase) private readonly createProjectUseCase: ICreateProjectUseCase,
    @inject(TYPES.UpdateProjectUseCase) private readonly updateProjectUseCase: IUpdateProjectUseCase,
    @inject(TYPES.GetProjectUseCase) private readonly getProjectUseCase: IGetProjectUseCase,
    @inject(TYPES.ListProjectsUseCase) private readonly listProjectsUseCase: IListProjectsUseCase,
    @inject(TYPES.ChangeProjectStatusUseCase) private readonly changeProjectStatusUseCase: IChangeProjectStatusUseCase,
    @inject(TYPES.DeleteProjectUseCase) private readonly deleteProjectUseCase: IDeleteProjectUseCase,
    @inject(TYPES.ValidationService) private readonly validationService: ValidationService,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  @RequirePermission('projects', 'create')
  @RequireTenant()
  async createProject(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const requestData = {
        ...req.body,
        tenantId: tenantContext.tenantId.value,
        timeline: req.body.timeline ? {
          startDate: typeof req.body.timeline.startDate === 'string' 
            ? new Date(req.body.timeline.startDate) 
            : req.body.timeline.startDate,
          endDate: typeof req.body.timeline.endDate === 'string' 
            ? new Date(req.body.timeline.endDate) 
            : req.body.timeline.endDate,
          milestones: req.body.timeline.milestones || []
        } : req.body.timeline
      };

      const validationResult = await this.validationService.validate(this.createProjectSchema, requestData);
      
      if (!validationResult.isValid) {
        this.logger.warn('Validation failed for project creation', {
          errors: validationResult.errors,
          requestData: { ...requestData, budget: '...', timeline: '...' }
        });
        res.status(400).json({
          error: 'Validation failed',
          details: (validationResult.errors || []).map((err: any) => ({
            field: err.path?.join('.') || err.key || 'unknown',
            message: err.message || 'Invalid value'
          })),
          message: 'Dados inválidos. Verifique os campos obrigatórios.'
        });
        return;
      }

      const result: CreateProjectResponse = await this.createProjectUseCase.execute(requestData);

      this.logger.info('Project created successfully', {
        projectId: result.project.projectId.value,
        name: result.project.name,
        tenantId: result.project.tenantId.value,
        requestId: req.headers['x-request-id']
      });

      res.status(201).json({
        success: true,
        data: {
          project: {
            id: result.project.id,
            projectId: result.project.projectId.value,
            name: result.project.name,
            description: result.project.description,
            clientId: result.project.clientId,
            managerId: result.project.managerId.value,
            status: result.project.status,
            budget: result.project.budget,
            timeline: result.project.timeline,
            team: result.project.team,
            progress: result.project.progress,
            isOverdue: result.project.isOverdue,
            createdAt: result.project.createdAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to create project', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: process.env['NODE_ENV'] === 'development' 
          ? (error as Error).message 
          : 'Failed to create project'
      });
    }
  }

  @RequirePermission('projects', 'read')
  @RequireTenant()
  async getProject(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { projectId: paramId } = req.params;

      if (!paramId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Project ID is required'
        });
        return;
      }

      let result: GetProjectResponse | null = null;
      
      try {
        result = await this.getProjectUseCase.execute({ projectId: paramId });
      } catch (error) {
        if ((error as Error).message.includes('not found')) {
          const container = DIContainer.getContainer();
          const projectService = container.get<IProjectService>(TYPES.ProjectService);
          const projectById = await projectService.findById(paramId);
          
          if (projectById && projectById.tenantId.value === tenantContext.tenantId.value) {
            result = { project: projectById };
          }
        }
        
        if (!result) {
          throw error;
        }
      }

      if (!result || !result.project) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Project not found'
        });
        return;
      }

      if (result.project.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only access projects from your own tenant'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          project: {
            id: result.project.id,
            projectId: result.project.projectId.value,
            name: result.project.name,
            description: result.project.description,
            clientId: result.project.clientId,
            managerId: result.project.managerId.value,
            status: result.project.status,
            size: (result.project as any).size || null,
            budget: result.project.budget,
            timeline: result.project.timeline,
            team: result.project.team,
            settings: result.project.settings || {},
            progress: result.project.progress,
            isOverdue: result.project.isOverdue,
            totalBudget: result.project.totalBudget,
            spentBudget: result.project.spentBudget,
            remainingBudget: result.project.remainingBudget,
            createdAt: result.project.createdAt,
            updatedAt: result.project.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to get project', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        projectId: req.params['projectId'],
        requestId: req.headers['x-request-id']
      });

      if ((error as Error).message === 'Project not found' || (error as Error).message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Project not found'
        });
        return;
      }

      res.status(500).json({
        error: 'Internal server error',
        message: process.env['NODE_ENV'] === 'development' 
          ? (error as Error).message 
          : 'Failed to retrieve project'
      });
    }
  }

  @RequirePermission('projects', 'update')
  @RequireTenant()
  async updateProject(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { projectId: paramId } = req.params;

      if (!paramId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Project ID is required'
        });
        return;
      }

      const validationResult = await this.validationService.validate(this.updateProjectSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      let result: UpdateProjectResponse | null = null;
      
      try {
        result = await this.updateProjectUseCase.execute({
          projectId: paramId,
          ...req.body
        });
      } catch (error) {
        if ((error as Error).message.includes('not found') || (error as Error).message.includes('Project with ID')) {
          const container = DIContainer.getContainer();
          const projectService = container.get<IProjectService>(TYPES.ProjectService);
          const existingProject = await projectService.findById(paramId);
          
          if (existingProject && existingProject.tenantId.value === tenantContext.tenantId.value) {
            const updateData: any = {};
            if (req.body.name !== undefined) updateData.name = req.body.name;
            if (req.body.description !== undefined) updateData.description = req.body.description;
            if (req.body.clientId !== undefined) updateData.clientId = req.body.clientId;
            if (req.body.budget !== undefined) updateData.budget = req.body.budget;
            if (req.body.timeline !== undefined) {
              updateData.timeline = {
                startDate: typeof req.body.timeline.startDate === 'string' 
                  ? new Date(req.body.timeline.startDate) 
                  : req.body.timeline.startDate,
                endDate: typeof req.body.timeline.endDate === 'string' 
                  ? new Date(req.body.timeline.endDate) 
                  : req.body.timeline.endDate,
                milestones: req.body.timeline.milestones || []
              };
            }
            const updatedProject = await projectService.update(paramId, updateData);
            result = { project: updatedProject };
          }
        }
        
        if (!result) {
          throw error;
        }
      }

      if (!result || !result.project) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Project not found'
        });
        return;
      }

      if (result.project.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update projects from your own tenant'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          project: {
            id: result.project.id,
            projectId: result.project.projectId.value,
            name: result.project.name,
            description: result.project.description,
            clientId: result.project.clientId,
            managerId: result.project.managerId.value,
            status: result.project.status,
            budget: result.project.budget,
            timeline: result.project.timeline,
            team: result.project.team,
            progress: result.project.progress,
            updatedAt: result.project.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to update project', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        projectId: req.params['projectId'],
        requestId: req.headers['x-request-id']
      });

      if ((error as Error).message === 'Project not found' || (error as Error).message.includes('not found')) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Project not found'
        });
        return;
      }

      res.status(500).json({
        error: 'Internal server error',
        message: process.env['NODE_ENV'] === 'development' 
          ? (error as Error).message 
          : 'Failed to update project'
      });
    }
  }

  @RequirePermission('projects', 'update')
  @RequireTenant()
  async changeProjectStatus(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { projectId } = req.params;

      const validationResult = await this.validationService.validate(this.changeStatusSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const statusMap: Record<string, string> = {
        'PLANNING': 'planning',
        'ACTIVE': 'active',
        'ON_HOLD': 'on_hold',
        'COMPLETED': 'completed',
        'CANCELLED': 'cancelled'
      };

      const normalizedStatus = statusMap[req.body.status] || req.body.status.toLowerCase();

      const result: ChangeProjectStatusResponse = await this.changeProjectStatusUseCase.execute({
        projectId,
        status: normalizedStatus
      });

      if (result.project.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only change status of projects from your own tenant'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          project: {
            id: result.project.id,
            projectId: result.project.projectId.value,
            name: result.project.name,
            status: result.project.status,
            progress: result.project.progress,
            updatedAt: result.project.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to change project status', {
        error: (error as Error).message,
        projectId: req.params['projectId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to change project status'
      });
    }
  }

  @RequirePermission('projects', 'read')
  @RequireTenant()
  async listProjects(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      if (!tenantContext?.tenantId?.value) {
        this.logger.error('Tenant context is invalid in listProjects', {
          hasTenantContext: !!tenantContext,
          hasTenantId: !!tenantContext?.tenantId,
          hasTenantIdValue: !!tenantContext?.tenantId?.value
        });
        res.status(500).json({
          error: 'Internal server error',
          message: 'Tenant context is invalid'
        });
        return;
      }

      const limitParam = req.query['limit'] as string | undefined;
      const offsetParam = req.query['offset'] as string | undefined;
      const statusParam = req.query['status'] as string | undefined;
      const managerParam = req.query['managerId'] as string | undefined;
      const clientParam = req.query['clientId'] as string | undefined;
      const searchParam = req.query['search'] as string | undefined;

      const limit = limitParam ? Number(limitParam) : 10;
      const offset = offsetParam ? Number(offsetParam) : 0;

      if (Number.isNaN(limit) || limit < 1) {
        res.status(400).json({ error: 'Validation failed', message: 'Invalid limit value' });
        return;
      }

      if (Number.isNaN(offset) || offset < 0) {
        res.status(400).json({ error: 'Validation failed', message: 'Invalid offset value' });
        return;
      }

      const filters: ListProjectsRequest['filters'] = {};

      if (statusParam) {
        filters.status = statusParam.toUpperCase();
      }

      if (managerParam) {
        filters.managerId = managerParam;
      }

      if (clientParam) {
        filters.clientId = clientParam;
      }

      if (searchParam) {
        filters.search = searchParam;
      }

      const requestPayload = {
        tenantId: tenantContext.tenantId.value,
        limit,
        offset,
        filters: Object.keys(filters).length > 0 ? filters : undefined
      };

      const result: ListProjectsResponse = await this.listProjectsUseCase.execute(requestPayload);

      res.status(200).json({
        success: true,
        data: {
          projects: result.projects.map(project => ({
            id: project.id,
            projectId: project.projectId.value,
            name: project.name,
            description: project.description,
            clientId: project.clientId,
            managerId: project.managerId.value,
            status: project.status,
            budget: project.budget,
            timeline: project.timeline,
            team: project.team,
            progress: project.progress,
            isOverdue: project.isOverdue,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt
          })),
          total: result.total,
          limit,
          offset
        }
      });

    } catch (error) {
      this.logger.error('Failed to list projects', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        requestId: req.headers['x-request-id'],
        tenantId: tenantContext?.tenantId?.value
      });

      res.status(500).json({
        error: 'Internal server error',
        message: process.env['NODE_ENV'] === 'development' 
          ? (error as Error).message 
          : 'Failed to list projects'
      });
    }
  }

  @RequirePermission('projects', 'delete')
  @RequireTenant()
  async deleteProject(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Project ID is required'
        });
        return;
      }

      const getResult: GetProjectResponse = await this.getProjectUseCase.execute({ projectId: projectId! });
      
      if (getResult.project.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only delete projects from your own tenant'
        });
        return;
      }

      const result: DeleteProjectResponse = await this.deleteProjectUseCase.execute({ projectId: projectId! });

      this.logger.info('Project deleted successfully', {
        projectId: result.projectId,
        requestId: req.headers['x-request-id']
      });

      res.status(200).json({
        success: true,
        data: {
          message: 'Project deleted successfully',
          projectId: result.projectId
        }
      });

    } catch (error) {
      this.logger.error('Failed to delete project', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        projectId: req.params['projectId'],
        requestId: req.headers['x-request-id']
      });

      if ((error as Error).message === 'Project not found' || (error as Error).message.includes('not found')) {
        res.status(404).json({
          error: 'Not found',
          message: 'Project not found'
        });
        return;
      }

      res.status(500).json({
        error: 'Internal server error',
        message: process.env['NODE_ENV'] === 'development' 
          ? (error as Error).message 
          : 'Failed to delete project'
      });
    }
  }
}
