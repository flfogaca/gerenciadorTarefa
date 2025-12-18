import { injectable, inject } from 'inversify';
import { ICreateUserUseCase, CreateUserRequest, CreateUserResponse } from '../index';
import { IUserService } from '@/core/interfaces/services';
import { UserRole } from '@/core/base';
import { TYPES } from '@/shared/types';

@injectable()
export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    @inject(TYPES.UserService) private readonly userService: IUserService
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    this.validateRequest(request);

    const user = await this.userService.create({
      email: request.email,
      password: request.password,
      firstName: request.firstName,
      lastName: request.lastName,
      role: request.role,
      tenantId: request.tenantId,
      profile: request.profile
    });

    return { user };
  }

  private validateRequest(request: CreateUserRequest): void {
    if (!request.email || request.email.trim().length === 0) {
      throw new Error('Email is required');
    }

    if (!request.password || request.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!request.firstName || request.firstName.trim().length === 0) {
      throw new Error('First name is required');
    }

    if (!request.lastName || request.lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }

    if (!request.tenantId || request.tenantId.trim().length === 0) {
      throw new Error('Tenant ID is required');
    }

    if (!Object.values(UserRole).includes(request.role)) {
      throw new Error('Invalid user role');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
      throw new Error('Invalid email format');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(request.password)) {
      throw new Error('Password must contain at least one lowercase letter, one uppercase letter, and one number');
    }
  }
}
