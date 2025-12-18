import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '@/shared/types';
import { IInvoiceService } from '@/core/interfaces/services';
import { RequirePermission } from '@/core/permissions/permission-system';
import { RequireTenant } from '@/core/multi-tenant/tenant-context';
import { ValidationService } from '@/shared/validation/validation.service';
import { Logger } from '@/shared/logging/logger';
import Joi from 'joi';
import { TenantIdVO } from '@/core/entities/tenant';

@injectable()
export class InvoiceController {
  private readonly createInvoiceSchema = Joi.object({
    projectId: Joi.string().optional().allow(null),
    clientId: Joi.string().optional().allow(null),
    supplierId: Joi.string().optional().allow(null),
    invoiceNumber: Joi.string().required(),
    type: Joi.string().valid('income', 'expense').required(),
    amount: Joi.number().positive().required(),
    tax: Joi.number().min(0).default(0),
    total: Joi.number().positive().optional(),
    currency: Joi.string().length(3).default('BRL'),
    issueDate: Joi.date().required(),
    dueDate: Joi.date().optional().allow(null),
    fileUrl: Joi.string().optional().allow(null),
    notes: Joi.string().optional().allow(null)
  });

  private readonly updateInvoiceSchema = Joi.object({
    invoiceNumber: Joi.string().optional(),
    amount: Joi.number().positive().optional(),
    tax: Joi.number().min(0).optional(),
    total: Joi.number().positive().optional(),
    issueDate: Joi.date().optional(),
    dueDate: Joi.date().optional().allow(null),
    fileUrl: Joi.string().optional().allow(null),
    notes: Joi.string().optional().allow(null)
  });

  constructor(
    @inject(TYPES.InvoiceService) private readonly invoiceService: IInvoiceService,
    @inject(TYPES.ValidationService) private readonly validationService: ValidationService,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  @RequirePermission('invoices', 'read')
  @RequireTenant()
  async getInvoices(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const tenantId = new TenantIdVO(tenantContext.tenantId.value);
      const invoices = await this.invoiceService.findByTenantId(tenantId);

      res.status(200).json({
        success: true,
        data: {
          invoices: invoices.map(inv => this.mapInvoiceToResponse(inv)),
          total: invoices.length
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to get invoices', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get invoices'
      });
    }
  }

  @RequirePermission('invoices', 'read')
  @RequireTenant()
  async getInvoice(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Invoice ID is required'
        });
        return;
      }
      const invoice = await this.invoiceService.findById(id);

      if (!invoice) {
        res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          invoice: this.mapInvoiceToResponse(invoice)
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to get invoice', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get invoice'
      });
    }
  }

  @RequirePermission('invoices', 'create')
  @RequireTenant()
  async createInvoice(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const validationResult = await this.validationService.validate(this.createInvoiceSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const invoice = await this.invoiceService.create({
        ...req.body,
        tenantId: tenantContext.tenantId.value,
        issueDate: new Date(req.body.issueDate),
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null
      });

      res.status(201).json({
        success: true,
        data: {
          invoice: this.mapInvoiceToResponse(invoice)
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to create invoice', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create invoice'
      });
    }
  }

  @RequirePermission('invoices', 'update')
  @RequireTenant()
  async updateInvoice(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Invoice ID is required'
        });
        return;
      }
      const validationResult = await this.validationService.validate(this.updateInvoiceSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const updateData: any = { ...req.body };
      if (updateData.issueDate) {
        updateData.issueDate = new Date(updateData.issueDate);
      }
      if (updateData.dueDate !== undefined) {
        updateData.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
      }

      const invoice = await this.invoiceService.update(id, updateData);

      res.status(200).json({
        success: true,
        data: {
          invoice: this.mapInvoiceToResponse(invoice)
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to update invoice', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update invoice'
      });
    }
  }

  @RequirePermission('invoices', 'delete')
  @RequireTenant()
  async deleteInvoice(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Invoice ID is required'
        });
        return;
      }
      await this.invoiceService.delete(id);

      res.status(200).json({
        success: true,
        message: 'Invoice deleted successfully'
      });
    } catch (error: any) {
      this.logger.error('Failed to delete invoice', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete invoice'
      });
    }
  }

  @RequirePermission('invoices', 'update')
  @RequireTenant()
  async sendInvoice(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Invoice ID is required'
        });
        return;
      }
      const invoice = await this.invoiceService.send(id);

      res.status(200).json({
        success: true,
        data: {
          invoice: this.mapInvoiceToResponse(invoice)
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to send invoice', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to send invoice'
      });
    }
  }

  @RequirePermission('invoices', 'update')
  @RequireTenant()
  async markInvoiceAsPaid(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Invoice ID is required'
        });
        return;
      }
      const { paymentDate } = req.body;

      const invoice = await this.invoiceService.markAsPaid(id, paymentDate ? new Date(paymentDate) : new Date());

      res.status(200).json({
        success: true,
        data: {
          invoice: this.mapInvoiceToResponse(invoice)
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to mark invoice as paid', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to mark invoice as paid'
      });
    }
  }

  @RequirePermission('invoices', 'update')
  @RequireTenant()
  async cancelInvoice(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Invoice ID is required'
        });
        return;
      }
      const invoice = await this.invoiceService.cancel(id);

      res.status(200).json({
        success: true,
        data: {
          invoice: this.mapInvoiceToResponse(invoice)
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to cancel invoice', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to cancel invoice'
      });
    }
  }

  private mapInvoiceToResponse(invoice: any): any {
    return {
      id: invoice.id,
      invoiceId: invoice.invoiceId?.value || invoice.invoiceId,
      tenantId: invoice.tenantId,
      projectId: invoice.projectId,
      clientId: invoice.clientId,
      supplierId: invoice.supplierId,
      invoiceNumber: invoice.invoiceNumber,
      type: invoice.type,
      amount: invoice.amount,
      tax: invoice.tax,
      total: invoice.total,
      currency: invoice.currency,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      paymentDate: invoice.paymentDate,
      status: invoice.status,
      fileUrl: invoice.fileUrl,
      notes: invoice.notes,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt
    };
  }
}

