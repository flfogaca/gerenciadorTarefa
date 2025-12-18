import { injectable, inject } from 'inversify';
import { IListTenantsUseCase, ListTenantsRequest, ListTenantsResponse } from '../index';
import { ITenantService } from '@/core/interfaces/services';
import { TYPES } from '@/shared/types';

@injectable()
export class ListTenantsUseCase implements IListTenantsUseCase {
  constructor(
    @inject(TYPES.TenantService) private readonly tenantService: ITenantService
  ) {}

  async execute(request: ListTenantsRequest): Promise<ListTenantsResponse> {
    this.validateRequest(request);

    const tenants = await this.tenantService.findAll();

    let filteredTenants = tenants;

    if (request.filters) {
      if (request.filters.isActive !== undefined) {
        filteredTenants = filteredTenants.filter(tenant => tenant.isActive === request.filters!.isActive);
      }

      if (request.filters.domain) {
        const domainTerm = request.filters.domain.toLowerCase();
        filteredTenants = filteredTenants.filter(tenant => tenant.domain.toLowerCase().includes(domainTerm));
      }
    }

    const total = filteredTenants.length;
    const limit = request.limit ?? 10;
    const offset = request.offset ?? 0;
    const paginatedTenants = filteredTenants.slice(offset, offset + limit);

    return {
      tenants: paginatedTenants,
      total
    };
  }

  private validateRequest(request: ListTenantsRequest): void {
    if (request.limit !== undefined) {
      if (!Number.isInteger(request.limit) || request.limit < 1) {
        throw new Error('Limit must be an integer greater than 0');
      }
    }

    if (request.offset !== undefined) {
      if (!Number.isInteger(request.offset) || request.offset < 0) {
        throw new Error('Offset must be an integer greater than or equal to 0');
      }
    }

    if (request.filters?.domain !== undefined && request.filters.domain.trim().length === 0) {
      throw new Error('Domain filter cannot be empty');
    }
  }
}


