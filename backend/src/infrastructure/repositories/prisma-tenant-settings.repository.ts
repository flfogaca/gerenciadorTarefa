import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { TYPES } from '@/shared/types';
import { ITenantSettingsRepository } from '@/core/interfaces/repositories';
import { TenantSettings } from '@/core/entities/tenant-settings';
import { TenantIdVO } from '@/core/entities/tenant';

@injectable()
export class PrismaTenantSettingsRepository implements ITenantSettingsRepository {
  constructor(
    @inject(TYPES.PrismaClient) private readonly prisma: PrismaClient
  ) {}

  async findById(id: string): Promise<TenantSettings | null> {
    const settings = await this.prisma.tenantSettings.findUnique({
      where: { id }
    });

    if (!settings) return null;

    return this.mapToDomain(settings);
  }

  async findByTenantId(tenantId: TenantIdVO): Promise<TenantSettings | null> {
    const settings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId: tenantId.value }
    });

    if (!settings) return null;

    return this.mapToDomain(settings);
  }

  async findAll(): Promise<TenantSettings[]> {
    const settings = await this.prisma.tenantSettings.findMany({
      orderBy: { updatedAt: 'desc' }
    });

    return settings.map(s => this.mapToDomain(s));
  }

  async save(settings: TenantSettings): Promise<TenantSettings> {
    const settingsData = {
      tenantId: settings.tenantId.value,
      settings: settings.settings as any,
      features: settings.features as any,
      integrations: settings.integrations as any,
      branding: settings.branding as any,
      limits: settings.limits as any
    };

    const saved = await this.prisma.tenantSettings.upsert({
      where: { tenantId: settings.tenantId.value },
      create: {
        ...settingsData,
        id: settings.id
      },
      update: settingsData
    });

    return this.mapToDomain(saved);
  }

  async update(settings: TenantSettings): Promise<TenantSettings> {
    return this.save(settings);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tenantSettings.delete({
      where: { id }
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.tenantSettings.count({
      where: { id }
    });
    return count > 0;
  }

  private mapToDomain(prismaSettings: any): TenantSettings {
    return new TenantSettings(
      prismaSettings.id,
      new TenantIdVO(prismaSettings.tenantId),
      (prismaSettings.settings as any) || {},
      (prismaSettings.features as any) || {},
      (prismaSettings.integrations as any) || {},
      (prismaSettings.branding as any) || {},
      (prismaSettings.limits as any) || {},
      prismaSettings.createdAt,
      prismaSettings.updatedAt
    );
  }
}

