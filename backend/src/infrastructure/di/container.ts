import { Container } from 'inversify';
import { TYPES } from '@/shared/types';

// Repositories
import { ITenantRepository, IUserRepository, IProjectRepository, ITaskRepository, IClientRepository, ISupplierRepository, IExpenseRepository, IInvoiceRepository, IPaymentRepository, IFinancialTransactionRepository, ITemplateRepository, IUserSettingsRepository, ITenantSettingsRepository, IUnitOfWork, IAuditLogRepository, INotificationRepository } from '@/core/interfaces/repositories';

// Services
import { ITenantService, IUserService, IProjectService, ITaskService, IExpenseService, IInvoiceService, IPaymentService, IFinancialTransactionService, IFinancialReportService, ITemplateService, IUserSettingsService, ITenantSettingsService, INotificationService, IAuditService } from '@/core/interfaces/services';

// Use Cases
import { 
  ICreateTenantUseCase,
  IUpdateTenantUseCase,
  IGetTenantUseCase,
  IListTenantsUseCase,
  ICreateUserUseCase,
  IUpdateUserUseCase,
  IAuthenticateUserUseCase,
  IChangePasswordUseCase,
  IGetUserUseCase,
  IListUsersUseCase,
  ICreateProjectUseCase,
  IUpdateProjectUseCase,
  IGetProjectUseCase,
  IListProjectsUseCase,
  IChangeProjectStatusUseCase,
  IDeleteProjectUseCase,
  ICreateTaskUseCase,
  IUpdateTaskUseCase,
  IGetTaskUseCase,
  IListTasksUseCase,
  IChangeTaskStatusUseCase,
  IReassignTaskUseCase,
  ILogTimeUseCase,
  IDeleteTaskUseCase,
  IDeleteUserUseCase,
  ICreateClientUseCase,
  IUpdateClientUseCase,
  IGetClientUseCase,
  IListClientsUseCase,
  IDeleteClientUseCase,
  ICreateSupplierUseCase,
  IUpdateSupplierUseCase,
  IGetSupplierUseCase,
  IListSuppliersUseCase,
  IDeleteSupplierUseCase
} from '@/application/use-cases';
import { CreateTenantUseCase } from '@/application/use-cases/tenant/create-tenant.use-case';
import { UpdateTenantUseCase } from '@/application/use-cases/tenant/update-tenant.use-case';
import { GetTenantUseCase } from '@/application/use-cases/tenant/get-tenant.use-case';
import { ListTenantsUseCase } from '@/application/use-cases/tenant/list-tenants.use-case';
import { CreateUserUseCase } from '@/application/use-cases/user/create-user.use-case';
import { UpdateUserUseCase } from '@/application/use-cases/user/update-user.use-case';
import { AuthenticateUserUseCase } from '@/application/use-cases/user/authenticate-user.use-case';
import { ChangePasswordUseCase } from '@/application/use-cases/user/change-password.use-case';
import { GetUserUseCase } from '@/application/use-cases/user/get-user.use-case';
import { ListUsersUseCase } from '@/application/use-cases/user/list-users.use-case';
import { CreateProjectUseCase } from '@/application/use-cases/project/create-project.use-case';
import { UpdateProjectUseCase } from '@/application/use-cases/project/update-project.use-case';
import { GetProjectUseCase } from '@/application/use-cases/project/get-project.use-case';
import { ListProjectsUseCase } from '@/application/use-cases/project/list-projects.use-case';
import { ChangeProjectStatusUseCase } from '@/application/use-cases/project/change-project-status.use-case';
import { DeleteProjectUseCase } from '@/application/use-cases/project/delete-project.use-case';
import { CreateTaskUseCase } from '@/application/use-cases/task/create-task.use-case';
import { UpdateTaskUseCase } from '@/application/use-cases/task/update-task.use-case';
import { GetTaskUseCase } from '@/application/use-cases/task/get-task.use-case';
import { ListTasksUseCase } from '@/application/use-cases/task/list-tasks.use-case';
import { ChangeTaskStatusUseCase } from '@/application/use-cases/task/change-task-status.use-case';
import { ReassignTaskUseCase } from '@/application/use-cases/task/reassign-task.use-case';
import { LogTimeUseCase } from '@/application/use-cases/task/log-time.use-case';
import { DeleteTaskUseCase } from '@/application/use-cases/task/delete-task.use-case';
import { DeleteUserUseCase } from '@/application/use-cases/user/delete-user.use-case';
import { 
  CreateClientUseCase, 
  UpdateClientUseCase, 
  GetClientUseCase, 
  ListClientsUseCase, 
  DeleteClientUseCase 
} from '@/application/use-cases/client/create-client.use-case';
import { 
  CreateSupplierUseCase, 
  UpdateSupplierUseCase, 
  GetSupplierUseCase, 
  ListSuppliersUseCase, 
  DeleteSupplierUseCase 
} from '@/application/use-cases/supplier/create-supplier.use-case';

