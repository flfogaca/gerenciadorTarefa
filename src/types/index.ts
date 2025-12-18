// Tipos compartilhados para todo o projeto

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  CLIENT = 'CLIENT'
}

export interface User {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  profile?: any;
  permissions: string[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  clientId?: string;
  managerId?: string;
  budget?: {
    total: number;
    spent: number;
    planned: number;
  };
  timeline?: {
    startDate: string;
    endDate: string;
    deadline?: string;
  };
  progress?: number;
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId?: string;
  reporterId?: string;
  dueDate?: string;
  estimatedHours?: number;
  completedHours?: number;
  tags?: string[];
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  watchers?: string[];
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TaskComment {
  id: string;
  message: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
}

export interface Client {
  id: string;
  clientId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  supplierId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  services?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  category: string;
  phases?: any[];
  tasks?: any[];
  isDefault: boolean;
  isPublic: boolean;
  usageCount: number;
  rating: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string | null;
}

export interface UserSettings {
  id: string;
  userId: string;
  tenantId: string;
  settings: Record<string, any>;
  preferences: Record<string, any>;
  notifications: Record<string, any>;
  theme: string;
  language: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  id: string;
  tenantId: string;
  settings: Record<string, any>;
  features: Record<string, any>;
  integrations: Record<string, any>;
  branding: Record<string, any>;
  limits: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  expenseId: string;
  description: string;
  amount: number;
  category: string;
  projectId?: string;
  supplierId?: string;
  status: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceId: string;
  number: string;
  amount: number;
  projectId?: string;
  clientId?: string;
  supplierId?: string;
  status: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  paymentId: string;
  amount: number;
  method: string;
  invoiceId?: string;
  expenseId?: string;
  status: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  data?: any;
  createdAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

