// Base Use Case Interface
export interface IUseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

// Import types from base
import { UserRole, TaskStatus, TaskPriority } from '@/core/base';
import { Tenant } from '@/core/entities/tenant';
import { User } from '@/core/entities/user';
import { Project } from '@/core/entities/project';
import { Task } from '@/core/entities/task';
import { Client } from '@/core/entities/client';
import { Supplier } from '@/core/entities/supplier';

// Tenant Use Cases
export interface ICreateTenantUseCase extends IUseCase<CreateTenantRequest, CreateTenantResponse> {}
export interface IUpdateTenantUseCase extends IUseCase<UpdateTenantRequest, UpdateTenantResponse> {}
export interface IGetTenantUseCase extends IUseCase<GetTenantRequest, GetTenantResponse> {}
export interface IListTenantsUseCase extends IUseCase<ListTenantsRequest, ListTenantsResponse> {}

export interface CreateTenantRequest {
  tenantId: string;
  name: string;
  domain: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
  settings?: any;
}

export interface CreateTenantResponse {
  tenant: Tenant;
  adminUser: User;
}

export interface UpdateTenantRequest {
  tenantId: string;
  name?: string;
  domain?: string;
  settings?: any;
}

export interface UpdateTenantResponse {
  tenant: Tenant;
}

export interface GetTenantRequest {
  tenantId: string;
}

export interface GetTenantResponse {
  tenant: Tenant;
}

export interface ListTenantsRequest {
  limit?: number;
  offset?: number;
  filters?: {
    isActive?: boolean;
    domain?: string;
  };
}

export interface ListTenantsResponse {
  tenants: Tenant[];
  total: number;
}

// User Use Cases
export interface ICreateUserUseCase extends IUseCase<CreateUserRequest, CreateUserResponse> {}
export interface IUpdateUserUseCase extends IUseCase<UpdateUserRequest, UpdateUserResponse> {}
export interface IAuthenticateUserUseCase extends IUseCase<AuthenticateUserRequest, AuthenticateUserResponse> {}
export interface IChangePasswordUseCase extends IUseCase<ChangePasswordRequest, ChangePasswordResponse> {}
export interface IGetUserUseCase extends IUseCase<GetUserRequest, GetUserResponse> {}
export interface IListUsersUseCase extends IUseCase<ListUsersRequest, ListUsersResponse> {}
export interface IDeleteUserUseCase extends IUseCase<DeleteUserRequest, DeleteUserResponse> {}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  profile?: any;
}

export interface CreateUserResponse {
  user: User;
}

export interface UpdateUserRequest {
  userId: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  profile?: any;
}

export interface UpdateUserResponse {
  user: User;
}

export interface AuthenticateUserRequest {
  email: string;
  password: string;
  tenantId?: string;
}

export interface AuthenticateUserResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface ChangePasswordRequest {
  userId: string;
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
}

export interface GetUserRequest {
  userId: string;
}

export interface GetUserResponse {
  user: User;
}

export interface ListUsersRequest {
  tenantId: string;
  limit?: number;
  offset?: number;
  filters?: {
    role?: UserRole;
    isActive?: boolean;
    search?: string;
  };
}

export interface ListUsersResponse {
  users: User[];
  total: number;
}

export interface DeleteUserRequest {
  userId: string;
}

export interface DeleteUserResponse {
  success: boolean;
  userId: string;
}

// Project Use Cases
export interface ICreateProjectUseCase extends IUseCase<CreateProjectRequest, CreateProjectResponse> {}
export interface IUpdateProjectUseCase extends IUseCase<UpdateProjectRequest, UpdateProjectResponse> {}
export interface IGetProjectUseCase extends IUseCase<GetProjectRequest, GetProjectResponse> {}
export interface IListProjectsUseCase extends IUseCase<ListProjectsRequest, ListProjectsResponse> {}
export interface IChangeProjectStatusUseCase extends IUseCase<ChangeProjectStatusRequest, ChangeProjectStatusResponse> {}
export interface IDeleteProjectUseCase extends IUseCase<DeleteProjectRequest, DeleteProjectResponse> {}

export interface CreateProjectRequest {
  projectId: string;
  name: string;
  description: string;
  clientId: string;
  managerId: string;
  tenantId: string;
  budget: any;
  timeline: any;
}

export interface CreateProjectResponse {
  project: Project;
}

export interface UpdateProjectRequest {
  projectId: string;
  name?: string;
  description?: string;
  clientId?: string;
  managerId?: string;
  budget?: any;
  timeline?: any;
}

export interface UpdateProjectResponse {
  project: Project;
}

export interface GetProjectRequest {
  projectId: string;
}

export interface GetProjectResponse {
  project: Project;
}

export interface ListProjectsRequest {
  tenantId: string;
  limit?: number;
  offset?: number;
  filters?: {
    status?: string;
    managerId?: string;
    clientId?: string;
    search?: string;
  };
}

export interface ListProjectsResponse {
  projects: Project[];
  total: number;
}

export interface ChangeProjectStatusRequest {
  projectId: string;
  status: string;
}

export interface ChangeProjectStatusResponse {
  project: Project;
}

export interface DeleteProjectRequest {
  projectId: string;
}

