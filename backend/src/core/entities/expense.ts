import { ValueObject } from '../base';

export class ExpenseIdVO extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }

  protected validate(): void {
    if (!this._value || this._value.trim().length === 0) {
      throw new Error('Expense ID cannot be empty');
    }
  }
}

export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}

export interface ExpenseAttachment {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly type: string;
  readonly size: number;
  readonly uploadedAt: Date;
}

export class Expense {
  constructor(
    public readonly id: string,
    public readonly expenseId: ExpenseIdVO,
    public readonly tenantId: string,
    public readonly projectId: string | null,
    public readonly supplierId: string | null,
    public readonly category: string,
    public readonly description: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly date: Date,
    public readonly invoiceNumber: string | null,
    public readonly status: ExpenseStatus,
    public readonly approvedBy: string | null,
    public readonly approvedAt: Date | null,
    public readonly notes: string | null,
    public readonly attachments: ExpenseAttachment[],
    public readonly metadata: Record<string, any>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.amount <= 0) {
      throw new Error('Expense amount must be greater than 0');
    }
    if (!this.category || this.category.trim().length === 0) {
      throw new Error('Expense category is required');
    }
    if (!this.description || this.description.trim().length === 0) {
      throw new Error('Expense description is required');
    }
    if (!this.currency || this.currency.trim().length === 0) {
      throw new Error('Expense currency is required');
    }
  }

  static create(data: {
    id: string;
    expenseId: string;
    tenantId: string;
    projectId?: string | null;
    supplierId?: string | null;
    category: string;
    description: string;
    amount: number;
    currency?: string;
    date: Date;
    invoiceNumber?: string | null;
    status?: ExpenseStatus;
    approvedBy?: string | null;
    approvedAt?: Date | null;
    notes?: string | null;
    attachments?: ExpenseAttachment[];
    metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
  }): Expense {
    return new Expense(
      data.id,
      new ExpenseIdVO(data.expenseId),
      data.tenantId,
      data.projectId || null,
      data.supplierId || null,
      data.category,
      data.description,
      data.amount,
      data.currency || 'BRL',
      data.date,
      data.invoiceNumber || null,
      data.status || ExpenseStatus.PENDING,
      data.approvedBy || null,
      data.approvedAt || null,
      data.notes || null,
      data.attachments || [],
      data.metadata || {},
      data.createdAt || new Date(),
      data.updatedAt || new Date()
    );
  }

  approve(approvedBy: string): Expense {
    if (this.status !== ExpenseStatus.PENDING) {
      throw new Error('Only pending expenses can be approved');
    }
    return new Expense(
      this.id,
      this.expenseId,
      this.tenantId,
      this.projectId,
      this.supplierId,
      this.category,
      this.description,
      this.amount,
      this.currency,
      this.date,
      this.invoiceNumber,
      ExpenseStatus.APPROVED,
      approvedBy,
      new Date(),
      this.notes,
      this.attachments,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  reject(approvedBy: string): Expense {
    if (this.status !== ExpenseStatus.PENDING) {
      throw new Error('Only pending expenses can be rejected');
    }
    return new Expense(
      this.id,
      this.expenseId,
      this.tenantId,
      this.projectId,
      this.supplierId,
      this.category,
      this.description,
      this.amount,
      this.currency,
      this.date,
      this.invoiceNumber,
      ExpenseStatus.REJECTED,
      approvedBy,
      new Date(),
      this.notes,
      this.attachments,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  markAsPaid(): Expense {
    if (this.status !== ExpenseStatus.APPROVED) {
      throw new Error('Only approved expenses can be marked as paid');
    }
    return new Expense(
      this.id,
      this.expenseId,
      this.tenantId,
      this.projectId,
      this.supplierId,
      this.category,
      this.description,
      this.amount,
      this.currency,
      this.date,
      this.invoiceNumber,
      ExpenseStatus.PAID,
      this.approvedBy,
      this.approvedAt,
      this.notes,
      this.attachments,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  update(data: {
    category?: string;
    description?: string;
    amount?: number;
    date?: Date;
    invoiceNumber?: string | null;
    notes?: string | null;
    supplierId?: string | null;
  }): Expense {
    if (this.status === ExpenseStatus.PAID) {
      throw new Error('Cannot update paid expenses');
    }
    return new Expense(
      this.id,
      this.expenseId,
      this.tenantId,
      this.projectId,
      data.supplierId !== undefined ? data.supplierId : this.supplierId,
      data.category || this.category,
      data.description || this.description,
      data.amount || this.amount,
      this.currency,
      data.date || this.date,
      data.invoiceNumber !== undefined ? data.invoiceNumber : this.invoiceNumber,
      this.status,
      this.approvedBy,
      this.approvedAt,
      data.notes !== undefined ? data.notes : this.notes,
      this.attachments,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  addAttachment(attachment: ExpenseAttachment): Expense {
    const updatedAttachments = [...this.attachments, attachment];
    return new Expense(
      this.id,
      this.expenseId,
      this.tenantId,
      this.projectId,
      this.supplierId,
      this.category,
      this.description,
      this.amount,
      this.currency,
      this.date,
      this.invoiceNumber,
      this.status,
      this.approvedBy,
      this.approvedAt,
      this.notes,
      updatedAttachments,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }
}

