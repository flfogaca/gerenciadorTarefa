import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/presentation/middleware/auth-middleware';
import { 
  ICreateTaskUseCase, 
  IUpdateTaskUseCase, 
  IGetTaskUseCase,
  IListTasksUseCase,
  IChangeTaskStatusUseCase,
  IReassignTaskUseCase,
  ILogTimeUseCase,
  IDeleteTaskUseCase,
  CreateTaskResponse,
  UpdateTaskResponse,
  GetTaskResponse,
  ListTasksRequest,
  ListTasksResponse,
  ChangeTaskStatusResponse,
  ReassignTaskResponse,
  LogTimeResponse,
  DeleteTaskResponse
} from '@/application/use-cases';
import { TYPES } from '@/shared/types';
import { RequirePermission } from '@/core/permissions/permission-system';
import { RequireTenant } from '@/core/multi-tenant/tenant-context';
import { ValidationService } from '@/shared/validation/validation.service';
import { Logger } from '@/shared/logging/logger';
import { TaskStatus, TaskPriority } from '@/core/base';
import { ITaskService } from '@/core/interfaces/services';
import { FileController } from './file.controller';
import { TaskAttachment } from '@/core/entities/task';
import { UserIdVO } from '@/core/entities/tenant';
import { randomUUID } from 'crypto';
import Joi from 'joi';

