import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '@/shared/types';
import { IPaymentService } from '@/core/interfaces/services';
import { RequirePermission } from '@/core/permissions/permission-system';
import { RequireTenant } from '@/core/multi-tenant/tenant-context';
import { ValidationService } from '@/shared/validation/validation.service';
import { Logger } from '@/shared/logging/logger';
import Joi from 'joi';
import { TenantIdVO } from '@/core/entities/tenant';

@injectable()
export class PaymentController {
  private readonly createPaymentSchema = Joi.object({
    invoiceId: Joi.string().optional().allow(null),
    expenseId: Joi.string().optional().allow(null),
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).default('BRL'),
    method: Joi.string().valid('bank_transfer', 'credit_card', 'debit_card', 'cash', 'check', 'pix', 'other').required(),
    paymentDate: Joi.date().required(),
    dueDate: Joi.date().optional().allow(null),
    transactionId: Joi.string().optional().allow(null),
    notes: Joi.string().optional().allow(null)
  });

  private readonly updatePaymentSchema = Joi.object({
    amount: Joi.number().positive().optional(),
    paymentDate: Joi.date().optional(),
    dueDate: Joi.date().optional().allow(null),
    method: Joi.string().valid('bank_transfer', 'credit_card', 'debit_card', 'cash', 'check', 'pix', 'other').optional(),
    notes: Joi.string().optional().allow(null)
  });

  constructor(
    @inject(TYPES.PaymentService) private readonly paymentService: IPaymentService,
    @inject(TYPES.ValidationService) private readonly validationService: ValidationService,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  @RequirePermission('payments', 'read')
  @RequireTenant()
  async getPayments(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const tenantId = new TenantIdVO(tenantContext.tenantId.value);
      const payments = await this.paymentService.findByTenantId(tenantId);

      res.status(200).json({
        success: true,
        data: {
          payments: payments.map(pay => this.mapPaymentToResponse(pay)),
          total: payments.length
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to get payments', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get payments'
      });
    }
  }

  @RequirePermission('payments', 'read')
  @RequireTenant()
  async getPayment(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Payment ID is required'
        });
        return;
      }
      const payment = await this.paymentService.findById(id);

      if (!payment) {
        res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          payment: this.mapPaymentToResponse(payment)
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to get payment', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get payment'
      });
    }
  }

  @RequirePermission('payments', 'create')
  @RequireTenant()
  async createPayment(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const validationResult = await this.validationService.validate(this.createPaymentSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const payment = await this.paymentService.create({
        ...req.body,
        tenantId: tenantContext.tenantId.value,
        paymentDate: new Date(req.body.paymentDate),
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null
      });

      res.status(201).json({
        success: true,
        data: {
          payment: this.mapPaymentToResponse(payment)
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to create payment', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create payment'
      });
    }
  }

  @RequirePermission('payments', 'update')
  @RequireTenant()
  async updatePayment(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Payment ID is required'
        });
        return;
      }
      const validationResult = await this.validationService.validate(this.updatePaymentSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const updateData: any = { ...req.body };
      if (updateData.paymentDate) {
        updateData.paymentDate = new Date(updateData.paymentDate);
      }
      if (updateData.dueDate !== undefined) {
        updateData.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
      }

      const payment = await this.paymentService.update(id, updateData);

      res.status(200).json({
        success: true,
        data: {
          payment: this.mapPaymentToResponse(payment)
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to update payment', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update payment'
      });
    }
  }

  @RequirePermission('payments', 'delete')
  @RequireTenant()
  async deletePayment(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Payment ID is required'
        });
        return;
      }
      await this.paymentService.delete(id);

      res.status(200).json({
        success: true,
        message: 'Payment deleted successfully'
      });
    } catch (error: any) {
      this.logger.error('Failed to delete payment', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete payment'
      });
    }
  }

  @RequirePermission('payments', 'update')
  @RequireTenant()
  async processPayment(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Payment ID is required'
        });
        return;
      }
      const { transactionId } = req.body;

      if (!transactionId) {
        res.status(400).json({
          success: false,
          error: 'transactionId is required'
        });
        return;
      }

      const payment = await this.paymentService.process(id, transactionId);

      res.status(200).json({
        success: true,
        data: {
          payment: this.mapPaymentToResponse(payment)
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to process payment', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process payment'
      });
    }
  }

  @RequirePermission('payments', 'update')
  @RequireTenant()
  async completePayment(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Payment ID is required'
        });
        return;
      }
      const payment = await this.paymentService.complete(id);

      res.status(200).json({
        success: true,
        data: {
          payment: this.mapPaymentToResponse(payment)
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to complete payment', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to complete payment'
      });
    }
  }

  @RequirePermission('payments', 'update')
  @RequireTenant()
  async refundPayment(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Payment ID is required'
        });
        return;
      }
      const payment = await this.paymentService.refund(id);

      res.status(200).json({
        success: true,
        data: {
          payment: this.mapPaymentToResponse(payment)
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to refund payment', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to refund payment'
      });
    }
  }

  private mapPaymentToResponse(payment: any): any {
    return {
      id: payment.id,
      paymentId: payment.paymentId?.value || payment.paymentId,
      tenantId: payment.tenantId,
      invoiceId: payment.invoiceId,
      expenseId: payment.expenseId,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      paymentDate: payment.paymentDate,
      dueDate: payment.dueDate,
      status: payment.status,
      transactionId: payment.transactionId,
      notes: payment.notes,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt
    };
  }
}

