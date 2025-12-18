import { injectable, inject } from 'inversify';
import { IDeleteUserUseCase, DeleteUserRequest, DeleteUserResponse } from '../index';
import { IUserService } from '@/core/interfaces/services';
import { TYPES } from '@/shared/types';
import { Logger } from '@/shared/logging/logger';

@injectable()
export class DeleteUserUseCase implements IDeleteUserUseCase {
  constructor(
    @inject(TYPES.UserService) private readonly userService: IUserService,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  async execute(request: DeleteUserRequest): Promise<DeleteUserResponse> {
    this.validateRequest(request);

    const user = await this.userService.findById(request.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    await this.userService.delete(request.userId);

    this.logger.info('User deleted', {
      userId: request.userId
    });

    return { 
      success: true,
      userId: request.userId
    };
  }

  private validateRequest(request: DeleteUserRequest): void {
    if (!request.userId || request.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
  }
}

