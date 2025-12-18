import { injectable, inject } from 'inversify';
import { IGetProjectUseCase, GetProjectRequest, GetProjectResponse } from '../index';
import { IProjectService } from '@/core/interfaces/services';
import { TYPES } from '@/shared/types';

@injectable()
export class GetProjectUseCase implements IGetProjectUseCase {
  constructor(
    @inject(TYPES.ProjectService) private readonly projectService: IProjectService
  ) {}

  async execute(request: GetProjectRequest): Promise<GetProjectResponse> {
    this.validateRequest(request);

    const project = await this.projectService.findByProjectId(request.projectId);
    if (!project) {
      throw new Error(`Project with ID ${request.projectId} not found`);
    }

    return { project };
  }

  private validateRequest(request: GetProjectRequest): void {
    if (!request.projectId || request.projectId.trim().length === 0) {
      throw new Error('Project ID is required');
    }
  }
}
