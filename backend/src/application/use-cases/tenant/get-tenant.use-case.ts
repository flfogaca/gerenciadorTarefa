import { injectable, inject } from 'inversify';
import { IGetTenantUseCase, GetTenantRequest, GetTenantResponse } from '../index';
import { ITenantService } from '@/core/interfaces/services';
import { TenantIdVO } from '@/core/entities/tenant';
import { TYPES } from '@/shared/types';

@injectable()
export class GetTenantUseCase implements IGetTenantUseCase {
  constructor(
    @inject(TYPES.TenantService) private readonly tenantService: ITenantService
  ) {}

  async execute(request: GetTenantRequest): Promise<GetTenantResponse> {
    this.validateRequest(request);

    const tenantId = new TenantIdVO(request.tenantId);
    const tenant = await this.tenantService.findByTenantId(tenantId);

    if (!tenant) {
      throw new Error(`Tenant with ID ${request.tenantId} not found`);
    }

    return { tenant };
  }

  private validateRequest(request: GetTenantRequest): void {
    if (!request.tenantId || request.tenantId.trim().length === 0) {
      throw new Error('Tenant ID is required');
    }
  }
}


