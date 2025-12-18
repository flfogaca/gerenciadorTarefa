import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IExpenseService, CreateExpenseDTO, UpdateExpenseDTO } from '@/core/interfaces/services';
import { IExpenseRepository } from '@/core/interfaces/repositories';
import { Expense, ExpenseIdVO, ExpenseStatus } from '@/core/entities/expense';
import { TenantIdVO } from '@/core/entities/tenant';
import { ILogger } from '@/shared/logging/logger';
import { randomBytes } from 'crypto';

@injectable()
export class ExpenseService implements IExpenseService {
  constructor(
    @inject(TYPES.ExpenseRepository) private readonly expenseRepository: IExpenseRepository,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  async create(dto: CreateExpenseDTO): Promise<Expense> {
    try {
      this.logger.info('Creating expense', { tenantId: dto.tenantId });

      const expenseId = `EXP-${randomBytes(4).toString('hex').toUpperCase()}`;
      const expense = Expense.create({
        id: randomBytes(16).toString('hex'),
        expenseId,
        tenantId: dto.tenantId,
        projectId: dto.projectId || null,
        supplierId: dto.supplierId || null,
        category: dto.category,
        description: dto.description,
        amount: dto.amount,
        currency: dto.currency || 'BRL',
        date: dto.date,
        invoiceNumber: dto.invoiceNumber || null,
        notes: dto.notes || null,
        status: ExpenseStatus.PENDING
      });

      const savedExpense = await this.expenseRepository.save(expense);
      
      this.logger.info('Expense created successfully', { 
        expenseId: savedExpense.expenseId.value,
        amount: savedExpense.amount
      });

      return savedExpense;
    } catch (error) {
      this.logger.error('Failed to create expense', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: dto.tenantId
      });
      throw error;
    }
  }

  async update(id: string, dto: UpdateExpenseDTO): Promise<Expense> {
    try {
      this.logger.info('Updating expense', { expenseId: id });

      const expense = await this.expenseRepository.findById(id);
      if (!expense) {
        throw new Error(`Expense with ID ${id} not found`);
      }

      const updatedExpense = expense.update(dto);
      const savedExpense = await this.expenseRepository.save(updatedExpense);
      
      this.logger.info('Expense updated successfully', { expenseId: id });
      return savedExpense;
    } catch (error) {
      this.logger.error('Failed to update expense', {
        error: error instanceof Error ? error.message : 'Unknown error',
        expenseId: id
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.info('Deleting expense', { expenseId: id });

      const expense = await this.expenseRepository.findById(id);
      if (!expense) {
        throw new Error(`Expense with ID ${id} not found`);
      }

      if (expense.status === ExpenseStatus.PAID) {
        throw new Error('Cannot delete paid expenses');
      }

      await this.expenseRepository.delete(id);
      
      this.logger.info('Expense deleted successfully', { expenseId: id });
    } catch (error) {
      this.logger.error('Failed to delete expense', {
        error: error instanceof Error ? error.message : 'Unknown error',
        expenseId: id
      });
      throw error;
    }
  }

  async findById(id: string): Promise<Expense | null> {
    return this.expenseRepository.findById(id);
  }

  async findAll(): Promise<Expense[]> {
    return this.expenseRepository.findAll();
  }

  async findByExpenseId(expenseId: string): Promise<Expense | null> {
    return this.expenseRepository.findByExpenseId(new ExpenseIdVO(expenseId));
  }

  async findByTenantId(tenantId: TenantIdVO): Promise<Expense[]> {
    return this.expenseRepository.findByTenantId(tenantId);
  }

  async findByProjectId(projectId: string): Promise<Expense[]> {
    return this.expenseRepository.findByProjectId(projectId);
  }

  async approve(expenseId: string, approvedBy: string): Promise<Expense> {
    try {
      this.logger.info('Approving expense', { expenseId, approvedBy });

      const expense = await this.expenseRepository.findByExpenseId(new ExpenseIdVO(expenseId));
      if (!expense) {
        throw new Error(`Expense with ID ${expenseId} not found`);
      }

      const approvedExpense = expense.approve(approvedBy);
      const savedExpense = await this.expenseRepository.save(approvedExpense);
      
      this.logger.info('Expense approved successfully', { expenseId });
      return savedExpense;
    } catch (error) {
      this.logger.error('Failed to approve expense', {
        error: error instanceof Error ? error.message : 'Unknown error',
        expenseId
      });
      throw error;
    }
  }

  async reject(expenseId: string, approvedBy: string): Promise<Expense> {
    try {
      this.logger.info('Rejecting expense', { expenseId, approvedBy });

      const expense = await this.expenseRepository.findByExpenseId(new ExpenseIdVO(expenseId));
      if (!expense) {
        throw new Error(`Expense with ID ${expenseId} not found`);
      }

      const rejectedExpense = expense.reject(approvedBy);
      const savedExpense = await this.expenseRepository.save(rejectedExpense);
      
      this.logger.info('Expense rejected successfully', { expenseId });
      return savedExpense;
    } catch (error) {
      this.logger.error('Failed to reject expense', {
        error: error instanceof Error ? error.message : 'Unknown error',
        expenseId
      });
      throw error;
    }
  }

  async markAsPaid(expenseId: string): Promise<Expense> {
    try {
      this.logger.info('Marking expense as paid', { expenseId });

      const expense = await this.expenseRepository.findByExpenseId(new ExpenseIdVO(expenseId));
      if (!expense) {
        throw new Error(`Expense with ID ${expenseId} not found`);
      }

      const paidExpense = expense.markAsPaid();
      const savedExpense = await this.expenseRepository.save(paidExpense);
      
      this.logger.info('Expense marked as paid successfully', { expenseId });
      return savedExpense;
    } catch (error) {
      this.logger.error('Failed to mark expense as paid', {
        error: error instanceof Error ? error.message : 'Unknown error',
        expenseId
      });
      throw error;
    }
  }

  async findByStatus(status: ExpenseStatus): Promise<Expense[]> {
    return this.expenseRepository.findByStatus(status);
  }

  async findByDateRange(startDate: Date, endDate: Date, tenantId: TenantIdVO): Promise<Expense[]> {
    return this.expenseRepository.findByDateRange(startDate, endDate, tenantId);
  }
}

