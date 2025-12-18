import { injectable, inject } from 'inversify';
import { IGetUserUseCase, GetUserRequest, GetUserResponse } from '../index';
import { IUserService } from '@/core/interfaces/services';
import { TYPES } from '@/shared/types';

@injectable()
export class GetUserUseCase implements IGetUserUseCase {
  constructor(
    @inject(TYPES.UserService) private readonly userService: IUserService
  ) {}

  async execute(request: GetUserRequest): Promise<GetUserResponse> {
    this.validateRequest(request);

    const user = await this.userService.findById(request.userId);
    if (!user) {
      throw new Error(`User with ID ${request.userId} not found`);
    }

    return { user };
  }

  private validateRequest(request: GetUserRequest): void {
    if (!request.userId || request.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
  }
}
