import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IPaymentRepository } from '@/core/interfaces/repositories';
import { Payment, PaymentIdVO, PaymentStatus } from '@/core/entities/payment';
import { TenantIdVO } from '@/core/entities/tenant';

@injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
  constructor(
    @inject(TYPES.PrismaClient) private readonly prisma: PrismaClient
  ) {}

  async findById(id: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: true,
        expense: true
      }
    });

    if (!payment) return null;

    return this.mapToDomain(payment);
  }

  async findByPaymentId(paymentId: PaymentIdVO): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { paymentId: paymentId.value },
      include: {
        invoice: true,
        expense: true
      }
    });

    if (!payment) return null;

    return this.mapToDomain(payment);
  }

  async findByTenantId(tenantId: TenantIdVO): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: { tenantId: tenantId.value },
      include: {
        invoice: true,
        expense: true
      },
      orderBy: { paymentDate: 'desc' }
    });

    return payments.map(payment => this.mapToDomain(payment));
  }

  async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: { invoiceId },
      include: {
        invoice: true,
        expense: true
      },
      orderBy: { paymentDate: 'desc' }
    });

    return payments.map(payment => this.mapToDomain(payment));
  }

  async findByExpenseId(expenseId: string): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: { expenseId },
      include: {
        invoice: true,
        expense: true
      },
      orderBy: { paymentDate: 'desc' }
    });

    return payments.map(payment => this.mapToDomain(payment));
  }

  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: { status: status as any },
      include: {
        invoice: true,
        expense: true
      },
      orderBy: { paymentDate: 'desc' }
    });

    return payments.map(payment => this.mapToDomain(payment));
  }

  async findByDateRange(startDate: Date, endDate: Date, tenantId: TenantIdVO): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: {
        tenantId: tenantId.value,
        paymentDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        invoice: true,
        expense: true
      },
      orderBy: { paymentDate: 'desc' }
    });

    return payments.map(payment => this.mapToDomain(payment));
  }

  async findMany(options: {
    tenantId: TenantIdVO;
    limit?: number;
    offset?: number;
    filters?: {
      invoiceId?: string;
      expenseId?: string;
      status?: PaymentStatus;
      method?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    };
  }): Promise<{ payments: Payment[]; total: number }> {
    const where: any = {
      tenantId: options.tenantId.value
    };

    if (options.filters) {
      if (options.filters.invoiceId) {
        where.invoiceId = options.filters.invoiceId;
      }
      if (options.filters.expenseId) {
        where.expenseId = options.filters.expenseId;
      }
      if (options.filters.status) {
        where.status = options.filters.status;
      }
      if (options.filters.method) {
        where.method = options.filters.method;
      }
      if (options.filters.startDate || options.filters.endDate) {
        where.paymentDate = {};
        if (options.filters.startDate) {
          where.paymentDate.gte = options.filters.startDate;
        }
        if (options.filters.endDate) {
          where.paymentDate.lte = options.filters.endDate;
        }
      }
      if (options.filters.search) {
        where.OR = [
          { transactionId: { contains: options.filters.search, mode: 'insensitive' } },
          { notes: { contains: options.filters.search, mode: 'insensitive' } }
        ];
      }
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          invoice: true,
          expense: true
        },
        orderBy: { paymentDate: 'desc' },
        take: options.limit,
        skip: options.offset
      }),
      this.prisma.payment.count({ where })
    ]);

    return {
      payments: payments.map(payment => this.mapToDomain(payment)),
      total
    };
  }

  async findAll(): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      include: {
        invoice: true,
        expense: true
      },
      orderBy: { paymentDate: 'desc' }
    });

    return payments.map(payment => this.mapToDomain(payment));
  }

  async save(entity: Payment): Promise<Payment> {
    const data = this.mapToPersistence(entity);
    
    const payment = await this.prisma.payment.upsert({
      where: { paymentId: entity.paymentId.value },
      create: data,
      update: data,
      include: {
        invoice: true,
        expense: true
      }
    });

    return this.mapToDomain(payment);
  }

  async update(entity: Payment): Promise<Payment> {
    return this.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.payment.delete({
      where: { id }
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.payment.count({
      where: { id }
    });
    return count > 0;
  }

  private mapToDomain(prismaPayment: any): Payment {
    return Payment.create({
      id: prismaPayment.id,
      paymentId: prismaPayment.paymentId,
      tenantId: prismaPayment.tenantId,
      invoiceId: prismaPayment.invoiceId,
      expenseId: prismaPayment.expenseId,
      amount: prismaPayment.amount,
      currency: prismaPayment.currency,
      method: prismaPayment.method as any,
      paymentDate: prismaPayment.paymentDate,
      dueDate: prismaPayment.dueDate,
      status: prismaPayment.status as PaymentStatus,
      transactionId: prismaPayment.transactionId,
      notes: prismaPayment.notes,
      metadata: prismaPayment.metadata || {},
      createdAt: prismaPayment.createdAt,
      updatedAt: prismaPayment.updatedAt
    });
  }

  private mapToPersistence(entity: Payment): any {
    return {
      id: entity.id,
      paymentId: entity.paymentId.value,
      tenantId: entity.tenantId,
      invoiceId: entity.invoiceId,
      expenseId: entity.expenseId,
      amount: entity.amount,
      currency: entity.currency,
      method: entity.method,
      paymentDate: entity.paymentDate,
      dueDate: entity.dueDate,
      status: entity.status,
      transactionId: entity.transactionId,
      notes: entity.notes,
      metadata: entity.metadata
    };
  }
}

