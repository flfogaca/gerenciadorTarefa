import { injectable, inject } from 'inversify';
import { ILogTimeUseCase, LogTimeRequest, LogTimeResponse } from '../index';
import { ITaskService } from '@/core/interfaces/services';
import { TYPES } from '@/shared/types';

@injectable()
export class LogTimeUseCase implements ILogTimeUseCase {
  constructor(
    @inject(TYPES.TaskService) private readonly taskService: ITaskService
  ) {}

  async execute(request: LogTimeRequest): Promise<LogTimeResponse> {
    this.validateRequest(request);

    const task = await this.taskService.logTime(
      request.taskId,
      request.userId,
      request.duration,
      request.description
    );

    return { task };
  }

  private validateRequest(request: LogTimeRequest): void {
    if (!request.taskId || request.taskId.trim().length === 0) {
      throw new Error('Task ID is required');
    }

    if (!request.userId || request.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    if (!request.duration || request.duration <= 0) {
      throw new Error('Duration must be greater than 0');
    }

    if (request.duration > 24) {
      throw new Error('Duration cannot exceed 24 hours');
    }
  }
}
