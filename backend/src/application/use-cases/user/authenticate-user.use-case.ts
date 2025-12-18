import { injectable, inject } from 'inversify';
import { IAuthenticateUserUseCase, AuthenticateUserRequest, AuthenticateUserResponse } from '../index';
import { IUserService } from '@/core/interfaces/services';
import { TenantIdVO } from '@/core/entities/tenant';
import { TYPES } from '@/shared/types';

@injectable()
export class AuthenticateUserUseCase implements IAuthenticateUserUseCase {
  constructor(
    @inject(TYPES.UserService) private readonly userService: IUserService
  ) {}

  async execute(request: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    this.validateRequest(request);

    let tenantId: TenantIdVO | undefined;
    if (request.tenantId) {
      tenantId = new TenantIdVO(request.tenantId);
    }

    const authResult = await this.userService.authenticate(request.email, request.password);

    if (tenantId && !authResult.user.canAccessTenant(tenantId)) {
      throw new Error('User does not have access to this tenant');
    }

    return {
      user: authResult.user,
      token: authResult.token,
      refreshToken: authResult.refreshToken
    };
  }

  private validateRequest(request: AuthenticateUserRequest): void {
    if (!request.email || request.email.trim().length === 0) {
      throw new Error('Email is required');
    }

    if (!request.password || request.password.length === 0) {
      throw new Error('Password is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
      throw new Error('Invalid email format');
    }
  }
}
