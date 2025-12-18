import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IClientRepository } from '@/core/interfaces/repositories';
import { Client } from '@/core/entities/client';
import { TenantIdVO } from '@/core/entities/tenant';

@injectable()
export class PrismaClientRepository implements IClientRepository {
  constructor(
    @inject(TYPES.PrismaClient) private readonly prisma: PrismaClient
  ) {}

  async create(client: Client): Promise<Client> {
    const created = await this.prisma.client.create({
      data: {
        id: client.id,
        tenantId: client.tenantId.value,
        name: client.name,
        cnpj: client.cnpj || null,
        email: client.email || null,
        phone: client.phone || null,
        address: client.address as any || undefined,
        settings: client.settings,
        isActive: client.isActive
      }
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<Client | null> {
    const client = await this.prisma.client.findUnique({
      where: { id }
    });

    return client ? this.mapToEntity(client) : null;
  }

  async findMany(options: {
    tenantId: TenantIdVO;
    limit?: number;
    offset?: number;
    filters?: {
      isActive?: boolean;
      search?: string;
    };
  }): Promise<{ clients: Client[]; total: number }> {
    const where: any = {
      tenantId: options.tenantId.value
    };

    if (options.filters?.isActive !== undefined) {
      where.isActive = options.filters.isActive;
    }

    if (options.filters?.search) {
      where.OR = [
        { name: { contains: options.filters.search, mode: 'insensitive' } },
        { email: { contains: options.filters.search, mode: 'insensitive' } },
        { cnpj: { contains: options.filters.search } }
      ];
    }

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        take: options.limit || 10,
        skip: options.offset || 0,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.client.count({ where })
    ]);

    return {
      clients: clients.map(client => this.mapToEntity(client)),
      total
    };
  }

  async update(client: Client): Promise<Client> {
    const updated = await this.prisma.client.update({
      where: { id: client.id },
      data: {
        name: client.name,
        cnpj: client.cnpj || null,
        email: client.email || null,
        phone: client.phone || null,
        address: client.address as any || undefined,
        settings: client.settings,
        isActive: client.isActive,
        updatedAt: new Date()
      }
    });

    return this.mapToEntity(updated);
  }

  async save(client: Client): Promise<Client> {
    const existing = await this.findById(client.id);
    if (existing) {
      return this.update(client);
    }
    return this.create(client);
  }

  async exists(id: string): Promise<boolean> {
    const client = await this.findById(id);
    return client !== null;
  }

  async findAll(): Promise<Client[]> {
    const clients = await this.prisma.client.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return clients.map(client => this.mapToEntity(client));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.client.delete({
      where: { id }
    });
  }

  async findByTenant(tenantId: TenantIdVO): Promise<Client[]> {
    const clients = await this.prisma.client.findMany({
      where: { tenantId: tenantId.value },
      orderBy: { createdAt: 'desc' }
    });

    return clients.map(client => this.mapToEntity(client));
  }

  async findByEmail(email: string, tenantId: TenantIdVO): Promise<Client | null> {
    const client = await this.prisma.client.findFirst({
      where: {
        email,
        tenantId: tenantId.value
      }
    });

    return client ? this.mapToEntity(client) : null;
  }

  async findByCnpj(cnpj: string, tenantId: TenantIdVO): Promise<Client | null> {
    const client = await this.prisma.client.findFirst({
      where: {
        cnpj,
        tenantId: tenantId.value
      }
    });

    return client ? this.mapToEntity(client) : null;
  }

  private mapToEntity(data: any): Client {
    return new Client({
      id: data.id,
      tenantId: new TenantIdVO(data.tenantId),
      name: data.name,
      cnpj: data.cnpj,
      email: data.email,
      phone: data.phone,
      address: data.address,
      settings: data.settings,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }
}