// Multi-tenant
import { ITenantContextService } from '@/core/multi-tenant/tenant-context';
import { ITenantDataIsolationService } from '@/core/multi-tenant/tenant-context';
import { ITenantConfigurationService } from '@/core/multi-tenant/tenant-context';
import { ITenantMigrationService } from '@/core/multi-tenant/tenant-context';

// Implementations
import { PrismaTenantRepository } from '@/infrastructure/repositories/prisma-tenant.repository';
import { PrismaUserRepository } from '@/infrastructure/repositories/prisma-user.repository';
import { PrismaProjectRepository } from '@/infrastructure/repositories/prisma-project.repository';
import { PrismaTaskRepository } from '@/infrastructure/repositories/prisma-task.repository';
import { PrismaClientRepository } from '@/infrastructure/repositories/prisma-client.repository';
import { PrismaSupplierRepository } from '@/infrastructure/repositories/prisma-supplier.repository';
import { PrismaExpenseRepository } from '@/infrastructure/repositories/prisma-expense.repository';
import { PrismaInvoiceRepository } from '@/infrastructure/repositories/prisma-invoice.repository';
import { PrismaPaymentRepository } from '@/infrastructure/repositories/prisma-payment.repository';
import { PrismaFinancialTransactionRepository } from '@/infrastructure/repositories/prisma-financial-transaction.repository';
import { PrismaTemplateRepository } from '@/infrastructure/repositories/prisma-template.repository';
import { PrismaUserSettingsRepository } from '@/infrastructure/repositories/prisma-user-settings.repository';
import { PrismaTenantSettingsRepository } from '@/infrastructure/repositories/prisma-tenant-settings.repository';
import { PrismaUnitOfWork } from '@/infrastructure/repositories/prisma-unit-of-work';
import { PrismaAuditLogRepository } from '@/infrastructure/repositories/prisma-audit-log.repository';
import { PrismaNotificationRepository } from '@/infrastructure/repositories/prisma-notification.repository';

import { TenantService } from '@/application/services/tenant.service';
import { UserService } from '@/application/services/user.service';
import { ProjectService } from '@/application/services/project.service';
import { TaskService } from '@/application/services/task.service';
import { ExpenseService } from '@/application/services/expense.service';
import { InvoiceService } from '@/application/services/invoice.service';
import { PaymentService } from '@/application/services/payment.service';
import { FinancialTransactionService } from '@/application/services/financial-transaction.service';
import { FinancialReportService } from '@/application/services/financial-report.service';
import { TemplateService } from '@/application/services/template.service';
import { UserSettingsService } from '@/application/services/user-settings.service';
import { TenantSettingsService } from '@/application/services/tenant-settings.service';
import { NotificationService } from '@/application/services/notification.service';
import { AuditService } from '@/application/services/audit.service';
import { CacheService } from '@/application/services/cache.service';
import { MonitoringService } from '@/application/services/monitoring.service';
import { ImportService } from '@/application/services/import.service';

// import { CreateUserUseCase } from '@/application/use-cases/user/create-user.use-case';
// import { CreateProjectUseCase } from '@/application/use-cases/project/create-project.use-case';
// import { CreateTaskUseCase } from '@/application/use-cases/task/create-task.use-case';

import { TenantContextService } from '@/core/multi-tenant/tenant-context';
import { TenantDataIsolationService } from '@/core/multi-tenant/tenant-context';
import { TenantConfigurationService } from '@/core/multi-tenant/tenant-context';
import { TenantMigrationService } from '@/core/multi-tenant/tenant-context';

