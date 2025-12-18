import { BaseEntity, TenantId, UserId, ProjectId, ProjectStatus } from '../base';
import { TenantIdVO } from './tenant';

export class ProjectIdVO extends TenantIdVO {
  constructor(value: string) {
    super(value);
  }
}

export class Project extends BaseEntity {
  constructor(
    public readonly id: string,
    public readonly projectId: ProjectId,
    public readonly tenantId: TenantId,
    public readonly name: string,
    public readonly description: string,
    public readonly clientId: string,
    public readonly managerId: UserId,
    public readonly status: ProjectStatus,
    public readonly budget: ProjectBudget,
    public readonly timeline: ProjectTimeline,
    public readonly team: ProjectTeam,
    public readonly settings: ProjectSettings,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly isActive: boolean = true
  ) {
    super();
  }

  static create(
    projectId: ProjectId,
    tenantId: TenantId,
    name: string,
    description: string,
    clientId: string,
    managerId: UserId,
    budget: ProjectBudget,
    timeline: ProjectTimeline
  ): Project {
    const now = new Date();
    const id = `project_${projectId.value}_${now.getTime()}`;
    
    return new Project(
      id,
      projectId,
      tenantId,
      name,
      description,
      clientId,
      managerId,
      ProjectStatus.PLANNING,
      budget,
      timeline,
      { members: [], roles: [] },
      ProjectSettings.default(),
      now,
      now
    );
  }

  updateDetails(name: string, description: string): Project {
    return new Project(
      this.id,
      this.projectId,
      this.tenantId,
      name,
      description,
      this.clientId,
      this.managerId,
      this.status,
      this.budget,
      this.timeline,
      this.team,
      this.settings,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  changeStatus(newStatus: ProjectStatus): Project {
    return new Project(
      this.id,
      this.projectId,
      this.tenantId,
      this.name,
      this.description,
      this.clientId,
      this.managerId,
      newStatus,
      this.budget,
      this.timeline,
      this.team,
      this.settings,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  updateBudget(newBudget: ProjectBudget): Project {
    return new Project(
      this.id,
      this.projectId,
      this.tenantId,
      this.name,
      this.description,
      this.clientId,
      this.managerId,
      this.status,
      newBudget,
      this.timeline,
      this.team,
      this.settings,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  addTeamMember(member: ProjectTeamMember): Project {
    const existingMember = this.team.members.find(m => m.userId.equals(member.userId));
    
    if (existingMember) {
      return this;
    }

    return new Project(
      this.id,
      this.projectId,
      this.tenantId,
      this.name,
      this.description,
      this.clientId,
      this.managerId,
      this.status,
      this.budget,
      this.timeline,
      {
        members: [...this.team.members, member],
        roles: this.team.roles
      },
      this.settings,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  removeTeamMember(userId: UserId): Project {
    const filteredMembers = this.team.members.filter(m => !m.userId.equals(userId));

    return new Project(
      this.id,
      this.projectId,
      this.tenantId,
      this.name,
      this.description,
      this.clientId,
      this.managerId,
      this.status,
      this.budget,
      this.timeline,
      {
        members: filteredMembers,
        roles: this.team.roles
      },
      this.settings,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  updateTimeline(newTimeline: ProjectTimeline): Project {
    return new Project(
      this.id,
      this.projectId,
      this.tenantId,
      this.name,
      this.description,
      this.clientId,
      this.managerId,
      this.status,
      this.budget,
      newTimeline,
      this.team,
      this.settings,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  deactivate(): Project {
    return new Project(
      this.id,
      this.projectId,
      this.tenantId,
      this.name,
      this.description,
      this.clientId,
      this.managerId,
      this.status,
      this.budget,
      this.timeline,
      this.team,
      this.settings,
      this.createdAt,
      new Date(),
      false
    );
  }

  get progress(): number {
    if (this.status === ProjectStatus.COMPLETED) return 100;
    if (this.status === ProjectStatus.CANCELLED) return 0;
    
    const now = new Date();
    const startDate = this.timeline.startDate;
    const endDate = this.timeline.endDate;
    
    if (now < startDate) return 0;
    if (now > endDate) return 100;
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    
    return Math.round((elapsed / totalDuration) * 100);
  }

  get isOverdue(): boolean {
    return new Date() > this.timeline.endDate && this.status !== ProjectStatus.COMPLETED;
  }

  get totalBudget(): number {
    return this.budget.planned;
  }

  get spentBudget(): number {
    return this.budget.spent;
  }

  get remainingBudget(): number {
    return this.budget.planned - this.budget.spent;
  }
}

export interface ProjectBudget {
  readonly planned: number;
  readonly spent: number;
  readonly currency: string;
  readonly categories: BudgetCategory[];
}

export interface BudgetCategory {
  readonly name: string;
  readonly planned: number;
  readonly spent: number;
  readonly description?: string;
}

export interface ProjectTimeline {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly milestones: ProjectMilestone[];
}

export interface ProjectMilestone {
  readonly id: string;
  readonly name: string;
  readonly dueDate: Date;
  readonly completed: boolean;
  readonly completedAt?: Date;
  readonly description?: string;
}

export interface ProjectTeam {
  readonly members: ProjectTeamMember[];
  readonly roles: ProjectRole[];
}

export interface ProjectTeamMember {
  readonly userId: UserId;
  readonly role: string;
  readonly joinedAt: Date;
  readonly permissions: string[];
}

export interface ProjectRole {
  readonly name: string;
  readonly permissions: string[];
  readonly description?: string;
}

export interface ProjectSettings {
  readonly allowClientAccess: boolean;
  readonly requireApproval: boolean;
  readonly notifications: ProjectNotificationSettings;
  readonly customFields: Record<string, any>;
}

export interface ProjectNotificationSettings {
  readonly onStatusChange: boolean;
  readonly onBudgetExceeded: boolean;
  readonly onDeadlineApproaching: boolean;
  readonly recipients: string[];
}

export class ProjectSettings {
  static default(): ProjectSettings {
    return {
      allowClientAccess: false,
      requireApproval: true,
      notifications: {
        onStatusChange: true,
        onBudgetExceeded: true,
        onDeadlineApproaching: true,
        recipients: []
      },
      customFields: {}
    };
  }
}
