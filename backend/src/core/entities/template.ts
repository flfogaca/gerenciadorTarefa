import { BaseEntity, TenantId, UserId } from '../base';
import { TenantIdVO } from './tenant';
import { UserIdVO } from './tenant';

export class TemplateIdVO extends TenantIdVO {
  constructor(value: string) {
    super(value);
  }
}

export interface TemplatePhase {
  readonly name: string;
  readonly tasks: TemplateTask[];
  readonly duration: number;
  readonly order: number;
}

export interface TemplateTask {
  readonly title: string;
  readonly description: string;
  readonly priority: string;
  readonly estimatedHours: number;
  readonly assigneeRole?: string;
  readonly dependencies?: string[];
}

export class Template extends BaseEntity {
  constructor(
    public readonly id: string,
    public readonly templateId: TemplateIdVO,
    public readonly tenantId: TenantIdVO,
    public readonly name: string,
    public readonly description: string,
    public readonly category: string,
    public readonly isDefault: boolean,
    public readonly isPublic: boolean,
    public readonly createdBy: UserIdVO,
    public readonly phases: TemplatePhase[],
    public readonly tasks: TemplateTask[],
    public readonly settings: Record<string, any>,
    public readonly metadata: Record<string, any>,
    public readonly usageCount: number,
    public readonly lastUsedAt: Date | null,
    public readonly rating: number,
    public readonly tags: string[],
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    super();
  }

  static create(
    templateId: TemplateIdVO,
    tenantId: TenantIdVO,
    name: string,
    description: string,
    category: string,
    createdBy: UserIdVO,
    phases: TemplatePhase[] = [],
    tasks: TemplateTask[] = [],
    isPublic: boolean = false
  ): Template {
    const now = new Date();
    const id = `template_${templateId.value}_${now.getTime()}`;

    return new Template(
      id,
      templateId,
      tenantId,
      name,
      description,
      category,
      false,
      isPublic,
      createdBy,
      phases,
      tasks,
      {},
      {},
      0,
      null,
      0,
      [],
      true,
      now,
      now
    );
  }

  updateDetails(name: string, description: string, category: string): Template {
    return new Template(
      this.id,
      this.templateId,
      this.tenantId,
      name,
      description,
      category,
      this.isDefault,
      this.isPublic,
      this.createdBy,
      this.phases,
      this.tasks,
      this.settings,
      this.metadata,
      this.usageCount,
      this.lastUsedAt,
      this.rating,
      this.tags,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  updatePhases(phases: TemplatePhase[]): Template {
    return new Template(
      this.id,
      this.templateId,
      this.tenantId,
      this.name,
      this.description,
      this.category,
      this.isDefault,
      this.isPublic,
      this.createdBy,
      phases,
      this.tasks,
      this.settings,
      this.metadata,
      this.usageCount,
      this.lastUsedAt,
      this.rating,
      this.tags,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  updateTasks(tasks: TemplateTask[]): Template {
    return new Template(
      this.id,
      this.templateId,
      this.tenantId,
      this.name,
      this.description,
      this.category,
      this.isDefault,
      this.isPublic,
      this.createdBy,
      this.phases,
      tasks,
      this.settings,
      this.metadata,
      this.usageCount,
      this.lastUsedAt,
      this.rating,
      this.tags,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  incrementUsage(): Template {
    return new Template(
      this.id,
      this.templateId,
      this.tenantId,
      this.name,
      this.description,
      this.category,
      this.isDefault,
      this.isPublic,
      this.createdBy,
      this.phases,
      this.tasks,
      this.settings,
      this.metadata,
      this.usageCount + 1,
      new Date(),
      this.rating,
      this.tags,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  updateRating(rating: number): Template {
    return new Template(
      this.id,
      this.templateId,
      this.tenantId,
      this.name,
      this.description,
      this.category,
      this.isDefault,
      this.isPublic,
      this.createdBy,
      this.phases,
      this.tasks,
      this.settings,
      this.metadata,
      this.usageCount,
      this.lastUsedAt,
      rating,
      this.tags,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  addTag(tag: string): Template {
    if (this.tags.includes(tag)) {
      return this;
    }
    return new Template(
      this.id,
      this.templateId,
      this.tenantId,
      this.name,
      this.description,
      this.category,
      this.isDefault,
      this.isPublic,
      this.createdBy,
      this.phases,
      this.tasks,
      this.settings,
      this.metadata,
      this.usageCount,
      this.lastUsedAt,
      this.rating,
      [...this.tags, tag],
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  removeTag(tag: string): Template {
    return new Template(
      this.id,
      this.templateId,
      this.tenantId,
      this.name,
      this.description,
      this.category,
      this.isDefault,
      this.isPublic,
      this.createdBy,
      this.phases,
      this.tasks,
      this.settings,
      this.metadata,
      this.usageCount,
      this.lastUsedAt,
      this.rating,
      this.tags.filter(t => t !== tag),
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  deactivate(): Template {
    return new Template(
      this.id,
      this.templateId,
      this.tenantId,
      this.name,
      this.description,
      this.category,
      this.isDefault,
      this.isPublic,
      this.createdBy,
      this.phases,
      this.tasks,
      this.settings,
      this.metadata,
      this.usageCount,
      this.lastUsedAt,
      this.rating,
      this.tags,
      false,
      this.createdAt,
      new Date()
    );
  }
}

