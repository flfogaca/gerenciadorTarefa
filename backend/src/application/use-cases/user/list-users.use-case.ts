import { injectable, inject } from 'inversify';
import { IListUsersUseCase, ListUsersRequest, ListUsersResponse } from '../index';
import { IUserService } from '@/core/interfaces/services';
import { TenantIdVO } from '@/core/entities/tenant';
import { TYPES } from '@/shared/types';

@injectable()
export class ListUsersUseCase implements IListUsersUseCase {
  constructor(
    @inject(TYPES.UserService) private readonly userService: IUserService
  ) {}

  async execute(request: ListUsersRequest): Promise<ListUsersResponse> {
    this.validateRequest(request);

    const tenantId = new TenantIdVO(request.tenantId);
    const users = await this.userService.findByTenantId(tenantId);

    let filteredUsers = users;

    if (request.filters) {
      if (request.filters.role) {
        filteredUsers = filteredUsers.filter(user => user.role === request.filters!.role);
      }

      if (request.filters.isActive !== undefined) {
        filteredUsers = filteredUsers.filter(user => user.isActive === request.filters!.isActive);
      }

      if (request.filters.search) {
        const searchTerm = request.filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.firstName.toLowerCase().includes(searchTerm) ||
          user.lastName.toLowerCase().includes(searchTerm) ||
          user.email.value.toLowerCase().includes(searchTerm)
        );
      }
    }

    const total = filteredUsers.length;
    const limit = request.limit || 10;
    const offset = request.offset || 0;
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    return {
      users: paginatedUsers,
      total
    };
  }

  private validateRequest(request: ListUsersRequest): void {
    if (!request.tenantId || request.tenantId.trim().length === 0) {
      throw new Error('Tenant ID is required');
    }

    if (request.limit !== undefined && request.limit < 1) {
      throw new Error('Limit must be greater than 0');
    }

    if (request.offset !== undefined && request.offset < 0) {
      throw new Error('Offset must be greater than or equal to 0');
    }
  }
}
