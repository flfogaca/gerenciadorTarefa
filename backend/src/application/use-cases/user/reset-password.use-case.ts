import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IUserRepository } from '@/core/interfaces/repositories';
import { PasswordVO } from '@/core/entities/tenant';
import bcrypt from 'bcryptjs';

export interface IResetPasswordUseCase {
  execute(token: string, newPassword: string): Promise<{ success: boolean; message: string }>;
}

@injectable()
export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    @inject(TYPES.UserRepository) private readonly userRepository: IUserRepository,
  ) {}

  async execute(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const users = await this.userRepository.findAll();
    const user = users.find(u => 
      u.profile?.passwordResetToken === token &&
      u.profile?.passwordResetExpires &&
      new Date(u.profile.passwordResetExpires) > new Date()
    );

    if (!user) {
      return { success: false, message: 'Token inválido ou expirado.' };
    }

    if (newPassword.length < 8) {
      return { success: false, message: 'A senha deve ter pelo menos 8 caracteres.' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const newPasswordVO = new PasswordVO(hashedPassword);
    
    const userWithNewPassword = user.changePassword(newPasswordVO);
    
    const updatedProfile = {
      ...userWithNewPassword.profile,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    };
    
    const finalUser = userWithNewPassword.updateProfile(updatedProfile);
    await this.userRepository.update(finalUser);

    return { success: true, message: 'Senha alterada com sucesso.' };
  }
}
