import { injectable, inject } from 'inversify';
import { ICreateTenantUseCase, CreateTenantRequest, CreateTenantResponse } from '../index';
import { ITenantService } from '@/core/interfaces/services';
import { IUserService } from '@/core/interfaces/services';
import { TenantIdVO } from '@/core/entities/tenant';
import { UserRole } from '@/core/base';
import { TYPES } from '@/shared/types';

@injectable()
export class CreateTenantUseCase implements ICreateTenantUseCase {
  constructor(
    @inject(TYPES.TenantService) private readonly tenantService: ITenantService,
    @inject(TYPES.UserService) private readonly userService: IUserService
  ) {}

  async execute(request: CreateTenantRequest): Promise<CreateTenantResponse> {
    // Validação de entrada
    this.validateRequest(request);

    // Criar TenantId
    const tenantId = new TenantIdVO(request.tenantId);

    // Verificar se o tenant já existe
    const existingTenant = await this.tenantService.findByTenantId(tenantId);
    if (existingTenant) {
      throw new Error(`Tenant with ID ${request.tenantId} already exists`);
    }

    // Verificar se o domínio já existe
    const existingDomain = await this.tenantService.findByDomain(request.domain);
    if (existingDomain) {
      throw new Error(`Domain ${request.domain} is already in use`);
    }

    // Criar configurações padrão do tenant
    const tenantSettings = {
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      currency: 'BRL',
      dateFormat: 'DD/MM/YYYY',
      maxUsers: 100,
      features: ['tasks', 'projects', 'reports'],
      customFields: request.settings || {}
    };

    // Criar o tenant
    const tenant = await this.tenantService.create({
      tenantId: request.tenantId,
      name: request.name,
      domain: request.domain,
      settings: tenantSettings
    });

    // Criar usuário administrador
    const adminUser = await this.userService.create({
      email: request.adminEmail,
      password: request.adminPassword,
      firstName: request.adminFirstName,
      lastName: request.adminLastName,
      role: UserRole.TENANT_ADMIN,
      tenantId: request.tenantId,
      profile: {
        preferences: {
          theme: 'light',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          notifications: {
            email: true,
            push: true,
            sms: false,
            types: ['all']
          }
        },
        customFields: {}
      }
    });

    return {
      tenant,
      adminUser
    };
  }

  private validateRequest(request: CreateTenantRequest): void {
    if (!request.tenantId || request.tenantId.trim().length === 0) {
      throw new Error('Tenant ID is required');
    }

    if (!request.name || request.name.trim().length === 0) {
      throw new Error('Tenant name is required');
    }

    if (!request.domain || request.domain.trim().length === 0) {
      throw new Error('Tenant domain is required');
    }

    if (!request.adminEmail || request.adminEmail.trim().length === 0) {
      throw new Error('Admin email is required');
    }

    if (!request.adminPassword || request.adminPassword.length < 8) {
      throw new Error('Admin password must be at least 8 characters long');
    }

    if (!request.adminFirstName || request.adminFirstName.trim().length === 0) {
      throw new Error('Admin first name is required');
    }

    if (!request.adminLastName || request.adminLastName.trim().length === 0) {
      throw new Error('Admin last name is required');
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.adminEmail)) {
      throw new Error('Invalid admin email format');
    }

    // Validar formato do domínio
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(request.domain)) {
      throw new Error('Invalid domain format');
    }
  }
}
