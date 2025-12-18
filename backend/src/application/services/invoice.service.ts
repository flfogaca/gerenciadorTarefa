import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IInvoiceService, CreateInvoiceDTO, UpdateInvoiceDTO } from '@/core/interfaces/services';
import { IInvoiceRepository } from '@/core/interfaces/repositories';
import { Invoice, InvoiceIdVO, InvoiceStatus, InvoiceType } from '@/core/entities/invoice';
import { TenantIdVO } from '@/core/entities/tenant';
import { ILogger } from '@/shared/logging/logger';
import { randomBytes } from 'crypto';

@injectable()
export class InvoiceService implements IInvoiceService {
  constructor(
    @inject(TYPES.InvoiceRepository) private readonly invoiceRepository: IInvoiceRepository,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  async create(dto: CreateInvoiceDTO): Promise<Invoice> {
    try {
      this.logger.info('Creating invoice', { tenantId: dto.tenantId });

      const invoiceId = `INV-${randomBytes(4).toString('hex').toUpperCase()}`;
      const invoice = Invoice.create({
        id: randomBytes(16).toString('hex'),
        invoiceId,
        tenantId: dto.tenantId,
        projectId: dto.projectId || null,
        clientId: dto.clientId || null,
        supplierId: dto.supplierId || null,
        invoiceNumber: dto.invoiceNumber,
        type: dto.type,
        amount: dto.amount,
        tax: dto.tax || 0,
        total: dto.total,
        currency: dto.currency || 'BRL',
        issueDate: dto.issueDate,
        dueDate: dto.dueDate || null,
        paymentDate: null,
        status: InvoiceStatus.DRAFT,
        fileUrl: dto.fileUrl || null,
        notes: dto.notes || null
      });

      const savedInvoice = await this.invoiceRepository.save(invoice);
      
      this.logger.info('Invoice created successfully', { 
        invoiceId: savedInvoice.invoiceId.value,
        amount: savedInvoice.amount
      });

      return savedInvoice;
    } catch (error) {
      this.logger.error('Failed to create invoice', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: dto.tenantId
      });
      throw error;
    }
  }

  async update(id: string, dto: UpdateInvoiceDTO): Promise<Invoice> {
    try {
      this.logger.info('Updating invoice', { invoiceId: id });

      const invoice = await this.invoiceRepository.findById(id);
      if (!invoice) {
        throw new Error(`Invoice with ID ${id} not found`);
      }

      const updatedInvoice = invoice.update(dto);
      const savedInvoice = await this.invoiceRepository.save(updatedInvoice);
      
      this.logger.info('Invoice updated successfully', { invoiceId: id });
      return savedInvoice;
    } catch (error) {
      this.logger.error('Failed to update invoice', {
        error: error instanceof Error ? error.message : 'Unknown error',
        invoiceId: id
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.info('Deleting invoice', { invoiceId: id });

      const invoice = await this.invoiceRepository.findById(id);
      if (!invoice) {
        throw new Error(`Invoice with ID ${id} not found`);
      }

      if (invoice.status === InvoiceStatus.PAID) {
        throw new Error('Cannot delete paid invoices');
      }

      await this.invoiceRepository.delete(id);
      
      this.logger.info('Invoice deleted successfully', { invoiceId: id });
    } catch (error) {
      this.logger.error('Failed to delete invoice', {
        error: error instanceof Error ? error.message : 'Unknown error',
        invoiceId: id
      });
      throw error;
    }
  }

  async findById(id: string): Promise<Invoice | null> {
    return this.invoiceRepository.findById(id);
  }

  async findAll(): Promise<Invoice[]> {
    return this.invoiceRepository.findAll();
  }

  async findByInvoiceId(invoiceId: string): Promise<Invoice | null> {
    return this.invoiceRepository.findByInvoiceId(new InvoiceIdVO(invoiceId));
  }

  async findByTenantId(tenantId: TenantIdVO): Promise<Invoice[]> {
    return this.invoiceRepository.findByTenantId(tenantId);
  }

  async findByProjectId(projectId: string): Promise<Invoice[]> {
    return this.invoiceRepository.findByProjectId(projectId);
  }

  async send(invoiceId: string): Promise<Invoice> {
    try {
      this.logger.info('Sending invoice', { invoiceId });

      const invoice = await this.invoiceRepository.findByInvoiceId(new InvoiceIdVO(invoiceId));
      if (!invoice) {
        throw new Error(`Invoice with ID ${invoiceId} not found`);
      }

      const sentInvoice = invoice.send();
      const savedInvoice = await this.invoiceRepository.save(sentInvoice);
      
      this.logger.info('Invoice sent successfully', { invoiceId });
      return savedInvoice;
    } catch (error) {
      this.logger.error('Failed to send invoice', {
        error: error instanceof Error ? error.message : 'Unknown error',
        invoiceId
      });
      throw error;
    }
  }

  async markAsPaid(invoiceId: string, paymentDate: Date): Promise<Invoice> {
    try {
      this.logger.info('Marking invoice as paid', { invoiceId });

      const invoice = await this.invoiceRepository.findByInvoiceId(new InvoiceIdVO(invoiceId));
      if (!invoice) {
        throw new Error(`Invoice with ID ${invoiceId} not found`);
      }

      const paidInvoice = invoice.markAsPaid(paymentDate);
      const savedInvoice = await this.invoiceRepository.save(paidInvoice);
      
      this.logger.info('Invoice marked as paid successfully', { invoiceId });
      return savedInvoice;
    } catch (error) {
      this.logger.error('Failed to mark invoice as paid', {
        error: error instanceof Error ? error.message : 'Unknown error',
        invoiceId
      });
      throw error;
    }
  }

  async markAsOverdue(invoiceId: string): Promise<Invoice> {
    try {
      this.logger.info('Marking invoice as overdue', { invoiceId });

      const invoice = await this.invoiceRepository.findByInvoiceId(new InvoiceIdVO(invoiceId));
      if (!invoice) {
        throw new Error(`Invoice with ID ${invoiceId} not found`);
      }

      const overdueInvoice = invoice.markAsOverdue();
      const savedInvoice = await this.invoiceRepository.save(overdueInvoice);
      
      this.logger.info('Invoice marked as overdue successfully', { invoiceId });
      return savedInvoice;
    } catch (error) {
      this.logger.error('Failed to mark invoice as overdue', {
        error: error instanceof Error ? error.message : 'Unknown error',
        invoiceId
      });
      throw error;
    }
  }

  async cancel(invoiceId: string): Promise<Invoice> {
    try {
      this.logger.info('Cancelling invoice', { invoiceId });

      const invoice = await this.invoiceRepository.findByInvoiceId(new InvoiceIdVO(invoiceId));
      if (!invoice) {
        throw new Error(`Invoice with ID ${invoiceId} not found`);
      }

      const cancelledInvoice = invoice.cancel();
      const savedInvoice = await this.invoiceRepository.save(cancelledInvoice);
      
      this.logger.info('Invoice cancelled successfully', { invoiceId });
      return savedInvoice;
    } catch (error) {
      this.logger.error('Failed to cancel invoice', {
        error: error instanceof Error ? error.message : 'Unknown error',
        invoiceId
      });
      throw error;
    }
  }

  async findByStatus(status: InvoiceStatus): Promise<Invoice[]> {
    return this.invoiceRepository.findByStatus(status);
  }

  async findOverdueInvoices(tenantId: TenantIdVO): Promise<Invoice[]> {
    return this.invoiceRepository.findOverdueInvoices(tenantId);
  }
}