// Controllers
import { TenantController } from '@/presentation/controllers/tenant.controller';
import { UserController } from '@/presentation/controllers/user.controller';
import { ProjectController } from '@/presentation/controllers/project.controller';
import { TaskController } from '@/presentation/controllers/task.controller';
import { ClientController } from '@/presentation/controllers/client.controller';
import { SupplierController } from '@/presentation/controllers/supplier.controller';
import { ExpenseController } from '@/presentation/controllers/expense.controller';
import { InvoiceController } from '@/presentation/controllers/invoice.controller';
import { PaymentController } from '@/presentation/controllers/payment.controller';
import { FinancialReportController } from '@/presentation/controllers/financial-report.controller';
import { TemplateController } from '@/presentation/controllers/template.controller';
import { UserSettingsController } from '@/presentation/controllers/user-settings.controller';
import { TenantSettingsController } from '@/presentation/controllers/tenant-settings.controller';
import { ReportsController } from '@/presentation/controllers/reports.controller';
import { MonitoringController } from '@/presentation/controllers/monitoring.controller';
import { NotificationController } from '@/presentation/controllers/notification.controller';
import { ImportController } from '@/presentation/controllers/import.controller';

// Database
import { PrismaClient } from '@prisma/client';
import { DatabaseService, IDatabaseService } from '@/infrastructure/database/database.service';
import { Logger } from '@/shared/logging/logger';
import { ValidationService } from '@/shared/validation/validation.service';

export class DIContainer {
  private static container: Container;

  static getContainer(): Container {
    if (!this.container) {
      this.container = new Container();
      this.configureContainer();
    }
    return this.container;
  }

