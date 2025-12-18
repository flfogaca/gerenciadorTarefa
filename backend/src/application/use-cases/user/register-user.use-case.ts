import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IUserRepository, ITenantRepository } from '@/core/interfaces/repositories';
import { User } from '@/core/entities/user';
import { EmailVO, PasswordVO, TenantIdVO, UserIdVO } from '@/core/entities/tenant';
import { UserRole } from '@/core/base';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface RegisterUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  tenantId?: string;
}

export interface RegisterUserOutput {
  success: boolean;
  message: string;
  userId?: string;
}

export interface IRegisterUserUseCase {
  execute(input: RegisterUserInput): Promise<RegisterUserOutput>;
}

@injectable()
export class RegisterUserUseCase implements IRegisterUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private readonly userRepository: IUserRepository,
    @inject(TYPES.TenantRepository) private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const tenant = input.tenantId 
      ? await this.tenantRepository.findByTenantId(new TenantIdVO(input.tenantId))
      : await this.getDefaultTenant();

    if (!tenant) {
      return { success: false, message: 'Tenant não encontrado.' };
    }

    const settings = tenant.settings as any || {};
    if (!settings.allowUserRegistration) {
      return { success: false, message: 'Registro de usuários está desabilitado.' };
    }

    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      return { success: false, message: 'Email já está em uso.' };
    }

    const passwordValidation = this.validatePassword(input.password, settings.passwordPolicy);
    if (!passwordValidation.isValid) {
      return { success: false, message: passwordValidation.message };
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const userId = new UserIdVO(uuidv4());
    const user = User.create(
      userId,
      tenant.tenantId,
      new EmailVO(input.email),
      PasswordVO.fromHashed(hashedPassword),
      input.firstName,
      input.lastName,
      UserRole.EMPLOYEE,
      {
        preferences: {
          theme: 'light',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          notifications: {
            email: true,
            push: true,
            sms: false,
            types: []
          }
        },
        customFields: {}
      }
    );

    await this.userRepository.save(user);

    return {
      success: true,
      message: settings.requireEmailVerification
        ? 'Conta criada. Verifique seu email para ativar.'
        : 'Conta criada com sucesso.',
      userId: userId.value,
    };
  }

  private async getDefaultTenant() {
    const tenants = await this.tenantRepository.findAll();
    return tenants.find(t => {
      const name = t.name;
      const nameValue = typeof name === 'string' ? name : (name as any)?.value;
      return nameValue === 'Default';
    }) || tenants[0];
  }

  private validatePassword(password: string, policy: any = {}) {
    const minLength = policy.minLength || 8;
    const requireUppercase = policy.requireUppercase !== false;
    const requireNumbers = policy.requireNumbers !== false;
    const requireSpecialChars = policy.requireSpecialChars !== false;

    if (password.length < minLength) {
      return { isValid: false, message: `A senha deve ter pelo menos ${minLength} caracteres.` };
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      return { isValid: false, message: 'A senha deve conter pelo menos uma letra maiúscula.' };
    }

    if (requireNumbers && !/\d/.test(password)) {
      return { isValid: false, message: 'A senha deve conter pelo menos um número.' };
    }

    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isValid: false, message: 'A senha deve conter pelo menos um caractere especial.' };
    }

    return { isValid: true, message: '' };
  }
}