export interface DeleteProjectResponse {
  success: boolean;
  projectId: string;
}

// Task Use Cases
export interface ICreateTaskUseCase extends IUseCase<CreateTaskRequest, CreateTaskResponse> {}
export interface IUpdateTaskUseCase extends IUseCase<UpdateTaskRequest, UpdateTaskResponse> {}
export interface IGetTaskUseCase extends IUseCase<GetTaskRequest, GetTaskResponse> {}
export interface IListTasksUseCase extends IUseCase<ListTasksRequest, ListTasksResponse> {}
export interface IChangeTaskStatusUseCase extends IUseCase<ChangeTaskStatusRequest, ChangeTaskStatusResponse> {}
export interface IReassignTaskUseCase extends IUseCase<ReassignTaskRequest, ReassignTaskResponse> {}
export interface ILogTimeUseCase extends IUseCase<LogTimeRequest, LogTimeResponse> {}
export interface IDeleteTaskUseCase extends IUseCase<DeleteTaskRequest, DeleteTaskResponse> {}

export interface CreateTaskRequest {
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

export interface CreateTaskResponse {
  task: Task;
}

export interface UpdateTaskRequest {
  taskId: string;
  title?: string;
  description?: string;
  assigneeId?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  estimatedHours?: number;
}

export interface UpdateTaskResponse {
  task: Task;
}

export interface GetTaskRequest {
  taskId: string;
}

export interface GetTaskResponse {
  task: Task;
}

export interface ListTasksRequest {
  tenantId: string;
  limit?: number;
  offset?: number;
  filters?: {
    projectId?: string;
    assigneeId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
  };
}

export interface ListTasksResponse {
  tasks: Task[];
  total: number;
}

export interface ChangeTaskStatusRequest {
  taskId: string;
  status: TaskStatus;
}

export interface ChangeTaskStatusResponse {
  task: Task;
}

export interface ReassignTaskRequest {
  taskId: string;
  newAssigneeId: string;
}

export interface ReassignTaskResponse {
  task: Task;
}

export interface LogTimeRequest {
  taskId: string;
  userId: string;
  duration: number;
  description?: string;
}

export interface LogTimeResponse {
  task: Task;
}

export interface DeleteTaskRequest {
  taskId: string;
}

export interface DeleteTaskResponse {
  success: boolean;
  taskId: string;
}

// Client Use Cases
export interface ICreateClientUseCase extends IUseCase<CreateClientRequest, CreateClientResponse> {}
export interface IUpdateClientUseCase extends IUseCase<UpdateClientRequest, UpdateClientResponse> {}
export interface IGetClientUseCase extends IUseCase<GetClientRequest, GetClientResponse> {}
export interface IListClientsUseCase extends IUseCase<ListClientsRequest, ListClientsResponse> {}
export interface IDeleteClientUseCase extends IUseCase<DeleteClientRequest, DeleteClientResponse> {}

export interface CreateClientRequest {
  tenantId: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  settings?: any;
}

export interface CreateClientResponse {
  client: Client;
}

export interface UpdateClientRequest {
  clientId: string;
  name?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  settings?: any;
  isActive?: boolean;
}

export interface UpdateClientResponse {
  client: Client;
}

export interface GetClientRequest {
  clientId: string;
}

export interface GetClientResponse {
  client: Client;
}

export interface ListClientsRequest {
  tenantId: string;
  limit?: number;
  offset?: number;
  filters?: {
    isActive?: boolean;
    search?: string;
  };
}

export interface ListClientsResponse {
  clients: Client[];
  total: number;
}

export interface DeleteClientRequest {
  clientId: string;
}

export interface DeleteClientResponse {
  client: Client;
}

// Supplier Use Cases
export interface ICreateSupplierUseCase extends IUseCase<CreateSupplierRequest, CreateSupplierResponse> {}
export interface IUpdateSupplierUseCase extends IUseCase<UpdateSupplierRequest, UpdateSupplierResponse> {}
export interface IGetSupplierUseCase extends IUseCase<GetSupplierRequest, GetSupplierResponse> {}
export interface IListSuppliersUseCase extends IUseCase<ListSuppliersRequest, ListSuppliersResponse> {}
export interface IDeleteSupplierUseCase extends IUseCase<DeleteSupplierRequest, DeleteSupplierResponse> {}

export interface CreateSupplierRequest {
  tenantId: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  services?: string[];
  settings?: any;
}

export interface CreateSupplierResponse {
  supplier: Supplier;
}

export interface UpdateSupplierRequest {
  supplierId: string;
  name?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  services?: string[];
  settings?: any;
  isActive?: boolean;
}

export interface UpdateSupplierResponse {
  supplier: Supplier;
}

export interface GetSupplierRequest {
  supplierId: string;
}

export interface GetSupplierResponse {
  supplier: Supplier;
}

export interface ListSuppliersRequest {
  tenantId: string;
  limit?: number;
  offset?: number;
  filters?: {
    isActive?: boolean;
    search?: string;
    service?: string;
  };
}

export interface ListSuppliersResponse {
  suppliers: Supplier[];
  total: number;
}

export interface DeleteSupplierRequest {
  supplierId: string;
}

export interface DeleteSupplierResponse {
  supplier: Supplier;
}
