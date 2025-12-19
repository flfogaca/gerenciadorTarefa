import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IUserRepository } from '@/core/interfaces/repositories';
import { TwoFactorService } from '@/application/services/two-factor.service';

export interface IDisable2FAUseCase {
  execute(userId: string, token: string): Promise<{ success: boolean; message: string }>;
}

@injectable()
export class Disable2FAUseCase implements IDisable2FAUseCase {
  private twoFactorService: TwoFactorService;

  constructor(
    @inject(TYPES.UserRepository) private readonly userRepository: IUserRepository,
  ) {
    this.twoFactorService = new TwoFactorService();
  }

  async execute(userId: string, token: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findByUserId({ value: userId } as any);
    
    if (!user) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    const secret = user.profile?.twoFactorSecret;

    if (!secret || !user.profile?.twoFactorEnabled) {
      return { success: false, message: '2FA não está habilitado para este usuário.' };
    }

    const isValidToken = this.twoFactorService.verifyToken(secret, token);

    if (!isValidToken) {
      return { success: false, message: 'Código inválido.' };
    }

    const updatedProfile = {
      ...user.profile,
      twoFactorSecret: undefined,
      twoFactorBackupCodes: undefined,
      twoFactorEnabled: false,
      twoFactorPending: false,
    };
    
    const updatedUser = user.updateProfile(updatedProfile);
    await this.userRepository.update(updatedUser);

    return { success: true, message: '2FA desabilitado com sucesso.' };
  }
}





