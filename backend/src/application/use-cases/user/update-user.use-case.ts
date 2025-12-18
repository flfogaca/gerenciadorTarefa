import { injectable, inject } from 'inversify';
import { IUpdateUserUseCase, UpdateUserRequest, UpdateUserResponse } from '../index';
import { IUserService } from '@/core/interfaces/services';
import { TYPES } from '@/shared/types';

@injectable()
export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(
    @inject(TYPES.UserService) private readonly userService: IUserService
  ) {}

  async execute(request: UpdateUserRequest): Promise<UpdateUserResponse> {
    this.validateRequest(request);

    const updateData: any = {};
    if (request.firstName !== undefined) updateData.firstName = request.firstName;
    if (request.lastName !== undefined) updateData.lastName = request.lastName;
    if (request.role !== undefined) updateData.role = request.role;
    if (request.profile !== undefined) updateData.profile = request.profile;

    const user = await this.userService.update(request.userId, updateData);

    return { user };
  }

  private validateRequest(request: UpdateUserRequest): void {
    if (!request.userId || request.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }

    if (request.firstName !== undefined && request.firstName.trim().length === 0) {
      throw new Error('First name cannot be empty');
    }

    if (request.lastName !== undefined && request.lastName.trim().length === 0) {
      throw new Error('Last name cannot be empty');
    }
  }
}