@injectable()
export class TaskController {
  private readonly createTaskSchema = Joi.object({
    taskId: Joi.string().optional(),
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().min(10).max(2000).required(),
    projectId: Joi.string().required(),
    assigneeId: Joi.string().required(),
    reporterId: Joi.string().required(),
    tenantId: Joi.string().required(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
    dueDate: Joi.date().greater('now').optional(),
    estimatedHours: Joi.number().min(0).max(1000).optional()
  });

  private readonly updateTaskSchema = Joi.object({
    title: Joi.string().min(2).max(200).optional(),
    description: Joi.string().min(10).max(2000).optional(),
    assigneeId: Joi.string().optional(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
    dueDate: Joi.date().greater('now').optional(),
    estimatedHours: Joi.number().min(0).max(1000).optional()
  });

  private readonly changeStatusSchema = Joi.object({
    status: Joi.string().valid('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED').required()
  });

  private readonly reassignSchema = Joi.object({
    newAssigneeId: Joi.string().required()
  });

  private readonly logTimeSchema = Joi.object({
    duration: Joi.number().min(0.1).max(24).required(),
    description: Joi.string().max(500).optional()
  });

  private readonly addCommentSchema = Joi.object({
    content: Joi.string().min(1).max(2000).required()
  });

  constructor(
    @inject(TYPES.CreateTaskUseCase) private readonly createTaskUseCase: ICreateTaskUseCase,
    @inject(TYPES.UpdateTaskUseCase) private readonly updateTaskUseCase: IUpdateTaskUseCase,
    @inject(TYPES.GetTaskUseCase) private readonly getTaskUseCase: IGetTaskUseCase,
    @inject(TYPES.ListTasksUseCase) private readonly listTasksUseCase: IListTasksUseCase,
    @inject(TYPES.ChangeTaskStatusUseCase) private readonly changeTaskStatusUseCase: IChangeTaskStatusUseCase,
    @inject(TYPES.ReassignTaskUseCase) private readonly reassignTaskUseCase: IReassignTaskUseCase,
    @inject(TYPES.LogTimeUseCase) private readonly logTimeUseCase: ILogTimeUseCase,
    @inject(TYPES.DeleteTaskUseCase) private readonly deleteTaskUseCase: IDeleteTaskUseCase,
    @inject(TYPES.TaskService) private readonly taskService: ITaskService,
    @inject(TYPES.ValidationService) private readonly validationService: ValidationService,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  @RequirePermission('tasks', 'create')
  @RequireTenant()
  async createTask(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const validationResult = await this.validationService.validate(this.createTaskSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const requestData = {
        ...req.body,
        tenantId: tenantContext.tenantId.value
      };

      const result: CreateTaskResponse = await this.createTaskUseCase.execute(requestData);

      this.logger.info('Task created successfully', {
        taskId: result.task.taskId.value,
        title: result.task.title,
        tenantId: result.task.tenantId.value,
        requestId: req.headers['x-request-id']
      });

      res.status(201).json({
        success: true,
        data: {
          task: {
            id: result.task.id,
            taskId: result.task.taskId.value,
            title: result.task.title,
            description: result.task.description,
            projectId: result.task.projectId.value,
            assigneeId: result.task.assigneeId.value,
            reporterId: result.task.reporterId.value,
            status: result.task.status,
            priority: result.task.priority,
            dueDate: result.task.dueDate,
            estimatedHours: result.task.estimatedHours,
            completedHours: result.task.completedHours,
            progress: result.task.progress,
            isOverdue: result.task.isOverdue,
            createdAt: result.task.createdAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to create task', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create task'
      });
    }
  }

  @RequirePermission('tasks', 'read')
  @RequireTenant()
  async getTask(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { taskId } = req.params;

      const result: GetTaskResponse = await this.getTaskUseCase.execute({ taskId: taskId! });

      if (result.task.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only access tasks from your own tenant'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          task: {
            id: result.task.id,
            taskId: result.task.taskId.value,
            title: result.task.title,
            description: result.task.description,
            projectId: result.task.projectId.value,
            assigneeId: result.task.assigneeId.value,
            reporterId: result.task.reporterId.value,
            status: result.task.status,
            priority: result.task.priority,
            dueDate: result.task.dueDate,
            estimatedHours: result.task.estimatedHours,
            completedHours: result.task.completedHours,
            tags: result.task.tags,
            attachments: result.task.attachments,
            comments: result.task.comments,
            watchers: result.task.watchers.map(w => w.value),
            subtasks: result.task.subtasks,
            timeTracking: result.task.timeTracking,
            progress: result.task.progress,
            isOverdue: result.task.isOverdue,
            remainingHours: result.task.remainingHours,
            createdAt: result.task.createdAt,
            updatedAt: result.task.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to get task', {
        error: (error as Error).message,
        taskId: req.params['taskId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve task'
      });
    }
  }

  @RequirePermission('tasks', 'update')
  @RequireTenant()
  async updateTask(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { taskId } = req.params;

      const validationResult = await this.validationService.validate(this.updateTaskSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const result: UpdateTaskResponse = await this.updateTaskUseCase.execute({
        taskId,
        ...req.body
      });

      if (result.task.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update tasks from your own tenant'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          task: {
            id: result.task.id,
            taskId: result.task.taskId.value,
            title: result.task.title,
            description: result.task.description,
            projectId: result.task.projectId.value,
            assigneeId: result.task.assigneeId.value,
            reporterId: result.task.reporterId.value,
            status: result.task.status,
            priority: result.task.priority,
            dueDate: result.task.dueDate,
            estimatedHours: result.task.estimatedHours,
            completedHours: result.task.completedHours,
            progress: result.task.progress,
            updatedAt: result.task.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to update task', {
        error: (error as Error).message,
        taskId: req.params['taskId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update task'
      });
    }
  }

  @RequirePermission('tasks', 'update')
  @RequireTenant()
  async changeTaskStatus(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { taskId } = req.params;

      const validationResult = await this.validationService.validate(this.changeStatusSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const result: ChangeTaskStatusResponse = await this.changeTaskStatusUseCase.execute({
        taskId,
        ...req.body
      });

      if (result.task.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only change status of tasks from your own tenant'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          task: {
            id: result.task.id,
            taskId: result.task.taskId.value,
            title: result.task.title,
            status: result.task.status,
            progress: result.task.progress,
            updatedAt: result.task.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to change task status', {
        error: (error as Error).message,
        taskId: req.params['taskId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to change task status'
      });
    }
  }

  @RequirePermission('tasks', 'update')
  @RequireTenant()
  async reassignTask(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { taskId } = req.params;

      const validationResult = await this.validationService.validate(this.reassignSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const result: ReassignTaskResponse = await this.reassignTaskUseCase.execute({
        taskId,
        ...req.body
      });

      if (result.task.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only reassign tasks from your own tenant'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          task: {
            id: result.task.id,
            taskId: result.task.taskId.value,
            title: result.task.title,
            assigneeId: result.task.assigneeId.value,
            updatedAt: result.task.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to reassign task', {
        error: (error as Error).message,
        taskId: req.params['taskId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to reassign task'
      });
    }
  }

  @RequirePermission('tasks', 'update')
  @RequireTenant()
  async logTime(req: AuthenticatedRequest, res: Response, tenantContext: any): Promise<void> {
    try {
      const { taskId } = req.params;
      const userId = req.user?.userId || req.body.userId;

      if (!userId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'User ID is required'
        });
        return;
      }

      const validationResult = await this.validationService.validate(this.logTimeSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const result: LogTimeResponse = await this.logTimeUseCase.execute({
        taskId,
        userId,
        ...req.body
      });

      if (result.task.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only log time to tasks from your own tenant'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          task: {
            id: result.task.id,
            taskId: result.task.taskId.value,
            title: result.task.title,
            completedHours: result.task.completedHours,
            progress: result.task.progress,
            timeTracking: result.task.timeTracking,
            updatedAt: result.task.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to log time', {
        error: (error as Error).message,
        taskId: req.params['taskId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to log time'
      });
    }
  }

  @RequirePermission('tasks', 'read')
  @RequireTenant()
  async listTasks(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const limitParam = req.query['limit'] as string | undefined;
      const offsetParam = req.query['offset'] as string | undefined;
      const statusParam = req.query['status'] as string | undefined;
      const priorityParam = req.query['priority'] as string | undefined;
      const projectParam = req.query['projectId'] as string | undefined;
      const assigneeParam = req.query['assigneeId'] as string | undefined;
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

      const filters: ListTasksRequest['filters'] = {};

      if (statusParam) {
        const normalizedStatus = statusParam.toUpperCase() as keyof typeof TaskStatus;
        if (TaskStatus[normalizedStatus]) {
          filters.status = TaskStatus[normalizedStatus];
        }
      }

      if (priorityParam) {
        const normalizedPriority = priorityParam.toUpperCase() as keyof typeof TaskPriority;
        if (TaskPriority[normalizedPriority]) {
          filters.priority = TaskPriority[normalizedPriority];
        }
      }

      if (projectParam) {
        filters.projectId = projectParam;
      }

      if (assigneeParam) {
        filters.assigneeId = assigneeParam;
      }

      if (searchParam) {
        filters.search = searchParam;
      }

      if (!tenantContext?.tenantId?.value) {
        this.logger.error('Tenant context is invalid in listTasks', {
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

      const requestPayload = {
        tenantId: tenantContext.tenantId.value,
        limit,
        offset,
        filters: Object.keys(filters).length > 0 ? filters : undefined
      };

      const result: ListTasksResponse = await this.listTasksUseCase.execute(requestPayload);

      res.status(200).json({
        success: true,
        data: {
          tasks: result.tasks.map(task => ({
            id: task.id,
            taskId: task.taskId.value,
            title: task.title,
            description: task.description,
            projectId: task.projectId.value,
            assigneeId: task.assigneeId.value,
            reporterId: task.reporterId.value,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
            estimatedHours: task.estimatedHours,
            completedHours: task.completedHours,
            progress: task.progress,
            isOverdue: task.isOverdue,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
          })),
          total: result.total,
          limit,
          offset
        }
      });

    } catch (error) {
      this.logger.error('Failed to list tasks', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        requestId: req.headers['x-request-id'],
        tenantId: tenantContext?.tenantId?.value
      });

      res.status(500).json({
        error: 'Internal server error',
        message: process.env['NODE_ENV'] === 'development' 
          ? (error as Error).message 
          : 'Failed to list tasks'
      });
    }
  }

  @RequirePermission('tasks', 'delete')
  @RequireTenant()
  async deleteTask(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { taskId } = req.params;

      const result: DeleteTaskResponse = await this.deleteTaskUseCase.execute({ taskId: taskId! });

      this.logger.info('Task deleted successfully', {
        taskId: result.taskId,
        requestId: req.headers['x-request-id']
      });

      res.status(200).json({
        success: true,
        data: {
          message: 'Task deleted successfully',
          taskId: result.taskId
        }
      });

    } catch (error) {
      this.logger.error('Failed to delete task', {
        error: (error as Error).message,
        taskId: req.params['taskId'],
        requestId: req.headers['x-request-id']
      });

      if ((error as Error).message === 'Task not found') {
        res.status(404).json({
          error: 'Not found',
          message: 'Task not found'
        });
        return;
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete task'
      });
    }
  }

  @RequirePermission('tasks', 'update')
  @RequireTenant()
  async addComment(req: AuthenticatedRequest, res: Response, tenantContext: any): Promise<void> {
    try {
      const { taskId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User ID is required'
        });
        return;
      }

      const validationResult = await this.validationService.validate(this.addCommentSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const task = await this.taskService.addComment(taskId!, userId, req.body.content);

      if (task.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only add comments to tasks from your own tenant'
        });
        return;
      }

      this.logger.info('Comment added successfully', {
        taskId,
        userId,
        requestId: req.headers['x-request-id']
      });

      res.status(201).json({
        success: true,
        data: {
          task: {
            id: task.id,
            taskId: task.taskId.value,
            comments: task.comments
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to add comment', {
        error: (error as Error).message,
        taskId: req.params['taskId'],
        requestId: req.headers['x-request-id']
      });

      if ((error as Error).message.includes('not found')) {
        res.status(404).json({
          error: 'Not found',
          message: (error as Error).message
        });
        return;
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to add comment'
      });
    }
  }