  private static configureContainer(): void {
    // Database
    this.container.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(new PrismaClient());
    
    // Shared Services
    this.container.bind<Logger>(TYPES.Logger).to(Logger).inSingletonScope();
    this.container.bind<IDatabaseService>(TYPES.DatabaseService).to(DatabaseService).inSingletonScope();
    this.container.bind<ValidationService>(TYPES.ValidationService).to(ValidationService);

    // Repositories
    this.container.bind<ITenantRepository>(TYPES.TenantRepository).to(PrismaTenantRepository);
    this.container.bind<IUserRepository>(TYPES.UserRepository).to(PrismaUserRepository);
    this.container.bind<IProjectRepository>(TYPES.ProjectRepository).to(PrismaProjectRepository);
    this.container.bind<ITaskRepository>(TYPES.TaskRepository).to(PrismaTaskRepository);
    this.container.bind<IClientRepository>(TYPES.ClientRepository).to(PrismaClientRepository);
    this.container.bind<ISupplierRepository>(TYPES.SupplierRepository).to(PrismaSupplierRepository);
    this.container.bind<IExpenseRepository>(TYPES.ExpenseRepository).to(PrismaExpenseRepository);
    this.container.bind<IInvoiceRepository>(TYPES.InvoiceRepository).to(PrismaInvoiceRepository);
    this.container.bind<IPaymentRepository>(TYPES.PaymentRepository).to(PrismaPaymentRepository);
    this.container.bind<IFinancialTransactionRepository>(TYPES.FinancialTransactionRepository).to(PrismaFinancialTransactionRepository);
    this.container.bind<ITemplateRepository>(TYPES.TemplateRepository).to(PrismaTemplateRepository);
    this.container.bind<IUserSettingsRepository>(TYPES.UserSettingsRepository).to(PrismaUserSettingsRepository);
    this.container.bind<ITenantSettingsRepository>(TYPES.TenantSettingsRepository).to(PrismaTenantSettingsRepository);
    this.container.bind<IUnitOfWork>(TYPES.UnitOfWork).to(PrismaUnitOfWork);
    this.container.bind<IAuditLogRepository>(TYPES.AuditLogRepository).to(PrismaAuditLogRepository);
    this.container.bind<INotificationRepository>(TYPES.NotificationRepository).to(PrismaNotificationRepository);

    // Services
    this.container.bind<ITenantService>(TYPES.TenantService).to(TenantService);
    this.container.bind<IUserService>(TYPES.UserService).to(UserService);
    this.container.bind<IProjectService>(TYPES.ProjectService).to(ProjectService);
    this.container.bind<ITaskService>(TYPES.TaskService).to(TaskService);
    this.container.bind<IExpenseService>(TYPES.ExpenseService).to(ExpenseService);
    this.container.bind<IInvoiceService>(TYPES.InvoiceService).to(InvoiceService);
    this.container.bind<IPaymentService>(TYPES.PaymentService).to(PaymentService);
    this.container.bind<IFinancialTransactionService>(TYPES.FinancialTransactionService).to(FinancialTransactionService);
    this.container.bind<IFinancialReportService>(TYPES.FinancialReportService).to(FinancialReportService);
    this.container.bind<ITemplateService>(TYPES.TemplateService).to(TemplateService);
    this.container.bind<IUserSettingsService>(TYPES.UserSettingsService).to(UserSettingsService);
    this.container.bind<ITenantSettingsService>(TYPES.TenantSettingsService).to(TenantSettingsService);
    this.container.bind<INotificationService>(TYPES.NotificationService).to(NotificationService);
    this.container.bind<IAuditService>(TYPES.AuditService).to(AuditService);
    this.container.bind<CacheService>(TYPES.CacheService).to(CacheService);
    this.container.bind<MonitoringService>(TYPES.MonitoringService).to(MonitoringService);
    this.container.bind<ImportService>(TYPES.ImportService).to(ImportService);

    // Use Cases (apenas os implementados)
    this.container.bind<ICreateTenantUseCase>(TYPES.CreateTenantUseCase).to(CreateTenantUseCase);
    this.container.bind<IUpdateTenantUseCase>(TYPES.UpdateTenantUseCase).to(UpdateTenantUseCase);
    this.container.bind<IGetTenantUseCase>(TYPES.GetTenantUseCase).to(GetTenantUseCase);
    this.container.bind<IListTenantsUseCase>(TYPES.ListTenantsUseCase).to(ListTenantsUseCase);
    this.container.bind<ICreateUserUseCase>(TYPES.CreateUserUseCase).to(CreateUserUseCase);
    this.container.bind<IUpdateUserUseCase>(TYPES.UpdateUserUseCase).to(UpdateUserUseCase);
    this.container.bind<IAuthenticateUserUseCase>(TYPES.AuthenticateUserUseCase).to(AuthenticateUserUseCase);
    this.container.bind<IChangePasswordUseCase>(TYPES.ChangePasswordUseCase).to(ChangePasswordUseCase);
    this.container.bind<IGetUserUseCase>(TYPES.GetUserUseCase).to(GetUserUseCase);
    this.container.bind<IListUsersUseCase>(TYPES.ListUsersUseCase).to(ListUsersUseCase);
    this.container.bind<ICreateProjectUseCase>(TYPES.CreateProjectUseCase).to(CreateProjectUseCase);
    this.container.bind<IUpdateProjectUseCase>(TYPES.UpdateProjectUseCase).to(UpdateProjectUseCase);
    this.container.bind<IGetProjectUseCase>(TYPES.GetProjectUseCase).to(GetProjectUseCase);
    this.container.bind<IListProjectsUseCase>(TYPES.ListProjectsUseCase).to(ListProjectsUseCase);
    this.container.bind<IChangeProjectStatusUseCase>(TYPES.ChangeProjectStatusUseCase).to(ChangeProjectStatusUseCase);
    this.container.bind<IDeleteProjectUseCase>(TYPES.DeleteProjectUseCase).to(DeleteProjectUseCase);
    this.container.bind<ICreateTaskUseCase>(TYPES.CreateTaskUseCase).to(CreateTaskUseCase);
    this.container.bind<IUpdateTaskUseCase>(TYPES.UpdateTaskUseCase).to(UpdateTaskUseCase);
    this.container.bind<IGetTaskUseCase>(TYPES.GetTaskUseCase).to(GetTaskUseCase);
    this.container.bind<IListTasksUseCase>(TYPES.ListTasksUseCase).to(ListTasksUseCase);
    this.container.bind<IChangeTaskStatusUseCase>(TYPES.ChangeTaskStatusUseCase).to(ChangeTaskStatusUseCase);
    this.container.bind<IReassignTaskUseCase>(TYPES.ReassignTaskUseCase).to(ReassignTaskUseCase);
    this.container.bind<ILogTimeUseCase>(TYPES.LogTimeUseCase).to(LogTimeUseCase);
    this.container.bind<IDeleteTaskUseCase>(TYPES.DeleteTaskUseCase).to(DeleteTaskUseCase);
    this.container.bind<IDeleteUserUseCase>(TYPES.DeleteUserUseCase).to(DeleteUserUseCase);
    this.container.bind<ICreateClientUseCase>(TYPES.CreateClientUseCase).to(CreateClientUseCase);
    this.container.bind<IUpdateClientUseCase>(TYPES.UpdateClientUseCase).to(UpdateClientUseCase);
    this.container.bind<IGetClientUseCase>(TYPES.GetClientUseCase).to(GetClientUseCase);
    this.container.bind<IListClientsUseCase>(TYPES.ListClientsUseCase).to(ListClientsUseCase);
    this.container.bind<IDeleteClientUseCase>(TYPES.DeleteClientUseCase).to(DeleteClientUseCase);
    this.container.bind<ICreateSupplierUseCase>(TYPES.CreateSupplierUseCase).to(CreateSupplierUseCase);
    this.container.bind<IUpdateSupplierUseCase>(TYPES.UpdateSupplierUseCase).to(UpdateSupplierUseCase);
    this.container.bind<IGetSupplierUseCase>(TYPES.GetSupplierUseCase).to(GetSupplierUseCase);
    this.container.bind<IListSuppliersUseCase>(TYPES.ListSuppliersUseCase).to(ListSuppliersUseCase);
    this.container.bind<IDeleteSupplierUseCase>(TYPES.DeleteSupplierUseCase).to(DeleteSupplierUseCase);

    // Multi-tenant Services
    this.container.bind<ITenantContextService>(TYPES.TenantContextService).toConstantValue(new TenantContextService());
    this.container.bind<ITenantDataIsolationService>(TYPES.TenantDataIsolationService).toDynamicValue(() => new TenantDataIsolationService());
    this.container.bind<ITenantConfigurationService>(TYPES.TenantConfigurationService).toDynamicValue((context) => {
      const tenantRepository = context.container.get<ITenantRepository>(TYPES.TenantRepository);
      return new TenantConfigurationService(tenantRepository);
    });
    this.container.bind<ITenantMigrationService>(TYPES.TenantMigrationService).toDynamicValue((context) => {
      const databaseService = context.container.get<IDatabaseService>(TYPES.DatabaseService);
      return new TenantMigrationService(databaseService);
    });

    // Controllers
    this.container.bind<TenantController>(TYPES.TenantController).to(TenantController);
    this.container.bind<UserController>(TYPES.UserController).to(UserController);
    this.container.bind<ProjectController>(TYPES.ProjectController).to(ProjectController);
    this.container.bind<TaskController>(TYPES.TaskController).to(TaskController);
    this.container.bind<ClientController>(TYPES.ClientController).to(ClientController);
    this.container.bind<SupplierController>(TYPES.SupplierController).to(SupplierController);
    this.container.bind<ExpenseController>(TYPES.ExpenseController).to(ExpenseController);
    this.container.bind<InvoiceController>(TYPES.InvoiceController).to(InvoiceController);
    this.container.bind<PaymentController>(TYPES.PaymentController).to(PaymentController);
    this.container.bind<FinancialReportController>(TYPES.FinancialReportController).to(FinancialReportController);
    this.container.bind<TemplateController>(TYPES.TemplateController).to(TemplateController);
    this.container.bind<UserSettingsController>(TYPES.UserSettingsController).to(UserSettingsController);
    this.container.bind<TenantSettingsController>(TYPES.TenantSettingsController).to(TenantSettingsController);
    this.container.bind<ReportsController>(TYPES.ReportsController).to(ReportsController);
    this.container.bind<MonitoringController>(TYPES.MonitoringController).to(MonitoringController);
    this.container.bind<NotificationController>(TYPES.NotificationController).to(NotificationController);
    this.container.bind<ImportController>(TYPES.ImportController).to(ImportController);
  }
}

// TYPES agora está centralizado em @/shared/types
