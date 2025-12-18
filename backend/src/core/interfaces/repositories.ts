import { Tenant, TenantIdVO } from '../entities/tenant';
import { User } from '../entities/user';
import { Project, ProjectIdVO } from '../entities/project';
import { Task, TaskIdVO } from '../entities/task';
import { Client } from '../entities/client';
import { Supplier } from '../entities/supplier';
import { Expense, ExpenseIdVO, ExpenseStatus } from '../entities/expense';
import { Invoice, InvoiceIdVO, InvoiceStatus } from '../entities/invoice';
import { Payment, PaymentIdVO, PaymentStatus } from '../entities/payment';
import { FinancialTransaction, TransactionIdVO, TransactionType } from '../entities/financial-transaction';
import { Template, TemplateIdVO } from '../entities/template';
import { UserSettings } from '../entities/user-settings';
import { TenantSettings } from '../entities/tenant-settings';
import { UserRole } from '../base';
import { AuditFilters } from '../interfaces/services';

// Base Repository Interface - Seguindo o padrão Repository
export interface IRepository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: ID): Promise<void>;
  exists(id: ID): Promise<boolean>;
}

// Tenant Repository
export interface ITenantRepository extends IRepository<Tenant, string> {
  findByTenantId(tenantId: TenantIdVO): Promise<Tenant | null>;
  findByDomain(domain: string): Promise<Tenant | null>;
  findActiveTenants(): Promise<Tenant[]>;
  findByUserId(userId: string): Promise<Tenant[]>;
}

