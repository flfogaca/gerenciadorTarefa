import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { ITenantService, CreateTenantDTO, UpdateTenantDTO, TenantStats } from '@/core/interfaces/services';
import { ITenantRepository, IUserRepository, IProjectRepository, ITaskRepository } from '@/core/interfaces/repositories';
import { Tenant, TenantIdVO } from '@/core/entities/tenant';
import { ILogger } from '@/shared/logging/logger';
import { ProjectStatus, TaskStatus } from '@/core/base';

@injectable()
export class TenantService implements ITenantService {
  constructor(
    @inject(TYPES.TenantRepository) private readonly tenantRepository: ITenantRepository,
    @inject(TYPES.UserRepository) private readonly userRepository: IUserRepository,
    @inject(TYPES.ProjectRepository) private readonly projectRepository: IProjectRepository,
    @inject(TYPES.TaskRepository) private readonly taskRepository: ITaskRepository,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  async create(dto: CreateTenantDTO): Promise<Tenant> {
    try {
      this.logger.info('Creating tenant', { tenantId: dto.tenantId, name: dto.name });

      const tenantId = new TenantIdVO(dto.tenantId);
      
      // Verificar se já existe
      const existingTenant = await this.tenantRepository.findByTenantId(tenantId);
      if (existingTenant) {
        throw new Error(`Tenant with ID ${dto.tenantId} already exists`);
      }

      // Verificar domínio
      const existingDomain = await this.tenantRepository.findByDomain(dto.domain);
      if (existingDomain) {
        throw new Error(`Domain ${dto.domain} is already in use`);
      }

      const tenant = Tenant.create(
        tenantId,
        dto.name,
        dto.domain,
        dto.settings
      );

      const savedTenant = await this.tenantRepository.save(tenant);
      
      this.logger.info('Tenant created successfully', { 
        tenantId: savedTenant.tenantId.value,
        name: savedTenant.name 
      });

      return savedTenant;
    } catch (error) {
      this.logger.error('Failed to create tenant', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: dto.tenantId
      });
      throw error;
    }
  }

  async update(id: string, dto: UpdateTenantDTO): Promise<Tenant> {
    try {
      this.logger.info('Updating tenant', { tenantId: id });

      const tenant = await this.tenantRepository.findById(id);
      if (!tenant) {
        throw new Error(`Tenant with ID ${id} not found`);
      }

      let updatedTenant = tenant;

      if (dto.name) {
        updatedTenant = new Tenant(
          updatedTenant.id,
          updatedTenant.tenantId,
          dto.name,
          updatedTenant.domain,
          updatedTenant.settings,
          updatedTenant.createdAt,
          new Date(),
          updatedTenant.isActive
        );
      }

      if (dto.domain) {
        // Verificar se o novo domínio já existe
        const existingDomain = await this.tenantRepository.findByDomain(dto.domain);
        if (existingDomain && existingDomain.id !== id) {
          throw new Error(`Domain ${dto.domain} is already in use`);
        }
        updatedTenant = new Tenant(
          updatedTenant.id,
          updatedTenant.tenantId,
          updatedTenant.name,
          dto.domain,
          updatedTenant.settings,
          updatedTenant.createdAt,
          new Date(),
          updatedTenant.isActive
        );
      }

      if (dto.settings) {
        updatedTenant = updatedTenant.updateSettings(dto.settings);
      }

      const savedTenant = await this.tenantRepository.update(updatedTenant);
      
      this.logger.info('Tenant updated successfully', { 
        tenantId: savedTenant.tenantId.value 
      });

      return savedTenant;
    } catch (error) {
      this.logger.error('Failed to update tenant', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: id
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.info('Deleting tenant', { tenantId: id });

      const tenant = await this.tenantRepository.findById(id);
      if (!tenant) {
        throw new Error(`Tenant with ID ${id} not found`);
      }

      await this.tenantRepository.delete(id);
      
      this.logger.info('Tenant deleted successfully', { tenantId: id });
    } catch (error) {
      this.logger.error('Failed to delete tenant', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: id
      });
      throw error;
    }
  }

