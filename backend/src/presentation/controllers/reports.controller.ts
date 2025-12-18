import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/presentation/middleware/auth-middleware';
import { TYPES } from '@/shared/types';
import { RequirePermission } from '@/core/permissions/permission-system';
import { RequireTenant } from '@/core/multi-tenant/tenant-context';
import { Logger } from '@/shared/logging/logger';
import { IProjectRepository } from '@/core/interfaces/repositories';
import { ITaskRepository } from '@/core/interfaces/repositories';
import { IClientRepository } from '@/core/interfaces/repositories';
import { ISupplierRepository } from '@/core/interfaces/repositories';
import { TenantIdVO, UserIdVO } from '@/core/entities/tenant';
import { ProjectStatus, TaskStatus, UserRole } from '@/core/base';

@injectable()
export class ReportsController {
  constructor(
    @inject(TYPES.ProjectRepository) private readonly projectRepository: IProjectRepository,
    @inject(TYPES.TaskRepository) private readonly taskRepository: ITaskRepository,
    @inject(TYPES.ClientRepository) private readonly clientRepository: IClientRepository,
    @inject(TYPES.SupplierRepository) private readonly supplierRepository: ISupplierRepository,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  @RequirePermission('reports', 'read')
  @RequireTenant()
  async getDashboardReport(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      if (!tenantContext?.tenantId?.value) {
        this.logger.error('Tenant context is invalid in getDashboardReport', {
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

      const tenantId = new TenantIdVO(tenantContext.tenantId.value);

      // Buscar dados para o relatório
      const [projects, tasks, clients, suppliers] = await Promise.all([
        this.projectRepository.findByTenantId(tenantId),
        this.taskRepository.findByTenantId(tenantId),
        this.clientRepository.findByTenant(tenantId),
        this.supplierRepository.findByTenant(tenantId)
      ]);

      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
      const completedProjects = projects.filter(p => p.status === ProjectStatus.COMPLETED).length;
      const overdueProjects = projects.filter(p => p.isOverdue).length;

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
      const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
      const pendingTasks = tasks.filter(t => t.status === TaskStatus.TODO).length;
      const overdueTasks = tasks.filter(t => t.isOverdue).length;

      const totalClients = clients.length;
      const activeClients = clients.filter(c => c.isActive).length;

      const totalSuppliers = suppliers.length;
      const activeSuppliers = suppliers.filter(s => s.isActive).length;

      // Calcular progresso médio dos projetos
      const averageProgress = totalProjects > 0 
        ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / totalProjects 
        : 0;

      // Calcular tempo estimado vs realizado
      const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
      const totalCompletedHours = tasks.reduce((sum, t) => sum + (t.completedHours || 0), 0);

      const report = {
        summary: {
          projects: {
            total: totalProjects,
            active: activeProjects,
            completed: completedProjects,
            overdue: overdueProjects,
            averageProgress: Math.round(averageProgress)
          },
          tasks: {
            total: totalTasks,
            completed: completedTasks,
            inProgress: inProgressTasks,
            pending: pendingTasks,
            overdue: overdueTasks
          },
          clients: {
            total: totalClients,
            active: activeClients
          },
          suppliers: {
            total: totalSuppliers,
            active: activeSuppliers
          },
          timeTracking: {
            estimatedHours: totalEstimatedHours,
            completedHours: totalCompletedHours,
            efficiency: totalEstimatedHours > 0 
              ? Math.round((totalCompletedHours / totalEstimatedHours) * 100) 
              : 0
          }
        },
        trends: {
          projectStatusDistribution: {
            active: activeProjects,
            completed: completedProjects,
            overdue: overdueProjects
          },
          taskStatusDistribution: {
            completed: completedTasks,
            inProgress: inProgressTasks,
            pending: pendingTasks,
            overdue: overdueTasks
          }
        },
        generatedAt: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        data: report
      });

    } catch (error) {
      this.logger.error('Failed to generate dashboard report', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        requestId: req.headers['x-request-id'],
        tenantId: tenantContext?.tenantId?.value
      });

      res.status(500).json({
        error: 'Internal server error',
        message: process.env['NODE_ENV'] === 'development' 
          ? (error as Error).message 
          : 'Failed to generate dashboard report'
      });
    }
  }

  @RequirePermission('reports', 'read')
  @RequireTenant()
  async getProjectReport(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { projectId } = req.params;
      const tenantId = new TenantIdVO(tenantContext.tenantId.value);

      const project = await this.projectRepository.findByProjectId({ value: projectId! } as any);
      
      if (!project || project.tenantId.value !== tenantId.value) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Project not found'
        });
        return;
      }

      const tasks = await this.taskRepository.findByProjectId({ value: projectId! } as any);

      const report = {
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          progress: project.progress,
          budget: project.budget,
          timeline: project.timeline,
          isOverdue: project.isOverdue
        },
        tasks: {
          total: tasks.length,
          completed: tasks.filter(t => t.status === TaskStatus.DONE).length,
          inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
          pending: tasks.filter(t => t.status === TaskStatus.TODO).length,
          overdue: tasks.filter(t => t.isOverdue).length
        },
        timeTracking: {
          estimatedHours: tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
          completedHours: tasks.reduce((sum, t) => sum + (t.completedHours || 0), 0)
        },
        generatedAt: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        data: report
      });

    } catch (error) {
      this.logger.error('Failed to generate project report', {
        error: (error as Error).message,
        projectId: req.params['projectId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to generate project report'
      });
    }
  }

  @RequirePermission('reports', 'read')
  @RequireTenant()
  async getTaskReport(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { taskId } = req.params;
      const tenantId = new TenantIdVO(tenantContext.tenantId.value);

      const task = await this.taskRepository.findByTaskId({ value: taskId! } as any);
      
      if (!task || task.tenantId.value !== tenantId.value) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Task not found'
        });
        return;
      }

      const report = {
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          progress: task.progress,
          estimatedHours: task.estimatedHours,
          completedHours: task.completedHours,
          dueDate: task.dueDate,
          isOverdue: task.isOverdue
        },
        timeTracking: {
          estimatedHours: task.estimatedHours || 0,
          completedHours: task.completedHours || 0,
          efficiency: task.estimatedHours && task.estimatedHours > 0
            ? Math.round(((task.completedHours || 0) / task.estimatedHours) * 100)
            : 0
        },
        generatedAt: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        data: report
      });

    } catch (error) {
      this.logger.error('Failed to generate task report', {
        error: (error as Error).message,
        taskId: req.params['taskId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to generate task report'
      });
    }
  }

  @RequirePermission('reports', 'read')
  @RequireTenant()
  async getClientReport(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { clientId } = req.params;
      const tenantId = new TenantIdVO(tenantContext.tenantId.value);

      const client = await this.clientRepository.findById(clientId!);
      
      if (!client || client.tenantId.value !== tenantId.value) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Client not found'
        });
        return;
      }

      const projects = await this.projectRepository.findByClientId(clientId!);

      const report = {
        client: {
          id: client.id,
          name: client.name,
          cnpj: client.cnpj,
          email: client.email,
          phone: client.phone,
          address: client.address,
          isActive: client.isActive
        },
        projects: {
          total: projects.length,
          active: projects.filter(p => p.status === ProjectStatus.ACTIVE).length,
          completed: projects.filter(p => p.status === ProjectStatus.COMPLETED).length,
          overdue: projects.filter(p => p.isOverdue).length
        },
        generatedAt: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        data: report
      });

    } catch (error) {
      this.logger.error('Failed to generate client report', {
        error: (error as Error).message,
        clientId: req.params['clientId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to generate client report'
      });
    }
  }

  @RequirePermission('reports', 'read')
  @RequireTenant()
  async getSupplierReport(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { supplierId } = req.params;
      const tenantId = new TenantIdVO(tenantContext.tenantId.value);

      const supplier = await this.supplierRepository.findById(supplierId!);
      
      if (!supplier || supplier.tenantId.value !== tenantId.value) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Supplier not found'
        });
        return;
      }

      const report = {
        supplier: {
          id: supplier.id,
          name: supplier.name,
          cnpj: supplier.cnpj,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          services: supplier.services,
          isActive: supplier.isActive
        },
        services: {
          total: supplier.services?.length || 0,
          list: supplier.services || []
        },
        generatedAt: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        data: report
      });

    } catch (error) {
      this.logger.error('Failed to generate supplier report', {
        error: (error as Error).message,
        supplierId: req.params['supplierId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to generate supplier report'
      });
    }
  }

  @RequirePermission('reports', 'read')
  @RequireTenant()
  async getManagerDashboard(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      if (!tenantContext?.tenantId?.value) {
        this.logger.error('Tenant context is invalid in getManagerDashboard', {
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

      const tenantId = new TenantIdVO(tenantContext.tenantId.value);
      const user = (req as AuthenticatedRequest).user;
      const userId = user?.userId || '';

      const [projects, tasks] = await Promise.all([
        this.projectRepository.findByManagerId(userId),
        this.taskRepository.findByTenantId(tenantId)
      ]);

      const report = {
        projects: {
          total: projects.length,
          active: projects.filter(p => p.status === ProjectStatus.ACTIVE).length,
          completed: projects.filter(p => p.status === ProjectStatus.COMPLETED).length
        },
        tasks: {
          total: tasks.length,
          completed: tasks.filter(t => t.status === TaskStatus.DONE).length,
          inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length
        },
        generatedAt: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      this.logger.error('Failed to generate manager dashboard', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        tenantId: tenantContext?.tenantId?.value
      });
      res.status(500).json({
        error: 'Internal server error',
        message: process.env['NODE_ENV'] === 'development' 
          ? (error as Error).message 
          : 'Failed to generate manager dashboard'
      });
    }
  }

  @RequirePermission('reports', 'read')
  @RequireTenant()
  async getEmployeeDashboard(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      if (!tenantContext?.tenantId?.value) {
        this.logger.error('Tenant context is invalid in getEmployeeDashboard', {
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

      const tenantId = new TenantIdVO(tenantContext.tenantId.value);
      const user = (req as AuthenticatedRequest).user;
      const userId = user?.userId || '';

      const tasks = await this.taskRepository.findByAssigneeId(userId);

      const report = {
        tasks: {
          total: tasks.length,
          completed: tasks.filter(t => t.status === TaskStatus.DONE).length,
          inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
          pending: tasks.filter(t => t.status === TaskStatus.TODO).length
        },
        generatedAt: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      this.logger.error('Failed to generate employee dashboard', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        tenantId: tenantContext?.tenantId?.value
      });
      res.status(500).json({
        error: 'Internal server error',
        message: process.env['NODE_ENV'] === 'development' 
          ? (error as Error).message 
          : 'Failed to generate employee dashboard'
      });
    }
  }

  @RequirePermission('reports', 'read')
  @RequireTenant()
  async getDirectorDashboard(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      if (!tenantContext?.tenantId?.value) {
        this.logger.error('Tenant context is invalid in getDirectorDashboard', {
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

      const tenantId = new TenantIdVO(tenantContext.tenantId.value);

      const [projects, tasks, clients, suppliers] = await Promise.all([
        this.projectRepository.findByTenantId(tenantId),
        this.taskRepository.findByTenantId(tenantId),
        this.clientRepository.findByTenant(tenantId),
        this.supplierRepository.findByTenant(tenantId)
      ]);

      const report = {
        overview: {
          projects: projects.length,
          tasks: tasks.length,
          clients: clients.length,
          suppliers: suppliers.length
        },
        status: {
          activeProjects: projects.filter(p => p.status === ProjectStatus.ACTIVE).length,
          completedProjects: projects.filter(p => p.status === ProjectStatus.COMPLETED).length,
          completedTasks: tasks.filter(t => t.status === TaskStatus.DONE).length
        },
        generatedAt: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      this.logger.error('Failed to generate director dashboard', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        tenantId: tenantContext?.tenantId?.value
      });
      res.status(500).json({
        error: 'Internal server error',
        message: process.env['NODE_ENV'] === 'development' 
          ? (error as Error).message 
          : 'Failed to generate director dashboard'
      });
    }
  }
}
