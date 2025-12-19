import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IUserRepository } from '@/core/interfaces/repositories';
import { TwoFactorService, TwoFactorSetupData } from '@/application/services/two-factor.service';

export interface ISetup2FAUseCase {
  execute(userId: string): Promise<TwoFactorSetupData | { error: string }>;
}

@injectable()
export class Setup2FAUseCase implements ISetup2FAUseCase {
  private twoFactorService: TwoFactorService;

  constructor(
    @inject(TYPES.UserRepository) private readonly userRepository: IUserRepository,
  ) {
    this.twoFactorService = new TwoFactorService();
  }

  async execute(userId: string): Promise<TwoFactorSetupData | { error: string }> {
    if (!this.twoFactorService.isEnabled()) {
      return { error: 'Autenticação de dois fatores está desabilitada no sistema.' };
    }

    const user = await this.userRepository.findByUserId({ value: userId } as any);
    
    if (!user) {
      return { error: 'Usuário não encontrado.' };
    }

    const { secret, otpAuthUrl } = this.twoFactorService.generateSecret();
    const backupCodes = this.twoFactorService.generateBackupCodes();
    const qrCodeUrl = this.twoFactorService.generateQRCodeUrl(secret, user.email.value);

    const updatedProfile = {
      ...user.profile,
      twoFactorSecret: secret,
      twoFactorBackupCodes: backupCodes,
      twoFactorPending: true,
    };

    const updatedUser = user.updateProfile(updatedProfile);
    await this.userRepository.update(updatedUser);

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    };
  }
}





