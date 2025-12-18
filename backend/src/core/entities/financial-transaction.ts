import { ValueObject } from '../base';

export class TransactionIdVO extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }

  protected validate(): void {
    if (!this._value || this._value.trim().length === 0) {
      throw new Error('Transaction ID cannot be empty');
    }
  }
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer'
}

export class FinancialTransaction {
  constructor(
    public readonly id: string,
    public readonly transactionId: TransactionIdVO,
    public readonly tenantId: string,
    public readonly type: TransactionType,
    public readonly amount: number,
    public readonly currency: string,
    public readonly category: string,
    public readonly description: string,
    public readonly relatedEntity: string | null,
    public readonly relatedEntityId: string | null,
    public readonly date: Date,
    public readonly reconciled: boolean,
    public readonly reconciledAt: Date | null,
    public readonly metadata: Record<string, any>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.amount <= 0) {
      throw new Error('Transaction amount must be greater than 0');
    }
    if (!this.category || this.category.trim().length === 0) {
      throw new Error('Transaction category is required');
    }
    if (!this.description || this.description.trim().length === 0) {
      throw new Error('Transaction description is required');
    }
    if (!this.currency || this.currency.trim().length === 0) {
      throw new Error('Transaction currency is required');
    }
  }

  static create(data: {
    id: string;
    transactionId: string;
    tenantId: string;
    type: TransactionType;
    amount: number;
    currency?: string;
    category: string;
    description: string;
    relatedEntity?: string | null;
    relatedEntityId?: string | null;
    date: Date;
    reconciled?: boolean;
    reconciledAt?: Date | null;
    metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
  }): FinancialTransaction {
    return new FinancialTransaction(
      data.id,
      new TransactionIdVO(data.transactionId),
      data.tenantId,
      data.type,
      data.amount,
      data.currency || 'BRL',
      data.category,
      data.description,
      data.relatedEntity || null,
      data.relatedEntityId || null,
      data.date,
      data.reconciled || false,
      data.reconciledAt || null,
      data.metadata || {},
      data.createdAt || new Date(),
      data.updatedAt || new Date()
    );
  }

  reconcile(): FinancialTransaction {
    if (this.reconciled) {
      throw new Error('Transaction is already reconciled');
    }
    return new FinancialTransaction(
      this.id,
      this.transactionId,
      this.tenantId,
      this.type,
      this.amount,
      this.currency,
      this.category,
      this.description,
      this.relatedEntity,
      this.relatedEntityId,
      this.date,
      true,
      new Date(),
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  unreconcile(): FinancialTransaction {
    if (!this.reconciled) {
      throw new Error('Transaction is not reconciled');
    }
    return new FinancialTransaction(
      this.id,
      this.transactionId,
      this.tenantId,
      this.type,
      this.amount,
      this.currency,
      this.category,
      this.description,
      this.relatedEntity,
      this.relatedEntityId,
      this.date,
      false,
      null,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  update(data: {
    amount?: number;
    category?: string;
    description?: string;
    date?: Date;
  }): FinancialTransaction {
    if (this.reconciled) {
      throw new Error('Cannot update reconciled transactions');
    }
    return new FinancialTransaction(
      this.id,
      this.transactionId,
      this.tenantId,
      this.type,
      data.amount || this.amount,
      this.currency,
      data.category || this.category,
      data.description || this.description,
      this.relatedEntity,
      this.relatedEntityId,
      data.date || this.date,
      this.reconciled,
      this.reconciledAt,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }
}

