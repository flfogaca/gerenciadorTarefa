import { injectable, inject } from 'inversify';
import { IChangePasswordUseCase, ChangePasswordRequest, ChangePasswordResponse } from '../index';
import { IUserService } from '@/core/interfaces/services';
import { TYPES } from '@/shared/types';

@injectable()
export class ChangePasswordUseCase implements IChangePasswordUseCase {
  constructor(
    @inject(TYPES.UserService) private readonly userService: IUserService
  ) {}

  async execute(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    this.validateRequest(request);

    await this.userService.changePassword(
      request.userId,
      request.oldPassword,
      request.newPassword
    );

    return { success: true };
  }

  private validateRequest(request: ChangePasswordRequest): void {
    if (!request.userId || request.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    if (!request.oldPassword || request.oldPassword.length === 0) {
      throw new Error('Current password is required');
    }

    if (!request.newPassword || request.newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(request.newPassword)) {
      throw new Error('New password must contain at least one lowercase letter, one uppercase letter, and one number');
    }

    if (request.oldPassword === request.newPassword) {
      throw new Error('New password must be different from current password');
    }
  }
}
