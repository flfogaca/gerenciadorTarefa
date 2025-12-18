import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { ITemplateService, CreateTemplateDTO, UpdateTemplateDTO } from '@/core/interfaces/services';
import { ITemplateRepository } from '@/core/interfaces/repositories';
import { Template, TemplateIdVO } from '@/core/entities/template';
import { TenantIdVO, UserIdVO } from '@/core/entities/tenant';
import { ILogger } from '@/shared/logging/logger';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class TemplateService implements ITemplateService {
  constructor(
    @inject(TYPES.TemplateRepository) private readonly templateRepository: ITemplateRepository,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  async create(dto: CreateTemplateDTO): Promise<Template> {
    try {
      this.logger.info('Creating template', { templateId: dto.templateId, tenantId: dto.tenantId });

      const templateId = new TemplateIdVO(dto.templateId);
      const tenantId = new TenantIdVO(dto.tenantId);
      const createdBy = new UserIdVO(dto.createdBy);

      const existingTemplate = await this.templateRepository.findByTemplateId(templateId);
      if (existingTemplate) {
        throw new Error(`Template with ID ${dto.templateId} already exists`);
      }

      const template = Template.create(
        templateId,
        tenantId,
        dto.name,
        dto.description,
        dto.category,
        createdBy,
        dto.phases || [],
        dto.tasks || [],
        dto.isPublic || false
      );

      let updatedTemplate = template;

      if (dto.tags && dto.tags.length > 0) {
        for (const tag of dto.tags) {
          updatedTemplate = updatedTemplate.addTag(tag);
        }
      }

      const savedTemplate = await this.templateRepository.save(updatedTemplate);

      this.logger.info('Template created successfully', {
        templateId: savedTemplate.templateId.value,
        name: savedTemplate.name,
        tenantId: savedTemplate.tenantId.value
      });

      return savedTemplate;
    } catch (error) {
      this.logger.error('Failed to create template', {
        error: error instanceof Error ? error.message : 'Unknown error',
        templateId: dto.templateId,
        tenantId: dto.tenantId
      });
      throw error;
    }
  }

  async update(id: string, dto: UpdateTemplateDTO): Promise<Template> {
    try {
      this.logger.info('Updating template', { templateId: id });

      const template = await this.templateRepository.findById(id);
      if (!template) {
        throw new Error(`Template with ID ${id} not found`);
      }

      let updatedTemplate = template;

      if (dto.name || dto.description || dto.category) {
        updatedTemplate = updatedTemplate.updateDetails(
          dto.name || template.name,
          dto.description || template.description,
          dto.category || template.category
        );
      }

      if (dto.phases) {
        updatedTemplate = updatedTemplate.updatePhases(dto.phases);
      }

      if (dto.tasks) {
        updatedTemplate = updatedTemplate.updateTasks(dto.tasks);
      }

      if (dto.tags) {
        const currentTags = new Set(updatedTemplate.tags);
        const newTags = new Set(dto.tags);

        const tagsToAdd = dto.tags.filter(tag => !currentTags.has(tag));
        const tagsToRemove = updatedTemplate.tags.filter(tag => !newTags.has(tag));

        for (const tag of tagsToAdd) {
          updatedTemplate = updatedTemplate.addTag(tag);
        }

        for (const tag of tagsToRemove) {
          updatedTemplate = updatedTemplate.removeTag(tag);
        }
      }

      const savedTemplate = await this.templateRepository.update(updatedTemplate);

      this.logger.info('Template updated successfully', {
        templateId: savedTemplate.templateId.value
      });

      return savedTemplate;
    } catch (error) {
      this.logger.error('Failed to update template', {
        error: error instanceof Error ? error.message : 'Unknown error',
        templateId: id
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.info('Deleting template', { templateId: id });

      const template = await this.templateRepository.findById(id);
      if (!template) {
        throw new Error(`Template with ID ${id} not found`);
      }

      const deactivatedTemplate = template.deactivate();
      await this.templateRepository.update(deactivatedTemplate);

      this.logger.info('Template deleted successfully', { templateId: id });
    } catch (error) {
      this.logger.error('Failed to delete template', {
        error: error instanceof Error ? error.message : 'Unknown error',
        templateId: id
      });
      throw error;
    }
  }

  async findById(id: string): Promise<Template | null> {
    return this.templateRepository.findById(id);
  }

  async findAll(): Promise<Template[]> {
    return this.templateRepository.findAll();
  }

  async findByTemplateId(templateId: string): Promise<Template | null> {
    return this.templateRepository.findByTemplateId(new TemplateIdVO(templateId));
  }

  async findByTenantId(tenantId: string): Promise<Template[]> {
    return this.templateRepository.findByTenantId(new TenantIdVO(tenantId));
  }

  async findByCategory(category: string, tenantId: string): Promise<Template[]> {
    return this.templateRepository.findByCategory(category, new TenantIdVO(tenantId));
  }

  async findPublicTemplates(): Promise<Template[]> {
    return this.templateRepository.findPublicTemplates();
  }

  async useTemplate(templateId: string, projectId: string, tenantId: string): Promise<void> {
    try {
      this.logger.info('Using template', { templateId, projectId });

      const template = await this.templateRepository.findByTemplateId(new TemplateIdVO(templateId));
      if (!template) {
        throw new Error(`Template with ID ${templateId} not found`);
      }

      const updatedTemplate = template.incrementUsage();
      await this.templateRepository.update(updatedTemplate);

      this.logger.info('Template usage incremented', { templateId });
    } catch (error) {
      this.logger.error('Failed to use template', {
        error: error instanceof Error ? error.message : 'Unknown error',
        templateId
      });
      throw error;
    }
  }

  async incrementUsage(templateId: string): Promise<Template> {
    const template = await this.templateRepository.findByTemplateId(new TemplateIdVO(templateId));
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    const updatedTemplate = template.incrementUsage();
    return this.templateRepository.update(updatedTemplate);
  }

  async updateRating(templateId: string, rating: number): Promise<Template> {
    const template = await this.templateRepository.findByTemplateId(new TemplateIdVO(templateId));
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    const updatedTemplate = template.updateRating(rating);
    return this.templateRepository.update(updatedTemplate);
  }
}

