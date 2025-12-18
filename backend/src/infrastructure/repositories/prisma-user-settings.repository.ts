import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { TYPES } from '@/shared/types';
import { IUserSettingsRepository } from '@/core/interfaces/repositories';
import { UserSettings } from '@/core/entities/user-settings';
import { TenantIdVO, UserIdVO } from '@/core/entities/tenant';

@injectable()
export class PrismaUserSettingsRepository implements IUserSettingsRepository {
  constructor(
    @inject(TYPES.PrismaClient) private readonly prisma: PrismaClient
  ) {}

  async findById(id: string): Promise<UserSettings | null> {
    const settings = await this.prisma.userSettings.findUnique({
      where: { id }
    });

    if (!settings) return null;

    return this.mapToDomain(settings);
  }

  async findByUserId(userId: string): Promise<UserSettings | null> {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId }
    });

    if (!settings) return null;

    return this.mapToDomain(settings);
  }

  async findByTenantId(tenantId: TenantIdVO): Promise<UserSettings[]> {
    const settings = await this.prisma.userSettings.findMany({
      where: { tenantId: tenantId.value },
      orderBy: { updatedAt: 'desc' }
    });

    return settings.map(s => this.mapToDomain(s));
  }

  async findAll(): Promise<UserSettings[]> {
    const settings = await this.prisma.userSettings.findMany({
      orderBy: { updatedAt: 'desc' }
    });

    return settings.map(s => this.mapToDomain(s));
  }

  async save(settings: UserSettings): Promise<UserSettings> {
    const settingsData = {
      userId: settings.userId.value,
      tenantId: settings.tenantId.value,
      settings: settings.settings as any,
      preferences: settings.preferences as any,
      notifications: settings.notifications as any,
      theme: settings.theme,
      language: settings.language,
      timezone: settings.timezone
    };

    const saved = await this.prisma.userSettings.upsert({
      where: { userId: settings.userId.value },
      create: {
        ...settingsData,
        id: settings.id
      },
      update: settingsData
    });

    return this.mapToDomain(saved);
  }

  async update(settings: UserSettings): Promise<UserSettings> {
    return this.save(settings);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.userSettings.delete({
      where: { id }
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.userSettings.count({
      where: { id }
    });
    return count > 0;
  }

  private mapToDomain(prismaSettings: any): UserSettings {
    return new UserSettings(
      prismaSettings.id,
      new UserIdVO(prismaSettings.userId),
      new TenantIdVO(prismaSettings.tenantId),
      (prismaSettings.settings as any) || {},
      (prismaSettings.preferences as any) || {},
      (prismaSettings.notifications as any) || {},
      prismaSettings.theme,
      prismaSettings.language,
      prismaSettings.timezone,
      prismaSettings.createdAt,
      prismaSettings.updatedAt
    );
  }
}

