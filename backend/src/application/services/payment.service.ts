import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IPaymentService, CreatePaymentDTO, UpdatePaymentDTO } from '@/core/interfaces/services';
import { IPaymentRepository } from '@/core/interfaces/repositories';
import { Payment, PaymentIdVO, PaymentStatus } from '@/core/entities/payment';
import { TenantIdVO } from '@/core/entities/tenant';
import { ILogger } from '@/shared/logging/logger';
import { randomBytes } from 'crypto';

@injectable()
export class PaymentService implements IPaymentService {
  constructor(
    @inject(TYPES.PaymentRepository) private readonly paymentRepository: IPaymentRepository,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  async create(dto: CreatePaymentDTO): Promise<Payment> {
    try {
      this.logger.info('Creating payment', { tenantId: dto.tenantId });

      const paymentId = `PAY-${randomBytes(4).toString('hex').toUpperCase()}`;
      const payment = Payment.create({
        id: randomBytes(16).toString('hex'),
        paymentId,
        tenantId: dto.tenantId,
        invoiceId: dto.invoiceId || null,
        expenseId: dto.expenseId || null,
        amount: dto.amount,
        currency: dto.currency || 'BRL',
        method: dto.method,
        paymentDate: dto.paymentDate,
        dueDate: dto.dueDate || null,
        status: PaymentStatus.PENDING,
        transactionId: dto.transactionId || null,
        notes: dto.notes || null
      });

      const savedPayment = await this.paymentRepository.save(payment);
      
      this.logger.info('Payment created successfully', { 
        paymentId: savedPayment.paymentId.value,
        amount: savedPayment.amount
      });

      return savedPayment;
    } catch (error) {
      this.logger.error('Failed to create payment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: dto.tenantId
      });
      throw error;
    }
  }

  async update(id: string, dto: UpdatePaymentDTO): Promise<Payment> {
    try {
      this.logger.info('Updating payment', { paymentId: id });

      const payment = await this.paymentRepository.findById(id);
      if (!payment) {
        throw new Error(`Payment with ID ${id} not found`);
      }

      const updatedPayment = payment.update(dto);
      const savedPayment = await this.paymentRepository.save(updatedPayment);
      
      this.logger.info('Payment updated successfully', { paymentId: id });
      return savedPayment;
    } catch (error) {
      this.logger.error('Failed to update payment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentId: id
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.info('Deleting payment', { paymentId: id });

      const payment = await this.paymentRepository.findById(id);
      if (!payment) {
        throw new Error(`Payment with ID ${id} not found`);
      }

      if (payment.status === PaymentStatus.COMPLETED) {
        throw new Error('Cannot delete completed payments');
      }

      await this.paymentRepository.delete(id);
      
      this.logger.info('Payment deleted successfully', { paymentId: id });
    } catch (error) {
      this.logger.error('Failed to delete payment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentId: id
      });
      throw error;
    }
  }

  async findById(id: string): Promise<Payment | null> {
    return this.paymentRepository.findById(id);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentRepository.findAll();
  }

  async findByPaymentId(paymentId: string): Promise<Payment | null> {
    return this.paymentRepository.findByPaymentId(new PaymentIdVO(paymentId));
  }

  async findByTenantId(tenantId: TenantIdVO): Promise<Payment[]> {
    return this.paymentRepository.findByTenantId(tenantId);
  }

  async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
    return this.paymentRepository.findByInvoiceId(invoiceId);
  }

  async findByExpenseId(expenseId: string): Promise<Payment[]> {
    return this.paymentRepository.findByExpenseId(expenseId);
  }

  async process(paymentId: string, transactionId: string): Promise<Payment> {
    try {
      this.logger.info('Processing payment', { paymentId, transactionId });

      const payment = await this.paymentRepository.findByPaymentId(new PaymentIdVO(paymentId));
      if (!payment) {
        throw new Error(`Payment with ID ${paymentId} not found`);
      }

      const processedPayment = payment.process(transactionId);
      const savedPayment = await this.paymentRepository.save(processedPayment);
      
      this.logger.info('Payment processed successfully', { paymentId });
      return savedPayment;
    } catch (error) {
      this.logger.error('Failed to process payment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentId
      });
      throw error;
    }
  }

  async complete(paymentId: string): Promise<Payment> {
    try {
      this.logger.info('Completing payment', { paymentId });

      const payment = await this.paymentRepository.findByPaymentId(new PaymentIdVO(paymentId));
      if (!payment) {
        throw new Error(`Payment with ID ${paymentId} not found`);
      }

      const completedPayment = payment.complete();
      const savedPayment = await this.paymentRepository.save(completedPayment);
      
      this.logger.info('Payment completed successfully', { paymentId });
      return savedPayment;
    } catch (error) {
      this.logger.error('Failed to complete payment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentId
      });
      throw error;
    }
  }

  async fail(paymentId: string): Promise<Payment> {
    try {
      this.logger.info('Failing payment', { paymentId });

      const payment = await this.paymentRepository.findByPaymentId(new PaymentIdVO(paymentId));
      if (!payment) {
        throw new Error(`Payment with ID ${paymentId} not found`);
      }

      const failedPayment = payment.fail();
      const savedPayment = await this.paymentRepository.save(failedPayment);
      
      this.logger.info('Payment failed successfully', { paymentId });
      return savedPayment;
    } catch (error) {
      this.logger.error('Failed to fail payment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentId
      });
      throw error;
    }
  }

  async refund(paymentId: string): Promise<Payment> {
    try {
      this.logger.info('Refunding payment', { paymentId });

      const payment = await this.paymentRepository.findByPaymentId(new PaymentIdVO(paymentId));
      if (!payment) {
        throw new Error(`Payment with ID ${paymentId} not found`);
      }

      const refundedPayment = payment.refund();
      const savedPayment = await this.paymentRepository.save(refundedPayment);
      
      this.logger.info('Payment refunded successfully', { paymentId });
      return savedPayment;
    } catch (error) {
      this.logger.error('Failed to refund payment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentId
      });
      throw error;
    }
  }

  async cancel(paymentId: string): Promise<Payment> {
    try {
      this.logger.info('Cancelling payment', { paymentId });

      const payment = await this.paymentRepository.findByPaymentId(new PaymentIdVO(paymentId));
      if (!payment) {
        throw new Error(`Payment with ID ${paymentId} not found`);
      }

      const cancelledPayment = payment.cancel();
      const savedPayment = await this.paymentRepository.save(cancelledPayment);
      
      this.logger.info('Payment cancelled successfully', { paymentId });
      return savedPayment;
    } catch (error) {
      this.logger.error('Failed to cancel payment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentId
      });
      throw error;
    }
  }

  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    return this.paymentRepository.findByStatus(status);
  }
}

