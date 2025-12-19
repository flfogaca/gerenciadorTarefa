import { injectable, inject } from 'inversify';
import { ICreateProjectUseCase, CreateProjectRequest, CreateProjectResponse } from '../index';
import { IProjectService } from '@/core/interfaces/services';
import { ProjectBudget, ProjectTimeline } from '@/core/entities/project';
import { TYPES } from '@/shared/types';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class CreateProjectUseCase implements ICreateProjectUseCase {
  constructor(
    @inject(TYPES.ProjectService) private readonly projectService: IProjectService
  ) {}

  async execute(request: CreateProjectRequest): Promise<CreateProjectResponse> {
    this.validateRequest(request);

    const projectId = request.projectId || uuidv4();

    const project = await this.projectService.create({
      projectId,
      name: request.name,
      description: request.description,
      clientId: request.clientId,
      managerId: request.managerId,
      tenantId: request.tenantId,
      budget: request.budget,
      timeline: request.timeline
    });

    return { project };
  }

  private validateRequest(request: CreateProjectRequest): void {
    if (!request.name || request.name.trim().length === 0) {
      throw new Error('Project name is required');
    }

    if (!request.description || request.description.trim().length === 0) {
      throw new Error('Project description is required');
    }

    if (!request.clientId || request.clientId.trim().length === 0) {
      throw new Error('Client ID is required');
    }

    if (!request.managerId || request.managerId.trim().length === 0) {
      throw new Error('Manager ID is required');
    }

    if (!request.tenantId || request.tenantId.trim().length === 0) {
      throw new Error('Tenant ID is required');
    }

    if (!request.budget) {
      throw new Error('Project budget is required');
    }

    if (!request.timeline) {
      throw new Error('Project timeline is required');
    }

    this.validateBudget(request.budget);
    this.validateTimeline(request.timeline);
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
