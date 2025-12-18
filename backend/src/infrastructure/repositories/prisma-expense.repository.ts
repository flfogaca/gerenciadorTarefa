import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IExpenseRepository } from '@/core/interfaces/repositories';
import { Expense, ExpenseIdVO, ExpenseStatus } from '@/core/entities/expense';
import { TenantIdVO } from '@/core/entities/tenant';

@injectable()
export class PrismaExpenseRepository implements IExpenseRepository {
  constructor(
    @inject(TYPES.PrismaClient) private readonly prisma: PrismaClient
  ) {}

  async findById(id: string): Promise<Expense | null> {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        project: true,
        supplier: true
      }
    });

    if (!expense) return null;

    return this.mapToDomain(expense);
  }

  async findByExpenseId(expenseId: ExpenseIdVO): Promise<Expense | null> {
    const expense = await this.prisma.expense.findUnique({
      where: { expenseId: expenseId.value },
      include: {
        project: true,
        supplier: true
      }
    });

    if (!expense) return null;

    return this.mapToDomain(expense);
  }

  async findByTenantId(tenantId: TenantIdVO): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { tenantId: tenantId.value },
      include: {
        project: true,
        supplier: true
      },
      orderBy: { date: 'desc' }
    });

    return expenses.map(expense => this.mapToDomain(expense));
  }

  async findByProjectId(projectId: string): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { projectId },
      include: {
        project: true,
        supplier: true
      },
      orderBy: { date: 'desc' }
    });

    return expenses.map(expense => this.mapToDomain(expense));
  }

  async findBySupplierId(supplierId: string): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { supplierId },
      include: {
        project: true,
        supplier: true
      },
      orderBy: { date: 'desc' }
    });

    return expenses.map(expense => this.mapToDomain(expense));
  }

  async findByStatus(status: ExpenseStatus): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: { status: status as any },
      include: {
        project: true,
        supplier: true
      },
      orderBy: { date: 'desc' }
    });

    return expenses.map(expense => this.mapToDomain(expense));
  }

  async findByCategory(category: string, tenantId: TenantIdVO): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: {
        category,
        tenantId: tenantId.value
      },
      include: {
        project: true,
        supplier: true
      },
      orderBy: { date: 'desc' }
    });

    return expenses.map(expense => this.mapToDomain(expense));
  }

  async findByDateRange(startDate: Date, endDate: Date, tenantId: TenantIdVO): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      where: {
        tenantId: tenantId.value,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        project: true,
        supplier: true
      },
      orderBy: { date: 'desc' }
    });

    return expenses.map(expense => this.mapToDomain(expense));
  }

  async findMany(options: {
    tenantId: TenantIdVO;
    limit?: number;
    offset?: number;
    filters?: {
      projectId?: string;
      supplierId?: string;
      status?: ExpenseStatus;
      category?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    };
  }): Promise<{ expenses: Expense[]; total: number }> {
    const where: any = {
      tenantId: options.tenantId.value
    };

    if (options.filters) {
      if (options.filters.projectId) {
        where.projectId = options.filters.projectId;
      }
      if (options.filters.supplierId) {
        where.supplierId = options.filters.supplierId;
      }
      if (options.filters.status) {
        where.status = options.filters.status;
      }
      if (options.filters.category) {
        where.category = options.filters.category;
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
          { invoiceNumber: { contains: options.filters.search, mode: 'insensitive' } }
        ];
      }
    }

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        include: {
          project: true,
          supplier: true
        },
        orderBy: { date: 'desc' },
        take: options.limit,
        skip: options.offset
      }),
      this.prisma.expense.count({ where })
    ]);

    return {
      expenses: expenses.map(expense => this.mapToDomain(expense)),
      total
    };
  }

  async findAll(): Promise<Expense[]> {
    const expenses = await this.prisma.expense.findMany({
      include: {
        project: true,
        supplier: true
      },
      orderBy: { date: 'desc' }
    });

    return expenses.map(expense => this.mapToDomain(expense));
  }

  async save(entity: Expense): Promise<Expense> {
    const data = this.mapToPersistence(entity);
    
    const expense = await this.prisma.expense.upsert({
      where: { expenseId: entity.expenseId.value },
      create: data,
      update: data,
      include: {
        project: true,
        supplier: true
      }
    });

    return this.mapToDomain(expense);
  }

  async update(entity: Expense): Promise<Expense> {
    return this.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.expense.delete({
      where: { id }
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.expense.count({
      where: { id }
    });
    return count > 0;
  }

  private mapToDomain(prismaExpense: any): Expense {
    return Expense.create({
      id: prismaExpense.id,
      expenseId: prismaExpense.expenseId,
      tenantId: prismaExpense.tenantId,
      projectId: prismaExpense.projectId,
      supplierId: prismaExpense.supplierId,
      category: prismaExpense.category,
      description: prismaExpense.description,
      amount: prismaExpense.amount,
      currency: prismaExpense.currency,
      date: prismaExpense.date,
      invoiceNumber: prismaExpense.invoiceNumber,
      status: prismaExpense.status as ExpenseStatus,
      approvedBy: prismaExpense.approvedBy,
      approvedAt: prismaExpense.approvedAt,
      notes: prismaExpense.notes,
      attachments: Array.isArray(prismaExpense.attachments) ? prismaExpense.attachments : [],
      metadata: prismaExpense.metadata || {},
      createdAt: prismaExpense.createdAt,
      updatedAt: prismaExpense.updatedAt
    });
  }

  private mapToPersistence(entity: Expense): any {
    return {
      id: entity.id,
      expenseId: entity.expenseId.value,
      tenantId: entity.tenantId,
      projectId: entity.projectId,
      supplierId: entity.supplierId,
      category: entity.category,
      description: entity.description,
      amount: entity.amount,
      currency: entity.currency,
      date: entity.date,
      invoiceNumber: entity.invoiceNumber,
      status: entity.status,
      approvedBy: entity.approvedBy,
      approvedAt: entity.approvedAt,
      notes: entity.notes,
      attachments: entity.attachments,
      metadata: entity.metadata
    };
  }
}

