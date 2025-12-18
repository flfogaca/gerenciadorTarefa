import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IInvoiceRepository } from '@/core/interfaces/repositories';
import { Invoice, InvoiceIdVO, InvoiceStatus } from '@/core/entities/invoice';
import { TenantIdVO } from '@/core/entities/tenant';

@injectable()
export class PrismaInvoiceRepository implements IInvoiceRepository {
  constructor(
    @inject(TYPES.PrismaClient) private readonly prisma: PrismaClient
  ) {}

  async findById(id: string): Promise<Invoice | null> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        project: true,
        client: true,
        supplier: true
      }
    });

    if (!invoice) return null;

    return this.mapToDomain(invoice);
  }

  async findByInvoiceId(invoiceId: InvoiceIdVO): Promise<Invoice | null> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { invoiceId: invoiceId.value },
      include: {
        project: true,
        client: true,
        supplier: true
      }
    });

    if (!invoice) return null;

    return this.mapToDomain(invoice);
  }

  async findByTenantId(tenantId: TenantIdVO): Promise<Invoice[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { tenantId: tenantId.value },
      include: {
        project: true,
        client: true,
        supplier: true
      },
      orderBy: { issueDate: 'desc' }
    });

    return invoices.map(invoice => this.mapToDomain(invoice));
  }

  async findByProjectId(projectId: string): Promise<Invoice[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { projectId },
      include: {
        project: true,
        client: true,
        supplier: true
      },
      orderBy: { issueDate: 'desc' }
    });

    return invoices.map(invoice => this.mapToDomain(invoice));
  }

  async findByClientId(clientId: string): Promise<Invoice[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { clientId },
      include: {
        project: true,
        client: true,
        supplier: true
      },
      orderBy: { issueDate: 'desc' }
    });

    return invoices.map(invoice => this.mapToDomain(invoice));
  }

  async findBySupplierId(supplierId: string): Promise<Invoice[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { supplierId },
      include: {
        project: true,
        client: true,
        supplier: true
      },
      orderBy: { issueDate: 'desc' }
    });

    return invoices.map(invoice => this.mapToDomain(invoice));
  }

  async findByStatus(status: InvoiceStatus): Promise<Invoice[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { status: status as any },
      include: {
        project: true,
        client: true,
        supplier: true
      },
      orderBy: { issueDate: 'desc' }
    });

    return invoices.map(invoice => this.mapToDomain(invoice));
  }

  async findByInvoiceNumber(invoiceNumber: string, tenantId: TenantIdVO): Promise<Invoice | null> {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        invoiceNumber,
        tenantId: tenantId.value
      },
      include: {
        project: true,
        client: true,
        supplier: true
      }
    });

    if (!invoice) return null;

    return this.mapToDomain(invoice);
  }

  async findOverdueInvoices(tenantId: TenantIdVO): Promise<Invoice[]> {
    const now = new Date();
    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId: tenantId.value,
        status: { in: ['sent', 'overdue'] },
        dueDate: { lt: now }
      },
      include: {
        project: true,
        client: true,
        supplier: true
      },
      orderBy: { dueDate: 'asc' }
    });

    return invoices.map(invoice => this.mapToDomain(invoice));
  }

  async findByDateRange(startDate: Date, endDate: Date, tenantId: TenantIdVO): Promise<Invoice[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId: tenantId.value,
        issueDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        project: true,
        client: true,
        supplier: true
      },
      orderBy: { issueDate: 'desc' }
    });

    return invoices.map(invoice => this.mapToDomain(invoice));
  }

  async findMany(options: {
    tenantId: TenantIdVO;
    limit?: number;
    offset?: number;
    filters?: {
      projectId?: string;
      clientId?: string;
      supplierId?: string;
      status?: InvoiceStatus;
      type?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    };
  }): Promise<{ invoices: Invoice[]; total: number }> {
    const where: any = {
      tenantId: options.tenantId.value
    };

    if (options.filters) {
      if (options.filters.projectId) {
        where.projectId = options.filters.projectId;
      }
      if (options.filters.clientId) {
        where.clientId = options.filters.clientId;
      }
      if (options.filters.supplierId) {
        where.supplierId = options.filters.supplierId;
      }
      if (options.filters.status) {
        where.status = options.filters.status;
      }
      if (options.filters.type) {
        where.type = options.filters.type;
      }
      if (options.filters.startDate || options.filters.endDate) {
        where.issueDate = {};
        if (options.filters.startDate) {
          where.issueDate.gte = options.filters.startDate;
        }
        if (options.filters.endDate) {
          where.issueDate.lte = options.filters.endDate;
        }
      }
      if (options.filters.search) {
        where.OR = [
          { invoiceNumber: { contains: options.filters.search, mode: 'insensitive' } }
        ];
      }
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          project: true,
          client: true,
          supplier: true
        },
        orderBy: { issueDate: 'desc' },
        take: options.limit,
        skip: options.offset
      }),
      this.prisma.invoice.count({ where })
    ]);

    return {
      invoices: invoices.map(invoice => this.mapToDomain(invoice)),
      total
    };
  }

  async findAll(): Promise<Invoice[]> {
    const invoices = await this.prisma.invoice.findMany({
      include: {
        project: true,
        client: true,
        supplier: true
      },
      orderBy: { issueDate: 'desc' }
    });

    return invoices.map(invoice => this.mapToDomain(invoice));
  }

  async save(entity: Invoice): Promise<Invoice> {
    const data = this.mapToPersistence(entity);
    
    const invoice = await this.prisma.invoice.upsert({
      where: { invoiceId: entity.invoiceId.value },
      create: data,
      update: data,
      include: {
        project: true,
        client: true,
        supplier: true
      }
    });

    return this.mapToDomain(invoice);
  }

  async update(entity: Invoice): Promise<Invoice> {
    return this.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.invoice.delete({
      where: { id }
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.invoice.count({
      where: { id }
    });
    return count > 0;
  }

  private mapToDomain(prismaInvoice: any): Invoice {
    return Invoice.create({
      id: prismaInvoice.id,
      invoiceId: prismaInvoice.invoiceId,
      tenantId: prismaInvoice.tenantId,
      projectId: prismaInvoice.projectId,
      clientId: prismaInvoice.clientId,
      supplierId: prismaInvoice.supplierId,
      invoiceNumber: prismaInvoice.invoiceNumber,
      type: prismaInvoice.type as any,
      amount: prismaInvoice.amount,
      tax: prismaInvoice.tax,
      total: prismaInvoice.total,
      currency: prismaInvoice.currency,
      issueDate: prismaInvoice.issueDate,
      dueDate: prismaInvoice.dueDate,
      paymentDate: prismaInvoice.paymentDate,
      status: prismaInvoice.status as InvoiceStatus,
      fileUrl: prismaInvoice.fileUrl,
      metadata: prismaInvoice.metadata || {},
      notes: prismaInvoice.notes,
      createdAt: prismaInvoice.createdAt,
      updatedAt: prismaInvoice.updatedAt
    });
  }

  private mapToPersistence(entity: Invoice): any {
    return {
      id: entity.id,
      invoiceId: entity.invoiceId.value,
      tenantId: entity.tenantId,
      projectId: entity.projectId,
      clientId: entity.clientId,
      supplierId: entity.supplierId,
      invoiceNumber: entity.invoiceNumber,
      type: entity.type,
      amount: entity.amount,
      tax: entity.tax,
      total: entity.total,
      currency: entity.currency,
      issueDate: entity.issueDate,
      dueDate: entity.dueDate,
      paymentDate: entity.paymentDate,
      status: entity.status,
      fileUrl: entity.fileUrl,
      metadata: entity.metadata
    };
  }
}

