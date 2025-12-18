import { injectable, inject } from 'inversify';
import { IUpdateTaskUseCase, UpdateTaskRequest, UpdateTaskResponse } from '../index';
import { ITaskService } from '@/core/interfaces/services';
import { TaskPriority } from '@/core/base';
import { TYPES } from '@/shared/types';

@injectable()
export class UpdateTaskUseCase implements IUpdateTaskUseCase {
  constructor(
    @inject(TYPES.TaskService) private readonly taskService: ITaskService
  ) {}

  async execute(request: UpdateTaskRequest): Promise<UpdateTaskResponse> {
    this.validateRequest(request);

    const updateData: any = {};
    if (request.title !== undefined) updateData.title = request.title;
    if (request.description !== undefined) updateData.description = request.description;
    if (request.assigneeId !== undefined) updateData.assigneeId = request.assigneeId;
    if (request.priority !== undefined) updateData.priority = request.priority;
    if (request.dueDate !== undefined) updateData.dueDate = request.dueDate;
    if (request.estimatedHours !== undefined) updateData.estimatedHours = request.estimatedHours;

    const task = await this.taskService.update(request.taskId, updateData);

    return { task };
  }

  private validateRequest(request: UpdateTaskRequest): void {
    if (!request.taskId || request.taskId.trim().length === 0) {
      throw new Error('Task ID is required');
    }

    if (request.title !== undefined && request.title.trim().length === 0) {
      throw new Error('Task title cannot be empty');
    }

    if (request.description !== undefined && request.description.trim().length === 0) {
      throw new Error('Task description cannot be empty');
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
