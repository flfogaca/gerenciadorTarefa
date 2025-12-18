import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { ITenantSettingsService, CreateTenantSettingsDTO, UpdateTenantSettingsDTO } from '@/core/interfaces/services';
import { ITenantSettingsRepository } from '@/core/interfaces/repositories';
import { TenantSettings } from '@/core/entities/tenant-settings';
import { TenantIdVO } from '@/core/entities/tenant';
import { ILogger } from '@/shared/logging/logger';

@injectable()
export class TenantSettingsService implements ITenantSettingsService {
  constructor(
    @inject(TYPES.TenantSettingsRepository) private readonly tenantSettingsRepository: ITenantSettingsRepository,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  async create(dto: CreateTenantSettingsDTO): Promise<TenantSettings> {
    try {
      this.logger.info('Creating tenant settings', { tenantId: dto.tenantId });

      const tenantId = new TenantIdVO(dto.tenantId);

      const existingSettings = await this.tenantSettingsRepository.findByTenantId(tenantId);
      if (existingSettings) {
        throw new Error(`Settings for tenant ${dto.tenantId} already exist`);
      }

      const settings = TenantSettings.create(
        tenantId,
        dto.settings || {},
        dto.features || {},
        dto.integrations || {},
        dto.branding || {},
        dto.limits || {}
      );

      const savedSettings = await this.tenantSettingsRepository.save(settings);

      this.logger.info('Tenant settings created successfully', {
        tenantId: savedSettings.tenantId.value
      });

      return savedSettings;
    } catch (error) {
      this.logger.error('Failed to create tenant settings', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: dto.tenantId
      });
      throw error;
    }
  }

  async update(id: string, dto: UpdateTenantSettingsDTO): Promise<TenantSettings> {
    try {
      this.logger.info('Updating tenant settings', { settingsId: id });

      const settings = await this.tenantSettingsRepository.findById(id);
      if (!settings) {
        throw new Error(`Tenant settings with ID ${id} not found`);
      }

      let updatedSettings = settings;

      if (dto.settings) {
        updatedSettings = updatedSettings.updateSettings(dto.settings);
      }

      if (dto.features) {
        updatedSettings = updatedSettings.updateFeatures(dto.features);
      }

      if (dto.integrations) {
        updatedSettings = updatedSettings.updateIntegrations(dto.integrations);
      }

      if (dto.branding) {
        updatedSettings = updatedSettings.updateBranding(dto.branding);
      }

      if (dto.limits) {
        updatedSettings = updatedSettings.updateLimits(dto.limits);
      }

      const savedSettings = await this.tenantSettingsRepository.update(updatedSettings);

      this.logger.info('Tenant settings updated successfully', {
        tenantId: savedSettings.tenantId.value
      });

      return savedSettings;
    } catch (error) {
      this.logger.error('Failed to update tenant settings', {
        error: error instanceof Error ? error.message : 'Unknown error',
        settingsId: id
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.info('Deleting tenant settings', { settingsId: id });

      const settings = await this.tenantSettingsRepository.findById(id);
      if (!settings) {
        throw new Error(`Tenant settings with ID ${id} not found`);
      }

      await this.tenantSettingsRepository.delete(id);

      this.logger.info('Tenant settings deleted successfully', { settingsId: id });
    } catch (error) {
      this.logger.error('Failed to delete tenant settings', {
        error: error instanceof Error ? error.message : 'Unknown error',
        settingsId: id
      });
      throw error;
    }
  }

  async findById(id: string): Promise<TenantSettings | null> {
    return this.tenantSettingsRepository.findById(id);
  }

  async findAll(): Promise<TenantSettings[]> {
    return this.tenantSettingsRepository.findAll();
  }

  async findByTenantId(tenantId: string): Promise<TenantSettings | null> {
    return this.tenantSettingsRepository.findByTenantId(new TenantIdVO(tenantId));
  }

  async getOrCreate(tenantId: string): Promise<TenantSettings> {
    const existingSettings = await this.tenantSettingsRepository.findByTenantId(new TenantIdVO(tenantId));
    if (existingSettings) {
      return existingSettings;
    }

    return this.create({
      tenantId
    });
  }
}

