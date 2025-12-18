import { injectable, inject } from 'inversify';
import { ICreateTaskUseCase, CreateTaskRequest, CreateTaskResponse } from '../index';
import { ITaskService } from '@/core/interfaces/services';
import { TaskPriority } from '@/core/base';
import { TYPES } from '@/shared/types';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class CreateTaskUseCase implements ICreateTaskUseCase {
  constructor(
    @inject(TYPES.TaskService) private readonly taskService: ITaskService
  ) {}

  async execute(request: CreateTaskRequest): Promise<CreateTaskResponse> {
    this.validateRequest(request);

    const taskId = request.taskId || uuidv4();

    const createData: any = {
      taskId,
      title: request.title,
      description: request.description,
      projectId: request.projectId,
      assigneeId: request.assigneeId,
      reporterId: request.reporterId,
      tenantId: request.tenantId
    };

    if (request.priority !== undefined) createData.priority = request.priority;
    if (request.dueDate !== undefined) createData.dueDate = request.dueDate;
    if (request.estimatedHours !== undefined) createData.estimatedHours = request.estimatedHours;

    const task = await this.taskService.create(createData);

    return { task };
  }

  private validateRequest(request: CreateTaskRequest): void {
    if (!request.title || request.title.trim().length === 0) {
      throw new Error('Task title is required');
    }

    if (!request.description || request.description.trim().length === 0) {
      throw new Error('Task description is required');
    }

    if (!request.projectId || request.projectId.trim().length === 0) {
      throw new Error('Project ID is required');
    }

    if (!request.assigneeId || request.assigneeId.trim().length === 0) {
      throw new Error('Assignee ID is required');
    }

    if (!request.reporterId || request.reporterId.trim().length === 0) {
      throw new Error('Reporter ID is required');
    }

    if (!request.tenantId || request.tenantId.trim().length === 0) {
      throw new Error('Tenant ID is required');
    }

    if (request.priority && !Object.values(TaskPriority).includes(request.priority)) {
      throw new Error('Invalid task priority');
    }

    if (request.dueDate && request.dueDate < new Date()) {
      throw new Error('Due date cannot be in the past');
    }

    if (request.estimatedHours !== undefined && request.estimatedHours < 0) {
      throw new Error('Estimated hours cannot be negative');
    }
  }
}
