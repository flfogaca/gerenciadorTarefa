import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { ISupplierRepository } from '@/core/interfaces/repositories';
import { Supplier } from '@/core/entities/supplier';
import { TenantIdVO } from '@/core/entities/tenant';

@injectable()
export class PrismaSupplierRepository implements ISupplierRepository {
  constructor(
    @inject(TYPES.PrismaClient) private readonly prisma: PrismaClient
  ) {}

  async create(supplier: Supplier): Promise<Supplier> {
    const created = await this.prisma.supplier.create({
      data: {
        id: supplier.id,
        tenantId: supplier.tenantId.value,
        name: supplier.name,
        cnpj: supplier.cnpj || null,
        email: supplier.email || null,
        phone: supplier.phone || null,
        address: supplier.address as any || undefined,
        services: supplier.services,
        settings: supplier.settings,
        isActive: supplier.isActive
      }
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<Supplier | null> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id }
    });

    return supplier ? this.mapToEntity(supplier) : null;
  }

  async findMany(options: {
    tenantId: TenantIdVO;
    limit?: number;
    offset?: number;
    filters?: {
      isActive?: boolean;
      search?: string;
      service?: string;
    };
  }): Promise<{ suppliers: Supplier[]; total: number }> {
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

    if (options.filters?.service) {
      where.services = {
        has: options.filters.service
      };
    }

    const [suppliers, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        take: options.limit || 10,
        skip: options.offset || 0,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.supplier.count({ where })
    ]);

    return {
      suppliers: suppliers.map(supplier => this.mapToEntity(supplier)),
      total
    };
  }

  async update(supplier: Supplier): Promise<Supplier> {
    const updated = await this.prisma.supplier.update({
      where: { id: supplier.id },
      data: {
        name: supplier.name,
        cnpj: supplier.cnpj || null,
        email: supplier.email || null,
        phone: supplier.phone || null,
        address: supplier.address as any || undefined,
        services: supplier.services,
        settings: supplier.settings,
        isActive: supplier.isActive,
        updatedAt: new Date()
      }
    });

    return this.mapToEntity(updated);
  }

  async save(supplier: Supplier): Promise<Supplier> {
    const existing = await this.findById(supplier.id);
    if (existing) {
      return this.update(supplier);
    }
    return this.create(supplier);
  }

  async exists(id: string): Promise<boolean> {
    const supplier = await this.findById(id);
    return supplier !== null;
  }

  async findAll(): Promise<Supplier[]> {
    const suppliers = await this.prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return suppliers.map(supplier => this.mapToEntity(supplier));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.supplier.delete({
      where: { id }
    });
  }

  async findByTenant(tenantId: TenantIdVO): Promise<Supplier[]> {
    const suppliers = await this.prisma.supplier.findMany({
      where: { tenantId: tenantId.value },
      orderBy: { createdAt: 'desc' }
    });

    return suppliers.map(supplier => this.mapToEntity(supplier));
  }

  async findByEmail(email: string, tenantId: TenantIdVO): Promise<Supplier | null> {
    const supplier = await this.prisma.supplier.findFirst({
      where: {
        email,
        tenantId: tenantId.value
      }
    });

    return supplier ? this.mapToEntity(supplier) : null;
  }

  async findByCnpj(cnpj: string, tenantId: TenantIdVO): Promise<Supplier | null> {
    const supplier = await this.prisma.supplier.findFirst({
      where: {
        cnpj,
        tenantId: tenantId.value
      }
    });

    return supplier ? this.mapToEntity(supplier) : null;
  }

  async findByService(service: string, tenantId: TenantIdVO): Promise<Supplier[]> {
    const suppliers = await this.prisma.supplier.findMany({
      where: {
        services: {
          has: service
        },
        tenantId: tenantId.value
      },
      orderBy: { createdAt: 'desc' }
    });

    return suppliers.map(supplier => this.mapToEntity(supplier));
  }

  private mapToEntity(data: any): Supplier {
    return new Supplier({
      id: data.id,
      tenantId: new TenantIdVO(data.tenantId),
      name: data.name,
      cnpj: data.cnpj,
      email: data.email,
      phone: data.phone,
      address: data.address,
      services: data.services,
      settings: data.settings,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }
}
