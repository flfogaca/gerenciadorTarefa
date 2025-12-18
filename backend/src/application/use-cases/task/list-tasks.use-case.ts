import { injectable, inject } from 'inversify';
import { IListTasksUseCase, ListTasksRequest, ListTasksResponse } from '../index';
import { ITaskService } from '@/core/interfaces/services';
import { TenantIdVO } from '@/core/entities/tenant';
import { TYPES } from '@/shared/types';

@injectable()
export class ListTasksUseCase implements IListTasksUseCase {
  constructor(
    @inject(TYPES.TaskService) private readonly taskService: ITaskService
  ) {}

  async execute(request: ListTasksRequest): Promise<ListTasksResponse> {
    this.validateRequest(request);

    const tenantId = new TenantIdVO(request.tenantId);
    const tasks = await this.taskService.findByTenantId(tenantId);

    let filteredTasks = tasks;

    if (request.filters) {
      if (request.filters.projectId) {
        const projectTasks = await this.taskService.findByProjectId(request.filters.projectId);
        filteredTasks = filteredTasks.filter((task: any) => 
          projectTasks.some((pt: any) => pt.id === task.id)
        );
      }

      if (request.filters.assigneeId) {
        const assigneeTasks = await this.taskService.findByAssigneeId(request.filters.assigneeId);
        filteredTasks = filteredTasks.filter((task: any) => 
          assigneeTasks.some((at: any) => at.id === task.id)
        );
      }

      if (request.filters.status) {
        filteredTasks = filteredTasks.filter((task: any) => task.status === request.filters!.status);
      }

      if (request.filters.priority) {
        filteredTasks = filteredTasks.filter((task: any) => task.priority === request.filters!.priority);
      }

      if (request.filters.search) {
        const searchTerm = request.filters.search.toLowerCase();
        filteredTasks = filteredTasks.filter((task: any) => 
          task.title.toLowerCase().includes(searchTerm) ||
          task.description.toLowerCase().includes(searchTerm)
        );
      }
    }

    const total = filteredTasks.length;
    const limit = request.limit || 10;
    const offset = request.offset || 0;
    const paginatedTasks = filteredTasks.slice(offset, offset + limit);

    return {
      tasks: paginatedTasks,
      total
    };
  }

  private validateRequest(request: ListTasksRequest): void {
    if (!request.tenantId || request.tenantId.trim().length === 0) {
      throw new Error('Tenant ID is required');
    }

    if (request.limit !== undefined && request.limit < 1) {
      throw new Error('Limit must be greater than 0');
    }

    if (request.offset !== undefined && request.offset < 0) {
      throw new Error('Offset must be greater than or equal to 0');
    }
  }
}
