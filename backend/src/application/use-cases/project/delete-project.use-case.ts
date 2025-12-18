import { injectable, inject } from 'inversify';
import { IDeleteProjectUseCase, DeleteProjectRequest, DeleteProjectResponse } from '../index';
import { IProjectService } from '@/core/interfaces/services';
import { TYPES } from '@/shared/types';
import { Logger } from '@/shared/logging/logger';

@injectable()
export class DeleteProjectUseCase implements IDeleteProjectUseCase {
  constructor(
    @inject(TYPES.ProjectService) private readonly projectService: IProjectService,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  async execute(request: DeleteProjectRequest): Promise<DeleteProjectResponse> {
    this.validateRequest(request);

    const project = await this.projectService.findById(request.projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }

    await this.projectService.delete(request.projectId);

    this.logger.info('Project deleted', {
      projectId: request.projectId
    });

    return { 
      success: true,
      projectId: request.projectId
    };
  }

  private validateRequest(request: DeleteProjectRequest): void {
    if (!request.projectId || request.projectId.trim().length === 0) {
      throw new Error('Project ID is required');
    }
  }
}

