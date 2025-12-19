import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IProjectService, CreateProjectDTO, UpdateProjectDTO, ProjectProgress, ProjectStats } from '@/core/interfaces/services';
import { IProjectRepository } from '@/core/interfaces/repositories';
import { Project, ProjectIdVO, ProjectBudget, ProjectTimeline, ProjectTeamMember } from '@/core/entities/project';
import { TenantIdVO, UserIdVO } from '@/core/entities/tenant';
import { ProjectStatus } from '@/core/base';
import { ILogger } from '@/shared/logging/logger';

@injectable()
export class ProjectService implements IProjectService {
  constructor(
    @inject(TYPES.ProjectRepository) private readonly projectRepository: IProjectRepository,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  async create(dto: CreateProjectDTO): Promise<Project> {
    try {
      this.logger.info('Creating project', { projectId: dto.projectId, tenantId: dto.tenantId });

      const tenantId = new TenantIdVO(dto.tenantId);
      const projectId = new ProjectIdVO(dto.projectId);
      
      const existingProject = await this.projectRepository.findByProjectId(projectId);
      if (existingProject) {
        throw new Error(`Project with ID ${dto.projectId} already exists`);
      }

      const project = Project.create(
        projectId,
        tenantId,
        dto.name,
        dto.description,
        dto.clientId,
        new UserIdVO(dto.managerId),
        dto.budget,
        dto.timeline
      );

      const savedProject = await this.projectRepository.save(project);
      
      this.logger.info('Project created successfully', { 
        projectId: savedProject.projectId.value,
        name: savedProject.name,
        tenantId: savedProject.tenantId.value
      });

      return savedProject;
    } catch (error) {
      this.logger.error('Failed to create project', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId: dto.projectId,
        tenantId: dto.tenantId
      });
      throw error;
    }
  }

  async update(id: string, dto: UpdateProjectDTO): Promise<Project> {
    try {
      this.logger.info('Updating project', { projectId: id });

      const project = await this.projectRepository.findById(id);
      if (!project) {
        throw new Error(`Project with ID ${id} not found`);
      }

      let updatedProject = project;

      if (dto.name || dto.description) {
        updatedProject = updatedProject.updateDetails(
          dto.name || updatedProject.name,
          dto.description || updatedProject.description
        );
      }

      if (dto.clientId) {
        updatedProject = new Project(
          updatedProject.id,
          updatedProject.projectId,
          updatedProject.tenantId,
          updatedProject.name,
          updatedProject.description,
          dto.clientId,
          updatedProject.managerId,
          updatedProject.status,
          updatedProject.budget,
          updatedProject.timeline,
          updatedProject.team,
          updatedProject.settings,
          updatedProject.createdAt,
          new Date(),
          updatedProject.isActive
        );
      }

      if (dto.managerId) {
        updatedProject = new Project(
          updatedProject.id,
          updatedProject.projectId,
          updatedProject.tenantId,
          updatedProject.name,
          updatedProject.description,
          updatedProject.clientId,
          new UserIdVO(dto.managerId),
          updatedProject.status,
          updatedProject.budget,
          updatedProject.timeline,
          updatedProject.team,
          updatedProject.settings,
          updatedProject.createdAt,
          new Date(),
          updatedProject.isActive
        );
      }

      if (dto.budget) {
        updatedProject = updatedProject.updateBudget(dto.budget);
      }

      if (dto.timeline) {
        updatedProject = updatedProject.updateTimeline(dto.timeline);
      }

      const savedProject = await this.projectRepository.update(updatedProject);
      
      this.logger.info('Project updated successfully', { 
        projectId: savedProject.projectId.value
      });

      return savedProject;
    } catch (error) {
      this.logger.error('Failed to update project', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId: id
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.info('Deleting project', { projectId: id });

      const project = await this.projectRepository.findById(id);
      if (!project) {
        throw new Error(`Project with ID ${id} not found`);
      }

      await this.projectRepository.delete(id);
      
      this.logger.info('Project deleted successfully', { projectId: id });
    } catch (error) {
      this.logger.error('Failed to delete project', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId: id
      });
      throw error;
    }
  }