  async findById(id: string): Promise<Tenant | null> {
    try {
      return await this.tenantRepository.findById(id);
    } catch (error) {
      this.logger.error('Failed to find tenant by ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: id
      });
      throw error;
    }
  }

  async findAll(): Promise<Tenant[]> {
    try {
      return await this.tenantRepository.findAll();
    } catch (error) {
      this.logger.error('Failed to find all tenants', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async findByTenantId(tenantId: TenantIdVO): Promise<Tenant | null> {
    try {
      return await this.tenantRepository.findByTenantId(tenantId);
    } catch (error) {
      this.logger.error('Failed to find tenant by tenant ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: tenantId.value
      });
      throw error;
    }
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    try {
      return await this.tenantRepository.findByDomain(domain);
    } catch (error) {
      this.logger.error('Failed to find tenant by domain', {
        error: error instanceof Error ? error.message : 'Unknown error',
        domain
      });
      throw error;
    }
  }

  async activateTenant(tenantId: TenantIdVO): Promise<Tenant> {
    try {
      this.logger.info('Activating tenant', { tenantId: tenantId.value });

      const tenant = await this.tenantRepository.findByTenantId(tenantId);
      if (!tenant) {
        throw new Error(`Tenant with ID ${tenantId.value} not found`);
      }

      const activatedTenant = new Tenant(
        tenant.id,
        tenant.tenantId,
        tenant.name,
        tenant.domain,
        tenant.settings,
        tenant.createdAt,
        new Date(),
        true
      );
      const savedTenant = await this.tenantRepository.update(activatedTenant);
      
      this.logger.info('Tenant activated successfully', { 
        tenantId: savedTenant.tenantId.value 
      });

      return savedTenant;
    } catch (error) {
      this.logger.error('Failed to activate tenant', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: tenantId.value
      });
      throw error;
    }
  }

  async deactivateTenant(tenantId: TenantIdVO): Promise<Tenant> {
    try {
      this.logger.info('Deactivating tenant', { tenantId: tenantId.value });

      const tenant = await this.tenantRepository.findByTenantId(tenantId);
      if (!tenant) {
        throw new Error(`Tenant with ID ${tenantId.value} not found`);
      }

      const deactivatedTenant = tenant.deactivate();
      const savedTenant = await this.tenantRepository.update(deactivatedTenant);
      
      this.logger.info('Tenant deactivated successfully', { 
        tenantId: savedTenant.tenantId.value 
      });

      return savedTenant;
    } catch (error) {
      this.logger.error('Failed to deactivate tenant', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: tenantId.value
      });
      throw error;
    }
  }

  async updateSettings(tenantId: TenantIdVO, settings: Partial<any>): Promise<Tenant> {
    try {
      this.logger.info('Updating tenant settings', { tenantId: tenantId.value });

      const tenant = await this.tenantRepository.findByTenantId(tenantId);
      if (!tenant) {
        throw new Error(`Tenant with ID ${tenantId.value} not found`);
      }

      const updatedTenant = tenant.updateSettings(settings);
      const savedTenant = await this.tenantRepository.update(updatedTenant);
      
      this.logger.info('Tenant settings updated successfully', { 
        tenantId: savedTenant.tenantId.value 
      });

      return savedTenant;
    } catch (error) {
      this.logger.error('Failed to update tenant settings', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: tenantId.value
      });
      throw error;
    }
  }

  async getTenantStats(tenantId: TenantIdVO): Promise<TenantStats> {
    try {
      const tenant = await this.tenantRepository.findByTenantId(tenantId);
      if (!tenant) {
        throw new Error(`Tenant with ID ${tenantId.value} not found`);
      }

      const [users, projects, tasks] = await Promise.all([
        this.userRepository.findByTenantId(tenantId),
        this.projectRepository.findByTenantId(tenantId),
        this.taskRepository.findByTenantId(tenantId)
      ]);

      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.isActive).length;

      const totalProjects = projects.length;
      const activeProjects = projects.filter(project => project.status === ProjectStatus.ACTIVE).length;

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === TaskStatus.DONE).length;

      return {
        totalUsers,
        activeUsers,
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks
      };
    } catch (error) {
      this.logger.error('Failed to get tenant stats', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: tenantId.value
      });
      throw error;
    }
  }
}
