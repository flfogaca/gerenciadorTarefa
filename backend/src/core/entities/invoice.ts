import { ValueObject } from '../base';

export class InvoiceIdVO extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }

  protected validate(): void {
    if (!this._value || this._value.trim().length === 0) {
      throw new Error('Invoice ID cannot be empty');
    }
  }
}

export enum InvoiceType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export class Invoice {
  constructor(
    public readonly id: string,
    public readonly invoiceId: InvoiceIdVO,
    public readonly tenantId: string,
    public readonly projectId: string | null,
    public readonly clientId: string | null,
    public readonly supplierId: string | null,
    public readonly invoiceNumber: string,
    public readonly type: InvoiceType,
    public readonly amount: number,
    public readonly tax: number,
    public readonly total: number,
    public readonly currency: string,
    public readonly issueDate: Date,
    public readonly dueDate: Date | null,
    public readonly paymentDate: Date | null,
    public readonly status: InvoiceStatus,
    public readonly fileUrl: string | null,
    public readonly metadata: Record<string, any>,
    public readonly notes: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.amount <= 0) {
      throw new Error('Invoice amount must be greater than 0');
    }
    if (this.tax < 0) {
      throw new Error('Invoice tax cannot be negative');
    }
    if (this.total <= 0) {
      throw new Error('Invoice total must be greater than 0');
    }
    if (!this.invoiceNumber || this.invoiceNumber.trim().length === 0) {
      throw new Error('Invoice number is required');
    }
    if (!this.currency || this.currency.trim().length === 0) {
      throw new Error('Invoice currency is required');
    }
    if (this.type === InvoiceType.INCOME && !this.clientId) {
      throw new Error('Income invoices must have a client');
    }
    if (this.type === InvoiceType.EXPENSE && !this.supplierId) {
      throw new Error('Expense invoices must have a supplier');
    }
  }

  static create(data: {
    id: string;
    invoiceId: string;
    tenantId: string;
    projectId?: string | null;
    clientId?: string | null;
    supplierId?: string | null;
    invoiceNumber: string;
    type: InvoiceType;
    amount: number;
    tax?: number;
    total?: number;
    currency?: string;
    issueDate: Date;
    dueDate?: Date | null;
    paymentDate?: Date | null;
    status?: InvoiceStatus;
    fileUrl?: string | null;
    metadata?: Record<string, any>;
    notes?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Invoice {
    const tax = data.tax || 0;
    const total = data.total || (data.amount + tax);
    
    return new Invoice(
      data.id,
      new InvoiceIdVO(data.invoiceId),
      data.tenantId,
      data.projectId || null,
      data.clientId || null,
      data.supplierId || null,
      data.invoiceNumber,
      data.type,
      data.amount,
      tax,
      total,
      data.currency || 'BRL',
      data.issueDate,
      data.dueDate || null,
      data.paymentDate || null,
      data.status || InvoiceStatus.DRAFT,
      data.fileUrl || null,
      data.metadata || {},
      data.notes || null,
      data.createdAt || new Date(),
      data.updatedAt || new Date()
    );
  }

  send(): Invoice {
    if (this.status !== InvoiceStatus.DRAFT) {
      throw new Error('Only draft invoices can be sent');
    }
    return new Invoice(
      this.id,
      this.invoiceId,
      this.tenantId,
      this.projectId,
      this.clientId,
      this.supplierId,
      this.invoiceNumber,
      this.type,
      this.amount,
      this.tax,
      this.total,
      this.currency,
      this.issueDate,
      this.dueDate,
      this.paymentDate,
      InvoiceStatus.SENT,
      this.fileUrl,
      this.metadata,
      this.notes,
      this.createdAt,
      new Date()
    );
  }

  markAsPaid(paymentDate: Date): Invoice {
    if (this.status === InvoiceStatus.PAID) {
      throw new Error('Invoice is already paid');
    }
    if (this.status === InvoiceStatus.CANCELLED) {
      throw new Error('Cannot mark cancelled invoice as paid');
    }
    return new Invoice(
      this.id,
      this.invoiceId,
      this.tenantId,
      this.projectId,
      this.clientId,
      this.supplierId,
      this.invoiceNumber,
      this.type,
      this.amount,
      this.tax,
      this.total,
      this.currency,
      this.issueDate,
      this.dueDate,
      paymentDate,
      InvoiceStatus.PAID,
      this.fileUrl,
      this.metadata,
      this.notes,
      this.createdAt,
      new Date()
    );
  }

  markAsOverdue(): Invoice {
    if (this.status !== InvoiceStatus.SENT) {
      throw new Error('Only sent invoices can be marked as overdue');
    }
    if (!this.dueDate) {
      throw new Error('Invoice must have a due date to be marked as overdue');
    }
    if (this.dueDate > new Date()) {
      throw new Error('Invoice due date has not passed');
    }
    return new Invoice(
      this.id,
      this.invoiceId,
      this.tenantId,
      this.projectId,
      this.clientId,
      this.supplierId,
      this.invoiceNumber,
      this.type,
      this.amount,
      this.tax,
      this.total,
      this.currency,
      this.issueDate,
      this.dueDate,
      this.paymentDate,
      InvoiceStatus.OVERDUE,
      this.fileUrl,
      this.metadata,
      this.notes,
      this.createdAt,
      new Date()
    );
  }

  cancel(): Invoice {
    if (this.status === InvoiceStatus.PAID) {
      throw new Error('Cannot cancel paid invoices');
    }
    if (this.status === InvoiceStatus.CANCELLED) {
      throw new Error('Invoice is already cancelled');
    }
    return new Invoice(
      this.id,
      this.invoiceId,
      this.tenantId,
      this.projectId,
      this.clientId,
      this.supplierId,
      this.invoiceNumber,
      this.type,
      this.amount,
      this.tax,
      this.total,
      this.currency,
      this.issueDate,
      this.dueDate,
      this.paymentDate,
      InvoiceStatus.CANCELLED,
      this.fileUrl,
      this.metadata,
      this.notes,
      this.createdAt,
      new Date()
    );
  }

  update(data: {
    invoiceNumber?: string;
    amount?: number;
    tax?: number;
    total?: number;
    issueDate?: Date;
    dueDate?: Date | null;
    fileUrl?: string | null;
    notes?: string | null;
  }): Invoice {
    if (this.status === InvoiceStatus.PAID) {
      throw new Error('Cannot update paid invoices');
    }
    if (this.status === InvoiceStatus.CANCELLED) {
      throw new Error('Cannot update cancelled invoices');
    }
    
    const amount = data.amount || this.amount;
    const tax = data.tax !== undefined ? data.tax : this.tax;
    const total = data.total || (amount + tax);
    
    return new Invoice(
      this.id,
      this.invoiceId,
      this.tenantId,
      this.projectId,
      this.clientId,
      this.supplierId,
      data.invoiceNumber || this.invoiceNumber,
      this.type,
      amount,
      tax,
      total,
      this.currency,
      data.issueDate || this.issueDate,
      data.dueDate !== undefined ? data.dueDate : this.dueDate,
      this.paymentDate,
      this.status,
      data.fileUrl !== undefined ? data.fileUrl : this.fileUrl,
      this.metadata,
      data.notes !== undefined ? data.notes : this.notes,
      this.createdAt,
      new Date()
    );
  }
}

