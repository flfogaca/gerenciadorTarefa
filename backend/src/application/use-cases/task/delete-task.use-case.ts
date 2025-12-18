import { injectable, inject } from 'inversify';
import { IDeleteTaskUseCase, DeleteTaskRequest, DeleteTaskResponse } from '../index';
import { ITaskService } from '@/core/interfaces/services';
import { TYPES } from '@/shared/types';
import { Logger } from '@/shared/logging/logger';

@injectable()
export class DeleteTaskUseCase implements IDeleteTaskUseCase {
  constructor(
    @inject(TYPES.TaskService) private readonly taskService: ITaskService,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  async execute(request: DeleteTaskRequest): Promise<DeleteTaskResponse> {
    this.validateRequest(request);

    const task = await this.taskService.findById(request.taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }

    await this.taskService.delete(request.taskId);

    this.logger.info('Task deleted', {
      taskId: request.taskId
    });

    return { 
      success: true,
      taskId: request.taskId
    };
  }

  private validateRequest(request: DeleteTaskRequest): void {
    if (!request.taskId || request.taskId.trim().length === 0) {
      throw new Error('Task ID is required');
    }
  }
}

