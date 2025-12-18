import { injectable, inject } from 'inversify';
import { IReassignTaskUseCase, ReassignTaskRequest, ReassignTaskResponse } from '../index';
import { ITaskService } from '@/core/interfaces/services';
import { TYPES } from '@/shared/types';

@injectable()
export class ReassignTaskUseCase implements IReassignTaskUseCase {
  constructor(
    @inject(TYPES.TaskService) private readonly taskService: ITaskService
  ) {}

  async execute(request: ReassignTaskRequest): Promise<ReassignTaskResponse> {
    this.validateRequest(request);

    const task = await this.taskService.reassign(request.taskId, request.newAssigneeId);

    return { task };
  }

  private validateRequest(request: ReassignTaskRequest): void {
    if (!request.taskId || request.taskId.trim().length === 0) {
      throw new Error('Task ID is required');
    }

    if (!request.newAssigneeId || request.newAssigneeId.trim().length === 0) {
      throw new Error('New assignee ID is required');
    }
  }
}
