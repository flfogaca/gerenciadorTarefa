import { Tenant, TenantIdVO } from '../entities/tenant';
import { User, UserProfile } from '../entities/user';
import { Project, ProjectBudget, ProjectTimeline } from '../entities/project';
import { Task } from '../entities/task';
import { Expense, ExpenseStatus } from '../entities/expense';
import { Invoice, InvoiceStatus, InvoiceType } from '../entities/invoice';
import { Payment, PaymentStatus, PaymentMethod } from '../entities/payment';
import { FinancialTransaction, TransactionType } from '../entities/financial-transaction';
import { Template } from '../entities/template';
import { UserSettings } from '../entities/user-settings';
import { TenantSettings } from '../entities/tenant-settings';
import { UserRole, TaskStatus, TaskPriority, Permission } from '../base';

// Base Service Interface
export interface IService<T, CreateDTO, UpdateDTO> {
  create(dto: CreateDTO): Promise<T>;
  update(id: string, dto: UpdateDTO): Promise<T>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
}

// Tenant Service
export interface ITenantService extends IService<Tenant, CreateTenantDTO, UpdateTenantDTO> {
  findByTenantId(tenantId: TenantIdVO): Promise<Tenant | null>;
  findByDomain(domain: string): Promise<Tenant | null>;
  activateTenant(tenantId: TenantIdVO): Promise<Tenant>;
  deactivateTenant(tenantId: TenantIdVO): Promise<Tenant>;
  updateSettings(tenantId: TenantIdVO, settings: Partial<any>): Promise<Tenant>;
  getTenantStats(tenantId: TenantIdVO): Promise<TenantStats>;
}

export interface CreateTenantDTO {
  tenantId: string;
  name: string;
  domain: string;
  settings: any;
}

export interface UpdateTenantDTO {
  name?: string;
  domain?: string;
  settings?: any;
}

export interface TenantStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
}

// User Service
export interface IUserService extends IService<User, CreateUserDTO, UpdateUserDTO> {
  findByEmail(email: string): Promise<User | null>;
  findByTenantId(tenantId: TenantIdVO): Promise<User[]>;
  authenticate(email: string, password: string): Promise<AuthResult>;
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
  updateProfile(userId: string, profile: Partial<UserProfile>): Promise<User>;
  updateRole(userId: string, role: UserRole): Promise<User>;
  addPermission(userId: string, resource: string, action: string): Promise<User>;
  removePermission(userId: string, resource: string, action: string): Promise<User>;
  hasPermission(userId: string, resource: string, action: string): Promise<boolean>;
  recordLogin(userId: string): Promise<User>;
  getUserStats(userId: string): Promise<UserStats>;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  profile?: Partial<UserProfile>;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  profile?: Partial<UserProfile>;
}

export interface AuthResult {
  user: User;
  token: string;
  refreshToken: string;
}

export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalHours: number;
  projectsCount: number;
}

// Project Service
export interface IProjectService extends IService<Project, CreateProjectDTO, UpdateProjectDTO> {
  findByProjectId(projectId: string): Promise<Project | null>;
  findByTenantId(tenantId: TenantIdVO): Promise<Project[]>;
  findByManagerId(managerId: string): Promise<Project[]>;
  changeStatus(projectId: string, status: string): Promise<Project>;
  updateBudget(projectId: string, budget: ProjectBudget): Promise<Project>;
  updateTimeline(projectId: string, timeline: ProjectTimeline): Promise<Project>;
  addTeamMember(projectId: string, userId: string, role: string): Promise<Project>;
  removeTeamMember(projectId: string, userId: string): Promise<Project>;
  getProjectProgress(projectId: string): Promise<ProjectProgress>;
  getProjectStats(projectId: string): Promise<ProjectStats>;
}

export interface CreateProjectDTO {
  projectId: string;
  name: string;
  description: string;
  clientId: string;
  managerId: string;
  tenantId: string;
  budget: ProjectBudget;
  timeline: ProjectTimeline;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  clientId?: string;
  managerId?: string;
  budget?: ProjectBudget;
  timeline?: ProjectTimeline;
}