  @RequirePermission('tasks', 'update')
  @RequireTenant()
  async uploadFiles(req: AuthenticatedRequest, res: Response, tenantContext: any): Promise<void> {
    try {
      const { taskId } = req.params;
      const files = (req as any).files || ((req as any).file ? [(req as any).file] : []);

      if (!files || files.length === 0) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'No files uploaded'
        });
        return;
      }

      const taskResult: GetTaskResponse = await this.getTaskUseCase.execute({ taskId: taskId! });

      if (taskResult.task.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only upload files to tasks from your own tenant'
        });
        return;
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const userId = req.user?.userId || '';
      
      const currentAttachments = taskResult.task.attachments || [];
      const uploadedAttachments: TaskAttachment[] = files.map((file: Express.Multer.File) => ({
        id: randomUUID(),
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        url: `${baseUrl}/api/v1/files/raw/${file.filename}`,
        uploadedAt: new Date(),
        uploadedBy: new UserIdVO(userId)
      }));

      const allAttachments = [...currentAttachments, ...uploadedAttachments];
      
      await this.taskService.update(taskId!, {
        attachments: allAttachments.map((att: TaskAttachment) => ({
          id: att.id,
          name: att.name,
          mimeType: att.type,
          type: att.type,
          size: att.size,
          url: att.url,
          uploadedBy: att.uploadedBy.value,
          uploadedAt: att.uploadedAt.toISOString()
        }))
      });

      const uploadedFiles = uploadedAttachments.map(att => ({
        id: att.id,
        name: att.name,
        filename: files.find((f: Express.Multer.File) => f.originalname === att.name)?.filename,
        size: att.size,
        mimeType: att.type,
        url: att.url,
        uploadedBy: att.uploadedBy.value,
        uploadedAt: att.uploadedAt.toISOString()
      }));

      const updatedTaskResult: GetTaskResponse = await this.getTaskUseCase.execute({ taskId: taskId! });

      this.logger.info('Files uploaded successfully', {
        taskId,
        fileCount: files.length,
        requestId: req.headers['x-request-id']
      });

      res.status(201).json({
        success: true,
        data: {
          files: uploadedFiles,
          task: {
            id: updatedTaskResult.task.id,
            taskId: updatedTaskResult.task.taskId.value,
            attachments: updatedTaskResult.task.attachments
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to upload files', {
        error: (error as Error).message,
        taskId: req.params['taskId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to upload files'
      });
    }
  }

  @RequirePermission('tasks', 'update')
  @RequireTenant()
  async deleteFile(req: AuthenticatedRequest, res: Response, tenantContext: any): Promise<void> {
    try {
      const { taskId, fileId } = req.params;

      const taskResult: GetTaskResponse = await this.getTaskUseCase.execute({ taskId: taskId! });

      if (taskResult.task.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only delete files from tasks from your own tenant'
        });
        return;
      }

      const currentAttachments = taskResult.task.attachments || [];
      const fileExists = currentAttachments.some((file: TaskAttachment) => file.id === fileId);

      if (!fileExists) {
        res.status(404).json({
          error: 'Not found',
          message: 'File not found in task attachments'
        });
        return;
      }

      const updatedAttachments = currentAttachments
        .filter((file: TaskAttachment) => file.id !== fileId)
        .map((att: TaskAttachment) => ({
          id: att.id,
          name: att.name,
          mimeType: att.type,
          type: att.type,
          size: att.size,
          url: att.url,
          uploadedBy: att.uploadedBy.value,
          uploadedAt: att.uploadedAt.toISOString()
        }));

      await this.taskService.update(taskId!, {
        attachments: updatedAttachments
      });

      const updatedTaskResult: GetTaskResponse = await this.getTaskUseCase.execute({ taskId: taskId! });

      this.logger.info('File deleted successfully', {
        taskId,
        fileId,
        requestId: req.headers['x-request-id']
      });

      res.status(200).json({
        success: true,
        data: {
          message: 'File deleted successfully',
          task: {
            id: updatedTaskResult.task.id,
            taskId: updatedTaskResult.task.taskId.value,
            attachments: updatedTaskResult.task.attachments
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to delete file', {
        error: (error as Error).message,
        taskId: req.params['taskId'],
        fileId: req.params['fileId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete file'
      });
    }
  }
}