// User Repository
export interface IUserRepository extends IRepository<User, string> {
  findByUserId(userId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByTenantId(tenantId: TenantIdVO): Promise<User[]>;
  findByRole(role: UserRole): Promise<User[]>;
  findActiveUsers(): Promise<User[]>;
  findByEmailAndTenant(email: string, tenantId: TenantIdVO): Promise<User | null>;
  findUsersWithPermission(resource: string, action: string): Promise<User[]>;
}

// Project Repository
export interface IProjectRepository extends IRepository<Project, string> {
  findByProjectId(projectId: ProjectIdVO): Promise<Project | null>;
  findByTenantId(tenantId: TenantIdVO): Promise<Project[]>;
  findByManagerId(managerId: string): Promise<Project[]>;
  findByClientId(clientId: string): Promise<Project[]>;
  findByStatus(status: string): Promise<Project[]>;
  findActiveProjects(): Promise<Project[]>;
  findByTeamMember(userId: string): Promise<Project[]>;
  findOverdueProjects(): Promise<Project[]>;
}

// Task Repository
export interface ITaskRepository extends IRepository<Task, string> {
  findByTaskId(taskId: TaskIdVO): Promise<Task | null>;
  findByProjectId(projectId: ProjectIdVO): Promise<Task[]>;
  findByAssigneeId(assigneeId: string): Promise<Task[]>;
  findByReporterId(reporterId: string): Promise<Task[]>;
  findByStatus(status: string): Promise<Task[]>;
  findByPriority(priority: string): Promise<Task[]>;
  findByTenantId(tenantId: TenantIdVO): Promise<Task[]>;
  findOverdueTasks(): Promise<Task[]>;
  findByWatcher(userId: string): Promise<Task[]>;
  findByTag(tagName: string): Promise<Task[]>;
  findTasksDueSoon(days: number): Promise<Task[]>;
}

// Client Repository
export interface IClientRepository extends IRepository<Client, string> {
  create(client: Client): Promise<Client>;
  findByTenant(tenantId: TenantIdVO): Promise<Client[]>;
  findByEmail(email: string, tenantId: TenantIdVO): Promise<Client | null>;
  findByCnpj(cnpj: string, tenantId: TenantIdVO): Promise<Client | null>;
  findMany(options: {
    tenantId: TenantIdVO;
    limit?: number;
    offset?: number;
    filters?: {
      isActive?: boolean;
      search?: string;
    };
  }): Promise<{ clients: Client[]; total: number }>;
}

// Supplier Repository
export interface ISupplierRepository extends IRepository<Supplier, string> {
  create(supplier: Supplier): Promise<Supplier>;
  findByTenant(tenantId: TenantIdVO): Promise<Supplier[]>;
  findByEmail(email: string, tenantId: TenantIdVO): Promise<Supplier | null>;
  findByCnpj(cnpj: string, tenantId: TenantIdVO): Promise<Supplier | null>;
  findByService(service: string, tenantId: TenantIdVO): Promise<Supplier[]>;
  findMany(options: {
    tenantId: TenantIdVO;
    limit?: number;
    offset?: number;
    filters?: {
      isActive?: boolean;
      search?: string;
      service?: string;
    };
  }): Promise<{ suppliers: Supplier[]; total: number }>;
}

export interface AuditLogRecord {
  id: string;
  tenantId?: string | null;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  details: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: any;
  createdAt: Date;
  updatedAt?: Date;
}

export interface NotificationRecord {
  id: string;
  tenantId?: string | null;
  userId?: string | null;
  type: string;
  title?: string | null;
  message?: string | null;
  data?: any;
  channel: string;
  status: string;
  priority?: string | null;
  readAt?: Date | null;
  sentAt?: Date | null;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IAuditLogRepository {
  create(entry: AuditLogRecord): Promise<void>;
  findMany(filters: AuditFilters): Promise<{ logs: AuditLogRecord[]; total: number }>;
}

export interface INotificationRepository {
  create(entry: NotificationRecord): Promise<void>;
  updateStatus(notificationId: string, status: string, extras?: { readAt?: Date | null; sentAt?: Date | null }): Promise<void>;
  findByUser(userId: string): Promise<NotificationRecord[]>;
}

// Expense Repository
export interface IExpenseRepository extends IRepository<Expense, string> {
  findByExpenseId(expenseId: ExpenseIdVO): Promise<Expense | null>;
  findByTenantId(tenantId: TenantIdVO): Promise<Expense[]>;
  findByProjectId(projectId: string): Promise<Expense[]>;
  findBySupplierId(supplierId: string): Promise<Expense[]>;
  findByStatus(status: ExpenseStatus): Promise<Expense[]>;
  findByCategory(category: string, tenantId: TenantIdVO): Promise<Expense[]>;
  findByDateRange(startDate: Date, endDate: Date, tenantId: TenantIdVO): Promise<Expense[]>;
  findMany(options: {
    tenantId: TenantIdVO;
    limit?: number;
    offset?: number;
    filters?: {
      projectId?: string;
      supplierId?: string;
      status?: ExpenseStatus;
      category?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    };
  }): Promise<{ expenses: Expense[]; total: number }>;
}

// Invoice Repository
export interface IInvoiceRepository extends IRepository<Invoice, string> {
  findByInvoiceId(invoiceId: InvoiceIdVO): Promise<Invoice | null>;
  findByTenantId(tenantId: TenantIdVO): Promise<Invoice[]>;
  findByProjectId(projectId: string): Promise<Invoice[]>;
  findByClientId(clientId: string): Promise<Invoice[]>;
  findBySupplierId(supplierId: string): Promise<Invoice[]>;
  findByStatus(status: InvoiceStatus): Promise<Invoice[]>;
  findByInvoiceNumber(invoiceNumber: string, tenantId: TenantIdVO): Promise<Invoice | null>;
  findOverdueInvoices(tenantId: TenantIdVO): Promise<Invoice[]>;
  findByDateRange(startDate: Date, endDate: Date, tenantId: TenantIdVO): Promise<Invoice[]>;
  findMany(options: {
    tenantId: TenantIdVO;
    limit?: number;
    offset?: number;
    filters?: {
      projectId?: string;
      clientId?: string;
      supplierId?: string;
      status?: InvoiceStatus;
      type?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    };
  }): Promise<{ invoices: Invoice[]; total: number }>;
}

// Payment Repository
export interface IPaymentRepository extends IRepository<Payment, string> {
  findByPaymentId(paymentId: PaymentIdVO): Promise<Payment | null>;
  findByTenantId(tenantId: TenantIdVO): Promise<Payment[]>;
  findByInvoiceId(invoiceId: string): Promise<Payment[]>;
  findByExpenseId(expenseId: string): Promise<Payment[]>;
  findByStatus(status: PaymentStatus): Promise<Payment[]>;
  findByDateRange(startDate: Date, endDate: Date, tenantId: TenantIdVO): Promise<Payment[]>;
  findMany(options: {
    tenantId: TenantIdVO;
    limit?: number;
    offset?: number;
    filters?: {
      invoiceId?: string;
      expenseId?: string;
      status?: PaymentStatus;
      method?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    };
  }): Promise<{ payments: Payment[]; total: number }>;
}

// Financial Transaction Repository
export interface IFinancialTransactionRepository extends IRepository<FinancialTransaction, string> {
  findByTransactionId(transactionId: TransactionIdVO): Promise<FinancialTransaction | null>;
  findByTenantId(tenantId: TenantIdVO): Promise<FinancialTransaction[]>;
  findByType(type: TransactionType, tenantId: TenantIdVO): Promise<FinancialTransaction[]>;
  findByCategory(category: string, tenantId: TenantIdVO): Promise<FinancialTransaction[]>;
  findByDateRange(startDate: Date, endDate: Date, tenantId: TenantIdVO): Promise<FinancialTransaction[]>;
  findUnreconciled(tenantId: TenantIdVO): Promise<FinancialTransaction[]>;
  findReconciled(tenantId: TenantIdVO): Promise<FinancialTransaction[]>;
  findMany(options: {
    tenantId: TenantIdVO;
    limit?: number;
    offset?: number;
    filters?: {
      type?: TransactionType;
      category?: string;
      reconciled?: boolean;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    };
  }): Promise<{ transactions: FinancialTransaction[]; total: number }>;
}

// Template Repository
export interface ITemplateRepository extends IRepository<Template, string> {
  findByTemplateId(templateId: TemplateIdVO): Promise<Template | null>;
  findByTenantId(tenantId: TenantIdVO): Promise<Template[]>;
  findByCategory(category: string, tenantId: TenantIdVO): Promise<Template[]>;
  findPublicTemplates(): Promise<Template[]>;
  findByCreator(createdBy: string): Promise<Template[]>;
  findMany(options: {
    tenantId: TenantIdVO;
    limit?: number;
    offset?: number;
    filters?: {
      category?: string;
      isPublic?: boolean;
      isDefault?: boolean;
      search?: string;
    };
  }): Promise<{ templates: Template[]; total: number }>;
}

// User Settings Repository
export interface IUserSettingsRepository extends IRepository<UserSettings, string> {
  findByUserId(userId: string): Promise<UserSettings | null>;
  findByTenantId(tenantId: TenantIdVO): Promise<UserSettings[]>;
}

// Tenant Settings Repository
export interface ITenantSettingsRepository extends IRepository<TenantSettings, string> {
  findByTenantId(tenantId: TenantIdVO): Promise<TenantSettings | null>;
}

// Unit of Work Pattern - Para transações
export interface IUnitOfWork {
  tenantRepository: ITenantRepository;
  userRepository: IUserRepository;
  projectRepository: IProjectRepository;
  taskRepository: ITaskRepository;
  clientRepository: IClientRepository;
  supplierRepository: ISupplierRepository;
  expenseRepository: IExpenseRepository;
  invoiceRepository: IInvoiceRepository;
  paymentRepository: IPaymentRepository;
  financialTransactionRepository: IFinancialTransactionRepository;
  templateRepository: ITemplateRepository;
  userSettingsRepository: IUserSettingsRepository;
  tenantSettingsRepository: ITenantSettingsRepository;
  
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  saveChanges(): Promise<void>;
}
