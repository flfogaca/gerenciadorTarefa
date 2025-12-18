import { BaseEntity } from '../base';
import { TenantIdVO, UserIdVO } from './tenant';

export class UserSettings extends BaseEntity {
  constructor(
    public readonly id: string,
    public readonly userId: UserIdVO,
    public readonly tenantId: TenantIdVO,
    public readonly settings: Record<string, any>,
    public readonly preferences: Record<string, any>,
    public readonly notifications: Record<string, any>,
    public readonly theme: string,
    public readonly language: string,
    public readonly timezone: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    super();
  }

  static create(
    userId: UserIdVO,
    tenantId: TenantIdVO,
    settings: Record<string, any> = {},
    preferences: Record<string, any> = {},
    notifications: Record<string, any> = {},
    theme: string = 'light',
    language: string = 'pt-BR',
    timezone: string = 'America/Sao_Paulo'
  ): UserSettings {
    const now = new Date();
    const id = `user_settings_${userId.value}_${now.getTime()}`;

    return new UserSettings(
      id,
      userId,
      tenantId,
      settings,
      preferences,
      notifications,
      theme,
      language,
      timezone,
      now,
      now
    );
  }

  updateSettings(settings: Record<string, any>): UserSettings {
    return new UserSettings(
      this.id,
      this.userId,
      this.tenantId,
      { ...this.settings, ...settings },
      this.preferences,
      this.notifications,
      this.theme,
      this.language,
      this.timezone,
      this.createdAt,
      new Date()
    );
  }

  updatePreferences(preferences: Record<string, any>): UserSettings {
    return new UserSettings(
      this.id,
      this.userId,
      this.tenantId,
      this.settings,
      { ...this.preferences, ...preferences },
      this.notifications,
      this.theme,
      this.language,
      this.timezone,
      this.createdAt,
      new Date()
    );
  }

  updateNotifications(notifications: Record<string, any>): UserSettings {
    return new UserSettings(
      this.id,
      this.userId,
      this.tenantId,
      this.settings,
      this.preferences,
      { ...this.notifications, ...notifications },
      this.theme,
      this.language,
      this.timezone,
      this.createdAt,
      new Date()
    );
  }

  updateTheme(theme: string): UserSettings {
    return new UserSettings(
      this.id,
      this.userId,
      this.tenantId,
      this.settings,
      this.preferences,
      this.notifications,
      theme,
      this.language,
      this.timezone,
      this.createdAt,
      new Date()
    );
  }

  updateLanguage(language: string): UserSettings {
    return new UserSettings(
      this.id,
      this.userId,
      this.tenantId,
      this.settings,
      this.preferences,
      this.notifications,
      this.theme,
      language,
      this.timezone,
      this.createdAt,
      new Date()
    );
  }

  updateTimezone(timezone: string): UserSettings {
    return new UserSettings(
      this.id,
      this.userId,
      this.tenantId,
      this.settings,
      this.preferences,
      this.notifications,
      this.theme,
      this.language,
      timezone,
      this.createdAt,
      new Date()
    );
  }
}