export interface ProjectProgress {
  percentage: number;
  completedTasks: number;
  totalTasks: number;
  completedMilestones: number;
  totalMilestones: number;
}

export interface ProjectStats {
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  totalHours: number;
  completedHours: number;
  teamSize: number;
  tasksCount: number;
}

// Task Service
export interface ITaskService extends IService<Task, CreateTaskDTO, UpdateTaskDTO> {
  findByTaskId(taskId: string): Promise<Task | null>;
  findByTenantId(tenantId: TenantIdVO): Promise<Task[]>;
  findByProjectId(projectId: string): Promise<Task[]>;
  findByAssigneeId(assigneeId: string): Promise<Task[]>;
  changeStatus(taskId: string, status: TaskStatus): Promise<Task>;
  changePriority(taskId: string, priority: TaskPriority): Promise<Task>;
  reassign(taskId: string, newAssigneeId: string): Promise<Task>;
  addTag(taskId: string, tagName: string, color: string): Promise<Task>;
  removeTag(taskId: string, tagName: string): Promise<Task>;
  addWatcher(taskId: string, userId: string): Promise<Task>;
  removeWatcher(taskId: string, userId: string): Promise<Task>;
  logTime(taskId: string, userId: string, duration: number, description?: string): Promise<Task>;
  addComment(taskId: string, userId: string, content: string): Promise<Task>;
  getTaskStats(taskId: string): Promise<TaskStats>;
}

export interface CreateTaskDTO {
  taskId: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  reporterId: string;
  tenantId: string;
  priority?: TaskPriority;
  dueDate?: Date;
  estimatedHours?: number;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  assigneeId?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  estimatedHours?: number;
  attachments?: any[];
  tags?: any[];
  watchers?: any[];
}

export interface TaskStats {
  totalTime: number;
  completedTime: number;
  commentsCount: number;
  attachmentsCount: number;
  watchersCount: number;
  subtasksCount: number;
  completedSubtasks: number;
}

// Permission Service
export interface IPermissionService {
  checkPermission(userId: string, resource: string, action: string): Promise<boolean>;
  getUserPermissions(userId: string): Promise<Permission[]>;
  grantPermission(userId: string, resource: string, action: string): Promise<void>;
  revokePermission(userId: string, resource: string, action: string): Promise<void>;
  getRolePermissions(role: UserRole): Promise<Permission[]>;
}

// Notification Service
export interface INotificationService {
  sendEmail(to: string, subject: string, content: string): Promise<void>;
  sendPushNotification(userId: string, title: string, message: string): Promise<void>;
  sendSMS(phone: string, message: string): Promise<void>;
  createNotification(userId: string, type: string, data: any): Promise<void>;
  markAsRead(notificationId: string): Promise<void>;
  getUserNotifications(userId: string): Promise<any[]>;
}

// Audit Service
export interface IAuditService {
  logAction(userId: string, action: string, resource: string, details: any): Promise<void>;
  getAuditLogs(filters: AuditFilters): Promise<any[]>;
  getUserAuditLogs(userId: string): Promise<any[]>;
}

export interface AuditFilters {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  limit?: number;
  offset?: number;
  tenantId?: string | undefined;
}

export interface CreateExpenseDTO {
  tenantId: string;
  projectId?: string | null;
  supplierId?: string | null;
  category: string;
  description: string;
  amount: number;
  currency?: string;
  date: Date;
  invoiceNumber?: string | null;
  notes?: string | null;
}

export interface UpdateExpenseDTO {
  category?: string;
  description?: string;
  amount?: number;
  date?: Date;
  invoiceNumber?: string | null;
  notes?: string | null;
  supplierId?: string | null;
}