  async findById(id: string): Promise<Project | null> {
    try {
      return await this.projectRepository.findById(id);
    } catch (error) {
      this.logger.error('Failed to find project by ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId: id
      });
      throw error;
    }
  }

  async findAll(): Promise<Project[]> {
    try {
      return await this.projectRepository.findAll();
    } catch (error) {
      this.logger.error('Failed to find all projects', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async findByProjectId(projectId: string): Promise<Project | null> {
    try {
      const projectIdVO = new ProjectIdVO(projectId);
      return await this.projectRepository.findByProjectId(projectIdVO);
    } catch (error) {
      this.logger.error('Failed to find project by project ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId
      });
      throw error;
    }
  }

  async findByTenantId(tenantId: TenantIdVO): Promise<Project[]> {
    try {
      return await this.projectRepository.findByTenantId(tenantId);
    } catch (error) {
      this.logger.error('Failed to find projects by tenant ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: tenantId.value
      });
      throw error;
    }
  }

  async findByManagerId(managerId: string): Promise<Project[]> {
    try {
      return await this.projectRepository.findByManagerId(managerId);
    } catch (error) {
      this.logger.error('Failed to find projects by manager ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        managerId
      });
      throw error;
    }
  }

  async changeStatus(projectId: string, status: string): Promise<Project> {
    try {
      this.logger.info('Changing project status', { projectId, status });

      const projectIdVO = new ProjectIdVO(projectId);
      const project = await this.projectRepository.findByProjectId(projectIdVO);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      const newStatus = status as ProjectStatus;
      const updatedProject = project.changeStatus(newStatus);
      const savedProject = await this.projectRepository.update(updatedProject);

      this.logger.info('Project status changed successfully', { 
        projectId: savedProject.projectId.value,
        status: savedProject.status
      });

      return savedProject;
    } catch (error) {
      this.logger.error('Failed to change project status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId,
        status
      });
      throw error;
    }
  }

  async updateBudget(projectId: string, budget: ProjectBudget): Promise<Project> {
    try {
      this.logger.info('Updating project budget', { projectId });

      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      const updatedProject = project.updateBudget(budget);
      const savedProject = await this.projectRepository.update(updatedProject);

      this.logger.info('Project budget updated successfully', { 
        projectId: savedProject.projectId.value
      });

      return savedProject;
    } catch (error) {
      this.logger.error('Failed to update project budget', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId
      });
      throw error;
    }
  }

  async updateTimeline(projectId: string, timeline: ProjectTimeline): Promise<Project> {
    try {
      this.logger.info('Updating project timeline', { projectId });

      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      const updatedProject = project.updateTimeline(timeline);
      const savedProject = await this.projectRepository.update(updatedProject);

      this.logger.info('Project timeline updated successfully', { 
        projectId: savedProject.projectId.value
      });

      return savedProject;
    } catch (error) {
      this.logger.error('Failed to update project timeline', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId
      });
      throw error;
    }
  }

  async addTeamMember(projectId: string, userId: string, role: string): Promise<Project> {
    try {
      this.logger.info('Adding team member to project', { projectId, userId, role });

      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      const teamMember: ProjectTeamMember = {
        userId: new UserIdVO(userId),
        role,
        joinedAt: new Date(),
        permissions: []
      };

      const updatedProject = project.addTeamMember(teamMember);
      const savedProject = await this.projectRepository.update(updatedProject);

      this.logger.info('Team member added successfully', { 
        projectId: savedProject.projectId.value,
        userId,
        role
      });

      return savedProject;
    } catch (error) {
      this.logger.error('Failed to add team member', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId,
        userId,
        role
      });
      throw error;
    }
  }

  async removeTeamMember(projectId: string, userId: string): Promise<Project> {
    try {
      this.logger.info('Removing team member from project', { projectId, userId });

      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      const updatedProject = project.removeTeamMember(new UserIdVO(userId));
      const savedProject = await this.projectRepository.update(updatedProject);

      this.logger.info('Team member removed successfully', { 
        projectId: savedProject.projectId.value,
        userId
      });

      return savedProject;
    } catch (error) {
      this.logger.error('Failed to remove team member', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId,
        userId
      });
      throw error;
    }
  }

  async getProjectProgress(projectId: string): Promise<ProjectProgress> {
    try {
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      return {
        percentage: project.progress,
        completedTasks: 0,
        totalTasks: 0,
        completedMilestones: project.timeline.milestones.filter(m => m.completed).length,
        totalMilestones: project.timeline.milestones.length
      };
    } catch (error) {
      this.logger.error('Failed to get project progress', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId
      });
      throw error;
    }
  }

  async getProjectStats(projectId: string): Promise<ProjectStats> {
    try {
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      return {
        totalBudget: project.totalBudget,
        spentBudget: project.spentBudget,
        remainingBudget: project.remainingBudget,
        totalHours: 0,
        completedHours: 0,
        teamSize: project.team.members.length,
        tasksCount: 0
      };
    } catch (error) {
      this.logger.error('Failed to get project stats', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId
      });
      throw error;
    }
  }
}
