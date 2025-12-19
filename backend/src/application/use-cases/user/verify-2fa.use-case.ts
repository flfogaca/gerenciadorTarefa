import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IUserRepository } from '@/core/interfaces/repositories';
import { TwoFactorService } from '@/application/services/two-factor.service';

export interface IVerify2FAUseCase {
  execute(userId: string, token: string, isSetup?: boolean): Promise<{ success: boolean; message: string }>;
}

@injectable()
export class Verify2FAUseCase implements IVerify2FAUseCase {
  private twoFactorService: TwoFactorService;

  constructor(
    @inject(TYPES.UserRepository) private readonly userRepository: IUserRepository,
  ) {
    this.twoFactorService = new TwoFactorService();
  }

  async execute(userId: string, token: string, isSetup: boolean = false): Promise<{ success: boolean; message: string }> {
    if (!this.twoFactorService.isEnabled()) {
      return { success: false, message: 'Autenticação de dois fatores está desabilitada no sistema.' };
    }

    const user = await this.userRepository.findByUserId({ value: userId } as any);
    
    if (!user) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    const secret = user.profile?.twoFactorSecret;
    const backupCodes = user.profile?.twoFactorBackupCodes || [];

    if (!secret) {
      return { success: false, message: '2FA não está configurado para este usuário.' };
    }

    const isValidToken = this.twoFactorService.verifyToken(secret, token);

    if (isValidToken) {
      if (isSetup && user.profile?.twoFactorPending) {
        const updatedProfile = {
          ...user.profile,
          twoFactorEnabled: true,
          twoFactorPending: false,
        };
        const updatedUser = user.updateProfile(updatedProfile);
        await this.userRepository.update(updatedUser);
      }
      
      return { success: true, message: 'Código verificado com sucesso.' };
    }

    const backupCodeIndex = backupCodes.indexOf(token.toUpperCase().replace(/-/g, ''));
    if (backupCodeIndex !== -1) {
      const newBackupCodes = [...backupCodes];
      newBackupCodes.splice(backupCodeIndex, 1);
      
      const updatedProfile = {
        ...user.profile,
        twoFactorBackupCodes: newBackupCodes,
        twoFactorEnabled: isSetup ? true : user.profile?.twoFactorEnabled,
        twoFactorPending: false,
      };
      const updatedUser = user.updateProfile(updatedProfile);
      await this.userRepository.update(updatedUser);
      
      return { success: true, message: 'Código de backup utilizado. Restam ' + newBackupCodes.length + ' códigos.' };
    }

    return { success: false, message: 'Código inválido.' };
  }
}