export interface IExpenseService extends IService<Expense, CreateExpenseDTO, UpdateExpenseDTO> {
  findByExpenseId(expenseId: string): Promise<Expense | null>;
  findByTenantId(tenantId: TenantIdVO): Promise<Expense[]>;
  findByProjectId(projectId: string): Promise<Expense[]>;
  approve(expenseId: string, approvedBy: string): Promise<Expense>;
  reject(expenseId: string, approvedBy: string): Promise<Expense>;
  markAsPaid(expenseId: string): Promise<Expense>;
  findByStatus(status: ExpenseStatus): Promise<Expense[]>;
  findByDateRange(startDate: Date, endDate: Date, tenantId: TenantIdVO): Promise<Expense[]>;
}

export interface CreateInvoiceDTO {
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
  fileUrl?: string | null;
  notes?: string | null;
}

export interface UpdateInvoiceDTO {
  invoiceNumber?: string;
  amount?: number;
  tax?: number;
  total?: number;
  issueDate?: Date;
  dueDate?: Date | null;
  fileUrl?: string | null;
  notes?: string | null;
}

export interface IInvoiceService extends IService<Invoice, CreateInvoiceDTO, UpdateInvoiceDTO> {
  findByInvoiceId(invoiceId: string): Promise<Invoice | null>;
  findByTenantId(tenantId: TenantIdVO): Promise<Invoice[]>;
  findByProjectId(projectId: string): Promise<Invoice[]>;
  send(invoiceId: string): Promise<Invoice>;
  markAsPaid(invoiceId: string, paymentDate: Date): Promise<Invoice>;
  markAsOverdue(invoiceId: string): Promise<Invoice>;
  cancel(invoiceId: string): Promise<Invoice>;
  findByStatus(status: InvoiceStatus): Promise<Invoice[]>;
  findOverdueInvoices(tenantId: TenantIdVO): Promise<Invoice[]>;
}

export interface CreatePaymentDTO {
  tenantId: string;
  invoiceId?: string | null;
  expenseId?: string | null;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  paymentDate: Date;
  dueDate?: Date | null;
  transactionId?: string | null;
  notes?: string | null;
}

export interface UpdatePaymentDTO {
  amount?: number;
  paymentDate?: Date;
  dueDate?: Date | null;
  method?: PaymentMethod;
  notes?: string | null;
}

export interface IPaymentService extends IService<Payment, CreatePaymentDTO, UpdatePaymentDTO> {
  findByPaymentId(paymentId: string): Promise<Payment | null>;
  findByTenantId(tenantId: TenantIdVO): Promise<Payment[]>;
  findByInvoiceId(invoiceId: string): Promise<Payment[]>;
  findByExpenseId(expenseId: string): Promise<Payment[]>;
  process(paymentId: string, transactionId: string): Promise<Payment>;
  complete(paymentId: string): Promise<Payment>;
  fail(paymentId: string): Promise<Payment>;
  refund(paymentId: string): Promise<Payment>;
  cancel(paymentId: string): Promise<Payment>;
  findByStatus(status: PaymentStatus): Promise<Payment[]>;
}

export interface CreateFinancialTransactionDTO {
  tenantId: string;
  type: TransactionType;
  amount: number;
  currency?: string;
  category: string;
  description: string;
  relatedEntity?: string | null;
  relatedEntityId?: string | null;
  date: Date;
}

export interface UpdateFinancialTransactionDTO {
  amount?: number;
  category?: string;
  description?: string;
  date?: Date;
}

export interface IFinancialTransactionService extends IService<FinancialTransaction, CreateFinancialTransactionDTO, UpdateFinancialTransactionDTO> {
  findByTransactionId(transactionId: string): Promise<FinancialTransaction | null>;
  findByTenantId(tenantId: TenantIdVO): Promise<FinancialTransaction[]>;
  findByType(type: TransactionType, tenantId: TenantIdVO): Promise<FinancialTransaction[]>;
  reconcile(transactionId: string): Promise<FinancialTransaction>;
  unreconcile(transactionId: string): Promise<FinancialTransaction>;
  findUnreconciled(tenantId: TenantIdVO): Promise<FinancialTransaction[]>;
  findByDateRange(startDate: Date, endDate: Date, tenantId: TenantIdVO): Promise<FinancialTransaction[]>;
}

