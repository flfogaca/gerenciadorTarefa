import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IFinancialTransactionRepository } from '@/core/interfaces/repositories';
import { FinancialTransaction, TransactionIdVO, TransactionType } from '@/core/entities/financial-transaction';
import { TenantIdVO } from '@/core/entities/tenant';

@injectable()
export class PrismaFinancialTransactionRepository implements IFinancialTransactionRepository {
  constructor(
    @inject(TYPES.PrismaClient) private readonly prisma: PrismaClient
  ) {}

  async findById(id: string): Promise<FinancialTransaction | null> {
    const transaction = await this.prisma.financialTransaction.findUnique({
      where: { id }
    });

    if (!transaction) return null;

    return this.mapToDomain(transaction);
  }

  async findByTransactionId(transactionId: TransactionIdVO): Promise<FinancialTransaction | null> {
    const transaction = await this.prisma.financialTransaction.findUnique({
      where: { transactionId: transactionId.value }
    });

    if (!transaction) return null;

    return this.mapToDomain(transaction);
  }

  async findByTenantId(tenantId: TenantIdVO): Promise<FinancialTransaction[]> {
    const transactions = await this.prisma.financialTransaction.findMany({
      where: { tenantId: tenantId.value },
      orderBy: { date: 'desc' }
    });

    return transactions.map(transaction => this.mapToDomain(transaction));
  }

  async findByType(type: TransactionType, tenantId: TenantIdVO): Promise<FinancialTransaction[]> {
    const transactions = await this.prisma.financialTransaction.findMany({
      where: {
        type: type as any,
        tenantId: tenantId.value
      },
      orderBy: { date: 'desc' }
    });

    return transactions.map(transaction => this.mapToDomain(transaction));
  }

  async findByCategory(category: string, tenantId: TenantIdVO): Promise<FinancialTransaction[]> {
    const transactions = await this.prisma.financialTransaction.findMany({
      where: {
        category,
        tenantId: tenantId.value
      },
      orderBy: { date: 'desc' }
    });

    return transactions.map(transaction => this.mapToDomain(transaction));
  }

  async findByDateRange(startDate: Date, endDate: Date, tenantId: TenantIdVO): Promise<FinancialTransaction[]> {
    const transactions = await this.prisma.financialTransaction.findMany({
      where: {
        tenantId: tenantId.value,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'desc' }
    });

    return transactions.map(transaction => this.mapToDomain(transaction));
  }

  async findUnreconciled(tenantId: TenantIdVO): Promise<FinancialTransaction[]> {
    const transactions = await this.prisma.financialTransaction.findMany({
      where: {
        tenantId: tenantId.value,
        reconciled: false
      },
      orderBy: { date: 'desc' }
    });

    return transactions.map(transaction => this.mapToDomain(transaction));
  }

  async findReconciled(tenantId: TenantIdVO): Promise<FinancialTransaction[]> {
    const transactions = await this.prisma.financialTransaction.findMany({
      where: {
        tenantId: tenantId.value,
        reconciled: true
      },
      orderBy: { date: 'desc' }
    });

    return transactions.map(transaction => this.mapToDomain(transaction));
  }

  async findMany(options: {
    tenantId: TenantIdVO;
    limit?: number;
    offset?: number;
    filters?: {
      type?: TransactionType;
      category?: string;
      reconciled?: boolean;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    };
  }): Promise<{ transactions: FinancialTransaction[]; total: number }> {
    const where: any = {
      tenantId: options.tenantId.value
    };

    if (options.filters) {
      if (options.filters.type) {
        where.type = options.filters.type;
      }
      if (options.filters.category) {
        where.category = options.filters.category;
      }
      if (options.filters.reconciled !== undefined) {
        where.reconciled = options.filters.reconciled;
      }
      if (options.filters.startDate || options.filters.endDate) {
        where.date = {};
        if (options.filters.startDate) {
          where.date.gte = options.filters.startDate;
        }
        if (options.filters.endDate) {
          where.date.lte = options.filters.endDate;
        }
      }
      if (options.filters.search) {
        where.OR = [
          { description: { contains: options.filters.search, mode: 'insensitive' } },
          { category: { contains: options.filters.search, mode: 'insensitive' } }
        ];
      }
    }

    const [transactions, total] = await Promise.all([
      this.prisma.financialTransaction.findMany({
        where,
        orderBy: { date: 'desc' },
        take: options.limit,
        skip: options.offset
      }),
      this.prisma.financialTransaction.count({ where })
    ]);

    return {
      transactions: transactions.map(transaction => this.mapToDomain(transaction)),
      total
    };
  }

  async findAll(): Promise<FinancialTransaction[]> {
    const transactions = await this.prisma.financialTransaction.findMany({
      orderBy: { date: 'desc' }
    });

    return transactions.map(transaction => this.mapToDomain(transaction));
  }

  async save(entity: FinancialTransaction): Promise<FinancialTransaction> {
    const data = this.mapToPersistence(entity);
    
    const transaction = await this.prisma.financialTransaction.upsert({
      where: { transactionId: entity.transactionId.value },
      create: data,
      update: data
    });

    return this.mapToDomain(transaction);
  }

  async update(entity: FinancialTransaction): Promise<FinancialTransaction> {
    return this.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.financialTransaction.delete({
      where: { id }
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.financialTransaction.count({
      where: { id }
    });
    return count > 0;
  }

  private mapToDomain(prismaTransaction: any): FinancialTransaction {
    return FinancialTransaction.create({
      id: prismaTransaction.id,
      transactionId: prismaTransaction.transactionId,
      tenantId: prismaTransaction.tenantId,
      type: prismaTransaction.type as TransactionType,
      amount: prismaTransaction.amount,
      currency: prismaTransaction.currency,
      category: prismaTransaction.category,
      description: prismaTransaction.description,
      relatedEntity: prismaTransaction.relatedEntity,
      relatedEntityId: prismaTransaction.relatedEntityId,
      date: prismaTransaction.date,
      reconciled: prismaTransaction.reconciled,
      reconciledAt: prismaTransaction.reconciledAt,
      metadata: prismaTransaction.metadata || {},
      createdAt: prismaTransaction.createdAt,
      updatedAt: prismaTransaction.updatedAt
    });
  }

  private mapToPersistence(entity: FinancialTransaction): any {
    return {
      id: entity.id,
      transactionId: entity.transactionId.value,
      tenantId: entity.tenantId,
      type: entity.type,
      amount: entity.amount,
      currency: entity.currency,
      category: entity.category,
      description: entity.description,
      relatedEntity: entity.relatedEntity,
      relatedEntityId: entity.relatedEntityId,
      date: entity.date,
      reconciled: entity.reconciled,
      reconciledAt: entity.reconciledAt,
      metadata: entity.metadata
    };
  }
}

