// Removendo import circular

export interface TenantId extends ValueObject<string> {
  readonly value: string;
}

export interface UserId extends ValueObject<string> {
  readonly value: string;
}

export interface ProjectId extends ValueObject<string> {
  readonly value: string;
}

export interface TaskId extends ValueObject<string> {
  readonly value: string;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TENANT_ADMIN = 'tenant_admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  CLIENT = 'client'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Permission {
  readonly resource: string;
  readonly action: string;
  readonly conditions?: Record<string, unknown>;
}

export interface RolePermissions {
  readonly role: UserRole;
  readonly permissions: Permission[];
}

export abstract class BaseEntity implements Entity {
  abstract readonly id: string;
  abstract readonly createdAt: Date;
  abstract readonly updatedAt: Date;
  abstract readonly tenantId: TenantId;
}

export abstract class ValueObject<T> {
  constructor(protected readonly _value: T) {
    this.validate();
  }

  get value(): T {
    return this._value;
  }

  equals(other: ValueObject<T>): boolean {
    return this._value === other._value;
  }

  protected abstract validate(): void;
}

export interface Entity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
