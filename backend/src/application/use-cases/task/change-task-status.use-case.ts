import { injectable, inject } from 'inversify';
import { IChangeTaskStatusUseCase, ChangeTaskStatusRequest, ChangeTaskStatusResponse } from '../index';
import { ITaskService } from '@/core/interfaces/services';
import { TaskStatus } from '@/core/base';
import { TYPES } from '@/shared/types';

@injectable()
export class ChangeTaskStatusUseCase implements IChangeTaskStatusUseCase {
  constructor(
    @inject(TYPES.TaskService) private readonly taskService: ITaskService
  ) {}

  async execute(request: ChangeTaskStatusRequest): Promise<ChangeTaskStatusResponse> {
    this.validateRequest(request);

    const task = await this.taskService.changeStatus(request.taskId, request.status);

    return { task };
  }

  private validateRequest(request: ChangeTaskStatusRequest): void {
    if (!request.taskId || request.taskId.trim().length === 0) {
      throw new Error('Task ID is required');
    }

    if (!request.status || request.status.trim().length === 0) {
      throw new Error('Status is required');
    }

    if (!Object.values(TaskStatus).includes(request.status)) {
      throw new Error('Invalid task status');
    }
  }
}
