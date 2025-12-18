import { injectable, inject } from 'inversify';
import { IGetTaskUseCase, GetTaskRequest, GetTaskResponse } from '../index';
import { ITaskService } from '@/core/interfaces/services';
import { TYPES } from '@/shared/types';

@injectable()
export class GetTaskUseCase implements IGetTaskUseCase {
  constructor(
    @inject(TYPES.TaskService) private readonly taskService: ITaskService
  ) {}

  async execute(request: GetTaskRequest): Promise<GetTaskResponse> {
    this.validateRequest(request);

    const task = await this.taskService.findByTaskId(request.taskId);
    if (!task) {
      throw new Error(`Task with ID ${request.taskId} not found`);
    }

    return { task };
  }

  private validateRequest(request: GetTaskRequest): void {
    if (!request.taskId || request.taskId.trim().length === 0) {
      throw new Error('Task ID is required');
    }
  }
}
