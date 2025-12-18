import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '@/shared/types';
import { IExpenseService } from '@/core/interfaces/services';
import { RequirePermission } from '@/core/permissions/permission-system';
import { RequireTenant } from '@/core/multi-tenant/tenant-context';
import { ValidationService } from '@/shared/validation/validation.service';
import { Logger } from '@/shared/logging/logger';
import Joi from 'joi';
import { TenantIdVO } from '@/core/entities/tenant';

@injectable()
export class ExpenseController {
  private readonly createExpenseSchema = Joi.object({
    projectId: Joi.string().optional().allow(null),
    supplierId: Joi.string().optional().allow(null),
    category: Joi.string().required(),
    description: Joi.string().required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).default('BRL'),
    date: Joi.date().required(),
    invoiceNumber: Joi.string().optional().allow(null),
    notes: Joi.string().optional().allow(null)
  });

  private readonly updateExpenseSchema = Joi.object({
    category: Joi.string().optional(),
    description: Joi.string().optional(),
    amount: Joi.number().positive().optional(),
    date: Joi.date().optional(),
    invoiceNumber: Joi.string().optional().allow(null),
    notes: Joi.string().optional().allow(null),
    supplierId: Joi.string().optional().allow(null)
  });

  constructor(
    @inject(TYPES.ExpenseService) private readonly expenseService: IExpenseService,
    @inject(TYPES.ValidationService) private readonly validationService: ValidationService,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  @RequirePermission('expenses', 'read')
  @RequireTenant()
  async getExpenses(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const tenantId = new TenantIdVO(tenantContext.tenantId.value);
      const expenses = await this.expenseService.findByTenantId(tenantId);

      res.status(200).json({
        success: true,
        data: {
          expenses: expenses.map(exp => this.mapExpenseToResponse(exp)),
          total: expenses.length
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to get expenses', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get expenses'
      });
    }
  }

  @RequirePermission('expenses', 'read')
  @RequireTenant()
  async getExpense(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Expense ID is required'
        });
        return;
      }
      const expense = await this.expenseService.findById(id);

      if (!expense) {
        res.status(404).json({
          success: false,
          error: 'Expense not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          expense: this.mapExpenseToResponse(expense)
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to get expense', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get expense'
      });
    }
  }

  @RequirePermission('expenses', 'create')
  @RequireTenant()
  async createExpense(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const validationResult = await this.validationService.validate(this.createExpenseSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const expense = await this.expenseService.create({
        ...req.body,
        tenantId: tenantContext.tenantId.value,
        date: new Date(req.body.date)
      });

      res.status(201).json({
        success: true,
        data: {
          expense: this.mapExpenseToResponse(expense)
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to create expense', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create expense'
      });
    }
  }

  @RequirePermission('expenses', 'update')
  @RequireTenant()
  async updateExpense(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Expense ID is required'
        });
        return;
      }
      const validationResult = await this.validationService.validate(this.updateExpenseSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const updateData: any = { ...req.body };
      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }

      const expense = await this.expenseService.update(id, updateData);

      res.status(200).json({
        success: true,
        data: {
          expense: this.mapExpenseToResponse(expense)
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to update expense', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update expense'
      });
    }
  }

  @RequirePermission('expenses', 'delete')
  @RequireTenant()
  async deleteExpense(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Expense ID is required'
        });
        return;
      }
      await this.expenseService.delete(id);

      res.status(200).json({
        success: true,
        message: 'Expense deleted successfully'
      });
    } catch (error: any) {
      this.logger.error('Failed to delete expense', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete expense'
      });
    }
  }

  @RequirePermission('expenses', 'update')
  @RequireTenant()
  async approveExpense(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Expense ID is required'
        });
        return;
      }
      const { approvedBy } = req.body;

      if (!approvedBy) {
        res.status(400).json({
          success: false,
          error: 'approvedBy is required'
        });
        return;
      }

      const expense = await this.expenseService.approve(id, approvedBy);

      res.status(200).json({
        success: true,
        data: {
          expense: this.mapExpenseToResponse(expense)
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to approve expense', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to approve expense'
      });
    }
  }

  @RequirePermission('expenses', 'update')
  @RequireTenant()
  async rejectExpense(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Expense ID is required'
        });
        return;
      }
      const { approvedBy } = req.body;

      if (!approvedBy) {
        res.status(400).json({
          success: false,
          error: 'approvedBy is required'
        });
        return;
      }

      const expense = await this.expenseService.reject(id, approvedBy);

      res.status(200).json({
        success: true,
        data: {
          expense: this.mapExpenseToResponse(expense)
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to reject expense', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to reject expense'
      });
    }
  }

  @RequirePermission('expenses', 'update')
  @RequireTenant()
  async markExpenseAsPaid(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Expense ID is required'
        });
        return;
      }
      const expense = await this.expenseService.markAsPaid(id);

      res.status(200).json({
        success: true,
        data: {
          expense: this.mapExpenseToResponse(expense)
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to mark expense as paid', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to mark expense as paid'
      });
    }
  }

  private mapExpenseToResponse(expense: any): any {
    return {
      id: expense.id,
      expenseId: expense.expenseId?.value || expense.expenseId,
      tenantId: expense.tenantId,
      projectId: expense.projectId,
      supplierId: expense.supplierId,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      currency: expense.currency,
      date: expense.date,
      invoiceNumber: expense.invoiceNumber,
      status: expense.status,
      approvedBy: expense.approvedBy,
      approvedAt: expense.approvedAt,
      notes: expense.notes,
      attachments: expense.attachments,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt
    };
  }
}

