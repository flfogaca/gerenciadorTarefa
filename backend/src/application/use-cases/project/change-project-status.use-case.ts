import { injectable, inject } from 'inversify';
import { IChangeProjectStatusUseCase, ChangeProjectStatusRequest, ChangeProjectStatusResponse } from '../index';
import { IProjectService } from '@/core/interfaces/services';
import { ProjectStatus } from '@/core/base';
import { TYPES } from '@/shared/types';

@injectable()
export class ChangeProjectStatusUseCase implements IChangeProjectStatusUseCase {
  constructor(
    @inject(TYPES.ProjectService) private readonly projectService: IProjectService
  ) {}

  async execute(request: ChangeProjectStatusRequest): Promise<ChangeProjectStatusResponse> {
    this.validateRequest(request);

    const project = await this.projectService.changeStatus(request.projectId, request.status);

    return { project };
  }

  private validateRequest(request: ChangeProjectStatusRequest): void {
    if (!request.projectId || request.projectId.trim().length === 0) {
      throw new Error('Project ID is required');
    }

    if (!request.status || request.status.trim().length === 0) {
      throw new Error('Status is required');
    }

    if (!Object.values(ProjectStatus).includes(request.status as ProjectStatus)) {
      throw new Error('Invalid project status');
    }
  }
}
