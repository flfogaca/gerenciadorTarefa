import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { ITenantRepository } from '@/core/interfaces/repositories';
import { Tenant, TenantIdVO } from '@/core/entities/tenant';

@injectable()
export class PrismaTenantRepository implements ITenantRepository {
  constructor(
    @inject(TYPES.PrismaClient) private readonly prisma: PrismaClient
  ) {}

  async findById(id: string): Promise<Tenant | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id }
    });

    if (!tenant) return null;

    return this.mapToDomain(tenant);
  }

  async findByTenantId(tenantId: TenantIdVO): Promise<Tenant | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { tenantId: tenantId.value }
    });

    if (!tenant) return null;

    return this.mapToDomain(tenant);
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { domain }
    });

    if (!tenant) return null;

    return this.mapToDomain(tenant);
  }

  async findAll(): Promise<Tenant[]> {
    const tenants = await this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return tenants.map(tenant => this.mapToDomain(tenant));
  }

  async findActiveTenants(): Promise<Tenant[]> {
    const tenants = await this.prisma.tenant.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return tenants.map(tenant => this.mapToDomain(tenant));
  }

  async findByUserId(userId: string): Promise<Tenant[]> {
    const tenants = await this.prisma.tenant.findMany({
      where: {
        users: {
          some: {
            userId
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return tenants.map(tenant => this.mapToDomain(tenant));
  }

  async save(entity: Tenant): Promise<Tenant> {
    const tenant = await this.prisma.tenant.create({
      data: {
        id: entity.id,
        tenantId: entity.tenantId.value,
        name: entity.name,
        domain: entity.domain,
        settings: entity.settings as any,
        isActive: entity.isActive,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt
      }
    });

    return this.mapToDomain(tenant);
  }

  async update(entity: Tenant): Promise<Tenant> {
    const tenant = await this.prisma.tenant.update({
      where: { id: entity.id },
      data: {
        name: entity.name,
        domain: entity.domain,
        settings: entity.settings as any,
        isActive: entity.isActive,
        updatedAt: entity.updatedAt
      }
    });

    return this.mapToDomain(tenant);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tenant.delete({
      where: { id }
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.tenant.count({
      where: { id }
    });

    return count > 0;
  }

  private mapToDomain(tenant: any): Tenant {
    return new Tenant(
      tenant.id,
      new TenantIdVO(tenant.tenantId),
      tenant.name,
      tenant.domain,
      tenant.settings,
      tenant.createdAt,
      tenant.updatedAt,
      tenant.isActive
    );
  }
}
