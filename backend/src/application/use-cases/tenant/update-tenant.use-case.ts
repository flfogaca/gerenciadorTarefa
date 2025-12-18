import { injectable, inject } from 'inversify';
import { IUpdateTenantUseCase, UpdateTenantRequest, UpdateTenantResponse } from '../index';
import { ITenantService } from '@/core/interfaces/services';
import { TenantIdVO } from '@/core/entities/tenant';
import { TYPES } from '@/shared/types';

@injectable()
export class UpdateTenantUseCase implements IUpdateTenantUseCase {
  constructor(
    @inject(TYPES.TenantService) private readonly tenantService: ITenantService
  ) {}

  async execute(request: UpdateTenantRequest): Promise<UpdateTenantResponse> {
    this.validateRequest(request);

    const tenantId = new TenantIdVO(request.tenantId);
    const tenant = await this.tenantService.findByTenantId(tenantId);

    if (!tenant) {
      throw new Error(`Tenant with ID ${request.tenantId} not found`);
    }

    const updatePayload: any = {};

    if (request.name !== undefined) {
      updatePayload.name = request.name;
    }

    if (request.domain !== undefined) {
      updatePayload.domain = request.domain;
    }

    if (request.settings !== undefined) {
      updatePayload.settings = request.settings;
    }

    const updatedTenant = await this.tenantService.update(tenant.id, updatePayload);

    return { tenant: updatedTenant };
  }

  private validateRequest(request: UpdateTenantRequest): void {
    if (!request.tenantId || request.tenantId.trim().length === 0) {
      throw new Error('Tenant ID is required');
    }

    const hasUpdatableField =
      request.name !== undefined ||
      request.domain !== undefined ||
      request.settings !== undefined;

    if (!hasUpdatableField) {
      throw new Error('At least one field must be provided to update');
    }
  }
}


