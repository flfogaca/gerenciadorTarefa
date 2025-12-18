import { injectable, inject } from 'inversify';
import { IListProjectsUseCase, ListProjectsRequest, ListProjectsResponse } from '../index';
import { IProjectService } from '@/core/interfaces/services';
import { TenantIdVO } from '@/core/entities/tenant';
import { TYPES } from '@/shared/types';

@injectable()
export class ListProjectsUseCase implements IListProjectsUseCase {
  constructor(
    @inject(TYPES.ProjectService) private readonly projectService: IProjectService
  ) {}

  async execute(request: ListProjectsRequest): Promise<ListProjectsResponse> {
    this.validateRequest(request);

    const tenantId = new TenantIdVO(request.tenantId);
    const projects = await this.projectService.findByTenantId(tenantId);

    let filteredProjects = projects;

    if (request.filters) {
      if (request.filters.status) {
        filteredProjects = filteredProjects.filter(project => project.status === request.filters!.status);
      }

      if (request.filters.managerId) {
        filteredProjects = filteredProjects.filter(project => project.managerId.value === request.filters!.managerId);
      }

      if (request.filters.clientId) {
        filteredProjects = filteredProjects.filter(project => project.clientId === request.filters!.clientId);
      }

      if (request.filters.search) {
        const searchTerm = request.filters.search.toLowerCase();
        filteredProjects = filteredProjects.filter(project => 
          project.name.toLowerCase().includes(searchTerm) ||
          project.description.toLowerCase().includes(searchTerm)
        );
      }
    }

    const total = filteredProjects.length;
    const limit = request.limit || 10;
    const offset = request.offset || 0;
    const paginatedProjects = filteredProjects.slice(offset, offset + limit);

    return {
      projects: paginatedProjects,
      total
    };
  }

  private validateRequest(request: ListProjectsRequest): void {
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
