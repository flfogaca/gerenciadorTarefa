import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IUnitOfWork } from '@/core/interfaces/repositories';

@injectable()
export class PrismaUnitOfWork implements IUnitOfWork {
  public tenantRepository: any;
  public userRepository: any;
  public projectRepository: any;
  public taskRepository: any;
  public clientRepository: any;
  public supplierRepository: any;
  public expenseRepository: any;
  public invoiceRepository: any;
  public paymentRepository: any;
  public financialTransactionRepository: any;
  public templateRepository: any;
  public userSettingsRepository: any;
  public tenantSettingsRepository: any;

  private transaction: any = null;

  constructor(
    @inject(TYPES.PrismaClient) private readonly prisma: PrismaClient,
    @inject(TYPES.TenantRepository) tenantRepository: any,
    @inject(TYPES.UserRepository) userRepository: any,
    @inject(TYPES.ProjectRepository) projectRepository: any,
    @inject(TYPES.TaskRepository) taskRepository: any,
    @inject(TYPES.ClientRepository) clientRepository: any,
    @inject(TYPES.SupplierRepository) supplierRepository: any,
    @inject(TYPES.ExpenseRepository) expenseRepository: any,
    @inject(TYPES.InvoiceRepository) invoiceRepository: any,
    @inject(TYPES.PaymentRepository) paymentRepository: any,
    @inject(TYPES.FinancialTransactionRepository) financialTransactionRepository: any,
    @inject(TYPES.TemplateRepository) templateRepository: any,
    @inject(TYPES.UserSettingsRepository) userSettingsRepository: any,
    @inject(TYPES.TenantSettingsRepository) tenantSettingsRepository: any
  ) {
    this.tenantRepository = tenantRepository;
    this.userRepository = userRepository;
    this.projectRepository = projectRepository;
    this.taskRepository = taskRepository;
    this.clientRepository = clientRepository;
    this.supplierRepository = supplierRepository;
    this.expenseRepository = expenseRepository;
    this.invoiceRepository = invoiceRepository;
    this.paymentRepository = paymentRepository;
    this.financialTransactionRepository = financialTransactionRepository;
    this.templateRepository = templateRepository;
    this.userSettingsRepository = userSettingsRepository;
    this.tenantSettingsRepository = tenantSettingsRepository;
  }

  async begin(): Promise<void> {
    if (this.transaction) {
      throw new Error('Transaction already started');
    }

    this.transaction = await this.prisma.$transaction(async (tx) => {
      // Criar novos repositórios com a transação
      this.tenantRepository = new (this.tenantRepository.constructor)(tx);
      this.userRepository = new (this.userRepository.constructor)(tx);
      this.projectRepository = new (this.projectRepository.constructor)(tx);
      this.taskRepository = new (this.taskRepository.constructor)(tx);
    });
  }

  async commit(): Promise<void> {
    if (!this.transaction) {
      throw new Error('No active transaction');
    }

    await this.transaction;
    this.transaction = null;
  }

  async rollback(): Promise<void> {
    if (!this.transaction) {
      throw new Error('No active transaction');
    }

    // Em Prisma, não há rollback explícito dentro de uma transação
    // A transação será automaticamente revertida se houver erro
    this.transaction = null;
  }

  async saveChanges(): Promise<void> {
    if (this.transaction) {
      await this.commit();
    }
  }

  async executeInTransaction<T>(operation: () => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      // Criar repositórios com a transação
      const tenantRepo = new (this.tenantRepository.constructor)(tx);
      const userRepo = new (this.userRepository.constructor)(tx);
      const projectRepo = new (this.projectRepository.constructor)(tx);
      const taskRepo = new (this.taskRepository.constructor)(tx);

      // Temporariamente substituir os repositórios
      const originalTenantRepo = this.tenantRepository;
      const originalUserRepo = this.userRepository;
      const originalProjectRepo = this.projectRepository;
      const originalTaskRepo = this.taskRepository;

      this.tenantRepository = tenantRepo;
      this.userRepository = userRepo;
      this.projectRepository = projectRepo;
      this.taskRepository = taskRepo;

      try {
        const result = await operation();
        return result;
      } finally {
        // Restaurar repositórios originais
        this.tenantRepository = originalTenantRepo;
        this.userRepository = originalUserRepo;
        this.projectRepository = originalProjectRepo;
        this.taskRepository = originalTaskRepo;
      }
    });
  }
}
