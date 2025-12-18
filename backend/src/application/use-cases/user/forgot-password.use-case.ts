import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IUserRepository } from '@/core/interfaces/repositories';
import crypto from 'crypto';
import { EmailService } from '@/application/services/email.service';

export interface IForgotPasswordUseCase {
  execute(email: string, tenantId: string): Promise<{ success: boolean; message: string }>;
}

@injectable()
export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  private emailService: EmailService;

  constructor(
    @inject(TYPES.UserRepository) private readonly userRepository: IUserRepository,
  ) {
    this.emailService = new EmailService();
  }

  async execute(email: string, _tenantId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      return { 
        success: true, 
        message: 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.' 
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    const updatedProfile = {
      ...user.profile,
      passwordResetToken: resetToken,
      passwordResetExpires: resetTokenExpiry,
    };

    const updatedUser = user.updateProfile(updatedProfile);
    await this.userRepository.update(updatedUser);

    try {
      await this.emailService.sendPasswordResetEmail(
        user.email.value,
        resetToken,
        user.firstName
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }

    return { 
      success: true, 
      message: 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.' 
    };
  }
}
