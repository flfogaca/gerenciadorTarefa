import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IUserSettingsService, CreateUserSettingsDTO, UpdateUserSettingsDTO } from '@/core/interfaces/services';
import { IUserSettingsRepository } from '@/core/interfaces/repositories';
import { UserSettings } from '@/core/entities/user-settings';
import { TenantIdVO, UserIdVO } from '@/core/entities/tenant';
import { ILogger } from '@/shared/logging/logger';

@injectable()
export class UserSettingsService implements IUserSettingsService {
  constructor(
    @inject(TYPES.UserSettingsRepository) private readonly userSettingsRepository: IUserSettingsRepository,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  async create(dto: CreateUserSettingsDTO): Promise<UserSettings> {
    try {
      this.logger.info('Creating user settings', { userId: dto.userId, tenantId: dto.tenantId });

      const userId = new UserIdVO(dto.userId);
      const tenantId = new TenantIdVO(dto.tenantId);

      const existingSettings = await this.userSettingsRepository.findByUserId(dto.userId);
      if (existingSettings) {
        throw new Error(`Settings for user ${dto.userId} already exist`);
      }

      const settings = UserSettings.create(
        userId,
        tenantId,
        dto.settings || {},
        dto.preferences || {},
        dto.notifications || {},
        dto.theme || 'light',
        dto.language || 'pt-BR',
        dto.timezone || 'America/Sao_Paulo'
      );

      const savedSettings = await this.userSettingsRepository.save(settings);

      this.logger.info('User settings created successfully', {
        userId: savedSettings.userId.value,
        tenantId: savedSettings.tenantId.value
      });

      return savedSettings;
    } catch (error) {
      this.logger.error('Failed to create user settings', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: dto.userId,
        tenantId: dto.tenantId
      });
      throw error;
    }
  }

  async update(id: string, dto: UpdateUserSettingsDTO): Promise<UserSettings> {
    try {
      this.logger.info('Updating user settings', { settingsId: id });

      const settings = await this.userSettingsRepository.findById(id);
      if (!settings) {
        throw new Error(`User settings with ID ${id} not found`);
      }

      let updatedSettings = settings;

      if (dto.settings) {
        updatedSettings = updatedSettings.updateSettings(dto.settings);
      }

      if (dto.preferences) {
        updatedSettings = updatedSettings.updatePreferences(dto.preferences);
      }

      if (dto.notifications) {
        updatedSettings = updatedSettings.updateNotifications(dto.notifications);
      }

      if (dto.theme) {
        updatedSettings = updatedSettings.updateTheme(dto.theme);
      }

      if (dto.language) {
        updatedSettings = updatedSettings.updateLanguage(dto.language);
      }

      if (dto.timezone) {
        updatedSettings = updatedSettings.updateTimezone(dto.timezone);
      }

      const savedSettings = await this.userSettingsRepository.update(updatedSettings);

      this.logger.info('User settings updated successfully', {
        userId: savedSettings.userId.value
      });

      return savedSettings;
    } catch (error) {
      this.logger.error('Failed to update user settings', {
        error: error instanceof Error ? error.message : 'Unknown error',
        settingsId: id
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.info('Deleting user settings', { settingsId: id });

      const settings = await this.userSettingsRepository.findById(id);
      if (!settings) {
        throw new Error(`User settings with ID ${id} not found`);
      }

      await this.userSettingsRepository.delete(id);

      this.logger.info('User settings deleted successfully', { settingsId: id });
    } catch (error) {
      this.logger.error('Failed to delete user settings', {
        error: error instanceof Error ? error.message : 'Unknown error',
        settingsId: id
      });
      throw error;
    }
  }

  async findById(id: string): Promise<UserSettings | null> {
    return this.userSettingsRepository.findById(id);
  }

  async findAll(): Promise<UserSettings[]> {
    return this.userSettingsRepository.findAll();
  }

  async findByUserId(userId: string): Promise<UserSettings | null> {
    return this.userSettingsRepository.findByUserId(userId);
  }

  async getOrCreate(userId: string, tenantId: string): Promise<UserSettings> {
    const existingSettings = await this.userSettingsRepository.findByUserId(userId);
    if (existingSettings) {
      return existingSettings;
    }

    return this.create({
      userId,
      tenantId
    });
  }
}