export interface FinancialReportFilters {
  tenantId: string;
  startDate?: Date;
  endDate?: Date;
  projectId?: string;
  category?: string;
  type?: TransactionType;
}

export interface FinancialReport {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    totalInvoices: number;
    paidInvoices: number;
    overdueInvoices: number;
    totalPayments: number;
    pendingPayments: number;
  };
  expensesByCategory: Array<{ category: string; amount: number; percentage: number }>;
  incomeByProject: Array<{ projectId: string; projectName: string; amount: number }>;
  expensesByProject: Array<{ projectId: string; projectName: string; amount: number }>;
  monthlyTrends: Array<{ month: string; income: number; expenses: number; profit: number }>;
  generatedAt: Date;
}

export interface IFinancialReportService {
  generateDashboardReport(filters: FinancialReportFilters): Promise<FinancialReport>;
  generateExpenseReport(filters: FinancialReportFilters): Promise<any>;
  generateIncomeReport(filters: FinancialReportFilters): Promise<any>;
  generateCashFlowReport(filters: FinancialReportFilters): Promise<any>;
  generateProjectReport(projectId: string, filters: FinancialReportFilters): Promise<any>;
}

export interface CreateTemplateDTO {
  templateId: string;
  tenantId: string;
  name: string;
  description: string;
  category: string;
  createdBy: string;
  phases?: any[];
  tasks?: any[];
  isPublic?: boolean;
  tags?: string[];
}

export interface UpdateTemplateDTO {
  name?: string;
  description?: string;
  category?: string;
  phases?: any[];
  tasks?: any[];
  isPublic?: boolean;
  tags?: string[];
  settings?: Record<string, any>;
}

export interface ITemplateService extends IService<Template, CreateTemplateDTO, UpdateTemplateDTO> {
  findByTemplateId(templateId: string): Promise<Template | null>;
  findByTenantId(tenantId: string): Promise<Template[]>;
  findByCategory(category: string, tenantId: string): Promise<Template[]>;
  findPublicTemplates(): Promise<Template[]>;
  useTemplate(templateId: string, projectId: string, tenantId: string): Promise<void>;
  incrementUsage(templateId: string): Promise<Template>;
  updateRating(templateId: string, rating: number): Promise<Template>;
}

export interface CreateUserSettingsDTO {
  userId: string;
  tenantId: string;
  settings?: Record<string, any>;
  preferences?: Record<string, any>;
  notifications?: Record<string, any>;
  theme?: string;
  language?: string;
  timezone?: string;
}

export interface UpdateUserSettingsDTO {
  settings?: Record<string, any>;
  preferences?: Record<string, any>;
  notifications?: Record<string, any>;
  theme?: string;
  language?: string;
  timezone?: string;
}

export interface IUserSettingsService extends IService<UserSettings, CreateUserSettingsDTO, UpdateUserSettingsDTO> {
  findByUserId(userId: string): Promise<UserSettings | null>;
  getOrCreate(userId: string, tenantId: string): Promise<UserSettings>;
}

export interface CreateTenantSettingsDTO {
  tenantId: string;
  settings?: Record<string, any>;
  features?: Record<string, any>;
  integrations?: Record<string, any>;
  branding?: Record<string, any>;
  limits?: Record<string, any>;
}

export interface UpdateTenantSettingsDTO {
  settings?: Record<string, any>;
  features?: Record<string, any>;
  integrations?: Record<string, any>;
  branding?: Record<string, any>;
  limits?: Record<string, any>;
}

export interface ITenantSettingsService extends IService<TenantSettings, CreateTenantSettingsDTO, UpdateTenantSettingsDTO> {
  findByTenantId(tenantId: string): Promise<TenantSettings | null>;
  getOrCreate(tenantId: string): Promise<TenantSettings>;
}
