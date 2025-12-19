import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IProjectRepository } from '@/core/interfaces/repositories';
import { Project, ProjectIdVO } from '@/core/entities/project';
import { ProjectStatus } from '@/core/base';
import { TenantIdVO, UserIdVO } from '@/core/entities/tenant';

@injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(
    @inject(TYPES.PrismaClient) private readonly prisma: PrismaClient
  ) {}

  async findById(id: string): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        manager: true,
        members: {
          include: {
            user: true
          }
        }
      }
    });

    if (!project) return null;

    return this.mapToDomain(project);
  }

  async findByProjectId(projectId: ProjectIdVO): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({
      where: { projectId: projectId.value },
      include: {
        client: true,
        manager: true,
        members: {
          include: {
            user: true
          }
        }
      }
    });

    if (!project) return null;

    return this.mapToDomain(project);
  }

  async findByTenantId(tenantId: TenantIdVO): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { tenantId: tenantId.value },
      include: {
        client: true,
        manager: true,
        members: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return projects.map(project => this.mapToDomain(project));
  }

  async findByManagerId(managerId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { managerId: managerId },
      include: {
        client: true,
        manager: true,
        members: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return projects.map(project => this.mapToDomain(project));
  }

  async findByClientId(clientId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { clientId },
      include: {
        client: true,
        manager: true,
        members: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return projects.map(project => this.mapToDomain(project));
  }

  async findByStatus(status: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { status: status as any },
      include: {
        client: true,
        manager: true,
        members: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return projects.map(project => this.mapToDomain(project));
  }

  async findActiveProjects(): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { isActive: true },
      include: {
        client: true,
        manager: true,
        members: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return projects.map(project => this.mapToDomain(project));
  }

  async findByTeamMember(userId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        OR: [
          { managerId: userId },
          {
            members: {
              some: {
                userId: userId
              }
            }
          }
        ]
      },
      include: {
        client: true,
        manager: true,
        members: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return projects.map(project => this.mapToDomain(project));
  }

  async findOverdueProjects(): Promise<Project[]> {
    const now = new Date();
    const projects = await this.prisma.project.findMany({
      where: {
        AND: [
          { isActive: true },
          { status: { not: 'completed' } },
          {
            timeline: {
              path: ['endDate'],
              lt: now.toISOString()
            }
          }
        ]
      },
      include: {
        client: true,
        manager: true,
        members: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return projects.map(project => this.mapToDomain(project));
  }

  async findAll(): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      include: {
        client: true,
        manager: true,
        members: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return projects.map(project => this.mapToDomain(project));
  }

  async save(entity: Project): Promise<Project> {
    const project = await this.prisma.project.create({
      data: {
        id: entity.id,
        projectId: entity.projectId.value,
        tenantId: entity.tenantId.value,
        name: entity.name,
        description: entity.description,
        clientId: entity.clientId,
        managerId: entity.managerId.value,
        status: entity.status as any,
        budget: entity.budget as any,
        timeline: entity.timeline as any,
        team: entity.team as any,
        settings: entity.settings as any,
        isActive: entity.isActive,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt
      }
    });

    return this.mapToDomain(project);
  }

  async update(entity: Project): Promise<Project> {
    const normalizedTimeline = entity.timeline ? {
      ...entity.timeline,
      milestones: (entity.timeline.milestones || []).map((m: any) => {
        let dueDate: Date;
        if (m.dueDate instanceof Date && !isNaN(m.dueDate.getTime())) {
          dueDate = m.dueDate;
        } else if (m.dueDate) {
          dueDate = new Date(m.dueDate);
          if (isNaN(dueDate.getTime())) {
            dueDate = new Date();
          }
        } else if (m.date) {
          dueDate = new Date(m.date);
          if (isNaN(dueDate.getTime())) {
            dueDate = new Date();
          }
        } else {
          dueDate = new Date();
        }

        let completedAt: Date | undefined;
        if (m.completedAt) {
          if (m.completedAt instanceof Date && !isNaN(m.completedAt.getTime())) {
            completedAt = m.completedAt;
          } else {
            completedAt = new Date(m.completedAt);
            if (isNaN(completedAt.getTime())) {
              completedAt = undefined;
            }
          }
        }

        return {
          ...m,
          dueDate,
          completedAt
        };
      })
    } : entity.timeline;

    const project = await this.prisma.project.update({
      where: { id: entity.id },
      data: {
        name: entity.name,
        description: entity.description,
        clientId: entity.clientId,
        managerId: entity.managerId.value,
        status: entity.status as any,
        budget: entity.budget as any,
        timeline: normalizedTimeline as any,
        team: entity.team as any,
        settings: entity.settings as any,
        isActive: entity.isActive,
        updatedAt: entity.updatedAt
      }
    });

    return this.mapToDomain(project);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({
      where: { id }
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.project.count({
      where: { id }
    });

    return count > 0;
  }

  private mapToDomain(project: any): Project {
    if (!project) {
      throw new Error('Project data is null or undefined');
    }

    if (!project.projectId) {
      throw new Error(`Project projectId is missing for project ${project.id}`);
    }

    if (!project.tenantId) {
      throw new Error(`Project tenantId is missing for project ${project.id}`);
    }

    if (!project.managerId) {
      throw new Error(`Project managerId is missing for project ${project.id}`);
    }

    const timeline = project.timeline ? {
      startDate: project.timeline.startDate instanceof Date 
        ? project.timeline.startDate 
        : new Date(project.timeline.startDate),
      endDate: project.timeline.endDate instanceof Date 
        ? project.timeline.endDate 
        : new Date(project.timeline.endDate),
      milestones: (project.timeline.milestones || []).map((m: any) => {
        let dueDate: Date;
        if (m.dueDate) {
          dueDate = m.dueDate instanceof Date ? m.dueDate : new Date(m.dueDate);
        } else if (m.date) {
          dueDate = new Date(m.date);
        } else {
          dueDate = new Date();
        }
        
        if (isNaN(dueDate.getTime())) {
          dueDate = new Date();
        }

        let completedAt: Date | undefined;
        if (m.completedAt) {
          completedAt = m.completedAt instanceof Date ? m.completedAt : new Date(m.completedAt);
          if (completedAt && isNaN(completedAt.getTime())) {
            completedAt = undefined;
          }
        }

        return {
          ...m,
          dueDate,
          completedAt
        };
      })
    } : { startDate: new Date(), endDate: new Date(), milestones: [] };

    return new Project(
      project.id,
      new ProjectIdVO(project.projectId),
      new TenantIdVO(project.tenantId),
      project.name || '',
      project.description || '',
      project.clientId || '',
      new UserIdVO(project.managerId),
      project.status as ProjectStatus,
      project.budget || {},
      timeline,
      project.team || { members: [], roles: [] },
      project.settings || {},
      project.createdAt ? new Date(project.createdAt) : new Date(),
      project.updatedAt ? new Date(project.updatedAt) : new Date(),
      project.isActive !== undefined ? project.isActive : true
    );
  }
}
