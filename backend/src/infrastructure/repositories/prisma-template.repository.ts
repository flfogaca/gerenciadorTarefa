import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { TYPES } from '@/shared/types';
import { ITemplateRepository } from '@/core/interfaces/repositories';
import { Template, TemplateIdVO } from '@/core/entities/template';
import { TenantIdVO } from '@/core/entities/tenant';
import { UserIdVO } from '@/core/entities/tenant';

@injectable()
export class PrismaTemplateRepository implements ITemplateRepository {
  constructor(
    @inject(TYPES.PrismaClient) private readonly prisma: PrismaClient
  ) {}

  async findById(id: string): Promise<Template | null> {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: { creator: true }
    });

    if (!template) return null;

    return this.mapToDomain(template);
  }

  async findByTemplateId(templateId: TemplateIdVO): Promise<Template | null> {
    const template = await this.prisma.template.findUnique({
      where: { templateId: templateId.value },
      include: { creator: true }
    });

    if (!template) return null;

    return this.mapToDomain(template);
  }

  async findByTenantId(tenantId: TenantIdVO): Promise<Template[]> {
    const templates = await this.prisma.template.findMany({
      where: { tenantId: tenantId.value, isActive: true },
      include: { creator: true },
      orderBy: { createdAt: 'desc' }
    });

    return templates.map(t => this.mapToDomain(t));
  }

  async findByCategory(category: string, tenantId: TenantIdVO): Promise<Template[]> {
    const templates = await this.prisma.template.findMany({
      where: {
        category,
        tenantId: tenantId.value,
        isActive: true
      },
      include: { creator: true },
      orderBy: { createdAt: 'desc' }
    });

    return templates.map(t => this.mapToDomain(t));
  }

  async findPublicTemplates(): Promise<Template[]> {
    const templates = await this.prisma.template.findMany({
      where: {
        isPublic: true,
        isActive: true
      },
      include: { creator: true },
      orderBy: { usageCount: 'desc' }
    });

    return templates.map(t => this.mapToDomain(t));
  }

  async findByCreator(createdBy: string): Promise<Template[]> {
    const templates = await this.prisma.template.findMany({
      where: {
        createdBy,
        isActive: true
      },
      include: { creator: true },
      orderBy: { createdAt: 'desc' }
    });

    return templates.map(t => this.mapToDomain(t));
  }

  async findMany(options: {
    tenantId: TenantIdVO;
    limit?: number;
    offset?: number;
    filters?: {
      category?: string;
      isPublic?: boolean;
      isDefault?: boolean;
      search?: string;
    };
  }): Promise<{ templates: Template[]; total: number }> {
    const { tenantId, limit = 50, offset = 0, filters = {} } = options;

    const where: any = {
      tenantId: tenantId.value,
      isActive: true
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters.isDefault !== undefined) {
      where.isDefault = filters.isDefault;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [templates, total] = await Promise.all([
      this.prisma.template.findMany({
        where,
        include: { creator: true },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.template.count({ where })
    ]);

    return {
      templates: templates.map(t => this.mapToDomain(t)),
      total
    };
  }

  async findAll(): Promise<Template[]> {
    const templates = await this.prisma.template.findMany({
      where: { isActive: true },
      include: { creator: true },
      orderBy: { createdAt: 'desc' }
    });

    return templates.map(t => this.mapToDomain(t));
  }

  async save(template: Template): Promise<Template> {
    const templateData = {
      templateId: template.templateId.value,
      tenantId: template.tenantId.value,
      name: template.name,
      description: template.description,
      category: template.category,
      isDefault: template.isDefault,
      isPublic: template.isPublic,
      createdBy: template.createdBy.value,
      phases: template.phases as any,
      tasks: template.tasks as any,
      settings: template.settings as any,
      metadata: template.metadata as any,
      usageCount: template.usageCount,
      lastUsedAt: template.lastUsedAt,
      rating: template.rating,
      tags: template.tags,
      isActive: template.isActive
    };

    const saved = await this.prisma.template.upsert({
      where: { id: template.id },
      create: {
        ...templateData,
        id: template.id
      },
      update: templateData,
      include: { creator: true }
    });

    return this.mapToDomain(saved);
  }

  async update(template: Template): Promise<Template> {
    return this.save(template);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.template.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.template.count({
      where: { id, isActive: true }
    });
    return count > 0;
  }

  private mapToDomain(prismaTemplate: any): Template {
    return new Template(
      prismaTemplate.id,
      new TemplateIdVO(prismaTemplate.templateId),
      new TenantIdVO(prismaTemplate.tenantId),
      prismaTemplate.name,
      prismaTemplate.description,
      prismaTemplate.category,
      prismaTemplate.isDefault,
      prismaTemplate.isPublic,
      new UserIdVO(prismaTemplate.createdBy),
      (prismaTemplate.phases as any) || [],
      (prismaTemplate.tasks as any) || [],
      (prismaTemplate.settings as any) || {},
      (prismaTemplate.metadata as any) || {},
      prismaTemplate.usageCount,
      prismaTemplate.lastUsedAt,
      prismaTemplate.rating,
      prismaTemplate.tags || [],
      prismaTemplate.isActive,
      prismaTemplate.createdAt,
      prismaTemplate.updatedAt
    );
  }
}

