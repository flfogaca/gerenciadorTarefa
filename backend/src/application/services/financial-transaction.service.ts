import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IFinancialTransactionService, CreateFinancialTransactionDTO, UpdateFinancialTransactionDTO } from '@/core/interfaces/services';
import { IFinancialTransactionRepository } from '@/core/interfaces/repositories';
import { FinancialTransaction, TransactionIdVO, TransactionType } from '@/core/entities/financial-transaction';
import { TenantIdVO } from '@/core/entities/tenant';
import { ILogger } from '@/shared/logging/logger';
import { randomBytes } from 'crypto';

@injectable()
export class FinancialTransactionService implements IFinancialTransactionService {
  constructor(
    @inject(TYPES.FinancialTransactionRepository) private readonly transactionRepository: IFinancialTransactionRepository,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  async create(dto: CreateFinancialTransactionDTO): Promise<FinancialTransaction> {
    try {
      this.logger.info('Creating financial transaction', { tenantId: dto.tenantId, type: dto.type });

      const transactionId = `TXN-${randomBytes(4).toString('hex').toUpperCase()}`;
      const transaction = FinancialTransaction.create({
        id: randomBytes(16).toString('hex'),
        transactionId,
        tenantId: dto.tenantId,
        type: dto.type,
        amount: dto.amount,
        currency: dto.currency || 'BRL',
        category: dto.category,
        description: dto.description,
        relatedEntity: dto.relatedEntity || null,
        relatedEntityId: dto.relatedEntityId || null,
        date: dto.date,
        reconciled: false
      });

      const savedTransaction = await this.transactionRepository.save(transaction);
      
      this.logger.info('Financial transaction created successfully', { 
        transactionId: savedTransaction.transactionId.value,
        amount: savedTransaction.amount
      });

      return savedTransaction;
    } catch (error) {
      this.logger.error('Failed to create financial transaction', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: dto.tenantId
      });
      throw error;
    }
  }

  async update(id: string, dto: UpdateFinancialTransactionDTO): Promise<FinancialTransaction> {
    try {
      this.logger.info('Updating financial transaction', { transactionId: id });

      const transaction = await this.transactionRepository.findById(id);
      if (!transaction) {
        throw new Error(`Financial transaction with ID ${id} not found`);
      }

      const updatedTransaction = transaction.update(dto);
      const savedTransaction = await this.transactionRepository.save(updatedTransaction);
      
      this.logger.info('Financial transaction updated successfully', { transactionId: id });
      return savedTransaction;
    } catch (error) {
      this.logger.error('Failed to update financial transaction', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionId: id
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.info('Deleting financial transaction', { transactionId: id });

      const transaction = await this.transactionRepository.findById(id);
      if (!transaction) {
        throw new Error(`Financial transaction with ID ${id} not found`);
      }

      if (transaction.reconciled) {
        throw new Error('Cannot delete reconciled transactions');
      }

      await this.transactionRepository.delete(id);
      
      this.logger.info('Financial transaction deleted successfully', { transactionId: id });
    } catch (error) {
      this.logger.error('Failed to delete financial transaction', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionId: id
      });
      throw error;
    }
  }

  async findById(id: string): Promise<FinancialTransaction | null> {
    return this.transactionRepository.findById(id);
  }

  async findAll(): Promise<FinancialTransaction[]> {
    return this.transactionRepository.findAll();
  }

  async findByTransactionId(transactionId: string): Promise<FinancialTransaction | null> {
    return this.transactionRepository.findByTransactionId(new TransactionIdVO(transactionId));
  }

  async findByTenantId(tenantId: TenantIdVO): Promise<FinancialTransaction[]> {
    return this.transactionRepository.findByTenantId(tenantId);
  }

  async findByType(type: TransactionType, tenantId: TenantIdVO): Promise<FinancialTransaction[]> {
    return this.transactionRepository.findByType(type, tenantId);
  }

  async reconcile(transactionId: string): Promise<FinancialTransaction> {
    try {
      this.logger.info('Reconciling financial transaction', { transactionId });

      const transaction = await this.transactionRepository.findByTransactionId(new TransactionIdVO(transactionId));
      if (!transaction) {
        throw new Error(`Financial transaction with ID ${transactionId} not found`);
      }

      const reconciledTransaction = transaction.reconcile();
      const savedTransaction = await this.transactionRepository.save(reconciledTransaction);
      
      this.logger.info('Financial transaction reconciled successfully', { transactionId });
      return savedTransaction;
    } catch (error) {
      this.logger.error('Failed to reconcile financial transaction', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionId
      });
      throw error;
    }
  }

  async unreconcile(transactionId: string): Promise<FinancialTransaction> {
    try {
      this.logger.info('Unreconciling financial transaction', { transactionId });

      const transaction = await this.transactionRepository.findByTransactionId(new TransactionIdVO(transactionId));
      if (!transaction) {
        throw new Error(`Financial transaction with ID ${transactionId} not found`);
      }

      const unreconciledTransaction = transaction.unreconcile();
      const savedTransaction = await this.transactionRepository.save(unreconciledTransaction);
      
      this.logger.info('Financial transaction unreconciled successfully', { transactionId });
      return savedTransaction;
    } catch (error) {
      this.logger.error('Failed to unreconcile financial transaction', {
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionId
      });
      throw error;
    }
  }

  async findUnreconciled(tenantId: TenantIdVO): Promise<FinancialTransaction[]> {
    return this.transactionRepository.findUnreconciled(tenantId);
  }

  async findByDateRange(startDate: Date, endDate: Date, tenantId: TenantIdVO): Promise<FinancialTransaction[]> {
    return this.transactionRepository.findByDateRange(startDate, endDate, tenantId);
  }
}

