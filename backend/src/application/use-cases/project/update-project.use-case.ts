import { injectable, inject } from 'inversify';
import { IUpdateProjectUseCase, UpdateProjectRequest, UpdateProjectResponse } from '../index';
import { IProjectService } from '@/core/interfaces/services';
import { ProjectBudget, ProjectTimeline } from '@/core/entities/project';
import { TYPES } from '@/shared/types';

@injectable()
export class UpdateProjectUseCase implements IUpdateProjectUseCase {
  constructor(
    @inject(TYPES.ProjectService) private readonly projectService: IProjectService
  ) {}

  async execute(request: UpdateProjectRequest): Promise<UpdateProjectResponse> {
    this.validateRequest(request);

    const updateData: any = {};
    if (request.name !== undefined) updateData.name = request.name;
    if (request.description !== undefined) updateData.description = request.description;
    if (request.clientId !== undefined) updateData.clientId = request.clientId;
    if (request.managerId !== undefined) updateData.managerId = request.managerId;
    if (request.budget !== undefined) updateData.budget = request.budget;
    if (request.timeline !== undefined) updateData.timeline = request.timeline;

    const project = await this.projectService.update(request.projectId, updateData);

    return { project };
  }

  private validateRequest(request: UpdateProjectRequest): void {
    if (!request.projectId || request.projectId.trim().length === 0) {
      throw new Error('Project ID is required');
    }

    if (request.name !== undefined && request.name.trim().length === 0) {
      throw new Error('Project name cannot be empty');
    }

    if (request.description !== undefined && request.description.trim().length === 0) {
      throw new Error('Project description cannot be empty');
    }

    if (request.budget) {
      this.validateBudget(request.budget);
    }

    if (request.timeline) {
      this.validateTimeline(request.timeline);
    }
  }

  private validateBudget(budget: ProjectBudget): void {
    if (budget.planned <= 0) {
      throw new Error('Planned budget must be greater than 0');
    }

    if (budget.spent < 0) {
      throw new Error('Spent budget cannot be negative');
    }

    if (!budget.currency || budget.currency.trim().length === 0) {
      throw new Error('Currency is required');
    }
  }

  private validateTimeline(timeline: ProjectTimeline): void {
    if (!timeline.startDate) {
      throw new Error('Start date is required');
    }

    if (!timeline.endDate) {
      throw new Error('End date is required');
    }

    if (timeline.startDate >= timeline.endDate) {
      throw new Error('Start date must be before end date');
    }
  }
}
