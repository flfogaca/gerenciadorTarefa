import { ValueObject } from '../base';

export class PaymentIdVO extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }

  protected validate(): void {
    if (!this._value || this._value.trim().length === 0) {
      throw new Error('Payment ID cannot be empty');
    }
  }
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CASH = 'cash',
  CHECK = 'check',
  PIX = 'pix',
  OTHER = 'other'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export class Payment {
  constructor(
    public readonly id: string,
    public readonly paymentId: PaymentIdVO,
    public readonly tenantId: string,
    public readonly invoiceId: string | null,
    public readonly expenseId: string | null,
    public readonly amount: number,
    public readonly currency: string,
    public readonly method: PaymentMethod,
    public readonly paymentDate: Date,
    public readonly dueDate: Date | null,
    public readonly status: PaymentStatus,
    public readonly transactionId: string | null,
    public readonly notes: string | null,
    public readonly metadata: Record<string, any>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }
    if (!this.invoiceId && !this.expenseId) {
      throw new Error('Payment must be associated with either an invoice or expense');
    }
    if (this.invoiceId && this.expenseId) {
      throw new Error('Payment cannot be associated with both invoice and expense');
    }
    if (!this.currency || this.currency.trim().length === 0) {
      throw new Error('Payment currency is required');
    }
  }

  static create(data: {
    id: string;
    paymentId: string;
    tenantId: string;
    invoiceId?: string | null;
    expenseId?: string | null;
    amount: number;
    currency?: string;
    method: PaymentMethod;
    paymentDate: Date;
    dueDate?: Date | null;
    status?: PaymentStatus;
    transactionId?: string | null;
    notes?: string | null;
    metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
  }): Payment {
    return new Payment(
      data.id,
      new PaymentIdVO(data.paymentId),
      data.tenantId,
      data.invoiceId || null,
      data.expenseId || null,
      data.amount,
      data.currency || 'BRL',
      data.method,
      data.paymentDate,
      data.dueDate || null,
      data.status || PaymentStatus.PENDING,
      data.transactionId || null,
      data.notes || null,
      data.metadata || {},
      data.createdAt || new Date(),
      data.updatedAt || new Date()
    );
  }

  process(transactionId: string): Payment {
    if (this.status !== PaymentStatus.PENDING) {
      throw new Error('Only pending payments can be processed');
    }
    return new Payment(
      this.id,
      this.paymentId,
      this.tenantId,
      this.invoiceId,
      this.expenseId,
      this.amount,
      this.currency,
      this.method,
      this.paymentDate,
      this.dueDate,
      PaymentStatus.PROCESSING,
      transactionId,
      this.notes,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  complete(): Payment {
    if (this.status !== PaymentStatus.PROCESSING && this.status !== PaymentStatus.PENDING) {
      throw new Error('Only pending or processing payments can be completed');
    }
    return new Payment(
      this.id,
      this.paymentId,
      this.tenantId,
      this.invoiceId,
      this.expenseId,
      this.amount,
      this.currency,
      this.method,
      this.paymentDate,
      this.dueDate,
      PaymentStatus.COMPLETED,
      this.transactionId,
      this.notes,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  fail(): Payment {
    if (this.status === PaymentStatus.COMPLETED) {
      throw new Error('Cannot fail completed payments');
    }
    return new Payment(
      this.id,
      this.paymentId,
      this.tenantId,
      this.invoiceId,
      this.expenseId,
      this.amount,
      this.currency,
      this.method,
      this.paymentDate,
      this.dueDate,
      PaymentStatus.FAILED,
      this.transactionId,
      this.notes,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  refund(): Payment {
    if (this.status !== PaymentStatus.COMPLETED) {
      throw new Error('Only completed payments can be refunded');
    }
    return new Payment(
      this.id,
      this.paymentId,
      this.tenantId,
      this.invoiceId,
      this.expenseId,
      this.amount,
      this.currency,
      this.method,
      this.paymentDate,
      this.dueDate,
      PaymentStatus.REFUNDED,
      this.transactionId,
      this.notes,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  cancel(): Payment {
    if (this.status === PaymentStatus.COMPLETED) {
      throw new Error('Cannot cancel completed payments');
    }
    if (this.status === PaymentStatus.CANCELLED) {
      throw new Error('Payment is already cancelled');
    }
    return new Payment(
      this.id,
      this.paymentId,
      this.tenantId,
      this.invoiceId,
      this.expenseId,
      this.amount,
      this.currency,
      this.method,
      this.paymentDate,
      this.dueDate,
      PaymentStatus.CANCELLED,
      this.transactionId,
      this.notes,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  update(data: {
    amount?: number;
    paymentDate?: Date;
    dueDate?: Date | null;
    method?: PaymentMethod;
    notes?: string | null;
  }): Payment {
    if (this.status === PaymentStatus.COMPLETED) {
      throw new Error('Cannot update completed payments');
    }
    if (this.status === PaymentStatus.CANCELLED) {
      throw new Error('Cannot update cancelled payments');
    }
    return new Payment(
      this.id,
      this.paymentId,
      this.tenantId,
      this.invoiceId,
      this.expenseId,
      data.amount || this.amount,
      this.currency,
      data.method || this.method,
      data.paymentDate || this.paymentDate,
      data.dueDate !== undefined ? data.dueDate : this.dueDate,
      this.status,
      this.transactionId,
      data.notes !== undefined ? data.notes : this.notes,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }
}

