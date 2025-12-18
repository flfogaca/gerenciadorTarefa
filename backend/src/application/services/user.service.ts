import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IUserService, CreateUserDTO, UpdateUserDTO, AuthResult, UserStats } from '@/core/interfaces/services';
import { IUserRepository } from '@/core/interfaces/repositories';
import { User, UserProfile, UserPermission } from '@/core/entities/user';
import { TenantIdVO, UserIdVO, EmailVO, PasswordVO } from '@/core/entities/tenant';
import { UserRole } from '@/core/base';
import { ILogger } from '@/shared/logging/logger';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository) private readonly userRepository: IUserRepository,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  async create(dto: CreateUserDTO): Promise<User> {
    try {
      this.logger.info('Creating user', { email: dto.email, tenantId: dto.tenantId });

      const tenantId = new TenantIdVO(dto.tenantId);
      const email = new EmailVO(dto.email);
      
      const existingUser = await this.userRepository.findByEmailAndTenant(dto.email, tenantId);
      if (existingUser) {
        throw new Error(`User with email ${dto.email} already exists in this tenant`);
      }

      const hashedPassword = await bcrypt.hash(dto.password, 12);
      const password = new PasswordVO(hashedPassword);
      const userId = new UserIdVO(uuidv4());

      const defaultProfile: UserProfile = {
        preferences: {
          theme: 'light',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          notifications: {
            email: true,
            push: true,
            sms: false,
            types: ['all']
          }
        },
        customFields: {},
        ...dto.profile
      };

      const user = User.create(
        userId,
        tenantId,
        email,
        password,
        dto.firstName,
        dto.lastName,
        dto.role,
        defaultProfile
      );

      const savedUser = await this.userRepository.save(user);
      
      this.logger.info('User created successfully', { 
        userId: savedUser.userId.value,
        email: savedUser.email.value,
        tenantId: savedUser.tenantId.value
      });

      return savedUser;
    } catch (error) {
      this.logger.error('Failed to create user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: dto.email,
        tenantId: dto.tenantId
      });
      throw error;
    }
  }

  async update(id: string, dto: UpdateUserDTO): Promise<User> {
    try {
      this.logger.info('Updating user', { userId: id });

      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }

      let updatedUser = user;

      if (dto.firstName) {
        updatedUser = new User(
          updatedUser.id,
          updatedUser.userId,
          updatedUser.tenantId,
          updatedUser.email,
          updatedUser.password,
          dto.firstName,
          updatedUser.lastName,
          updatedUser.role,
          updatedUser.profile,
          updatedUser.permissions,
          updatedUser.createdAt,
          new Date(),
          updatedUser.isActive,
          updatedUser.lastLoginAt
        );
      }

      if (dto.lastName) {
        updatedUser = new User(
          updatedUser.id,
          updatedUser.userId,
          updatedUser.tenantId,
          updatedUser.email,
          updatedUser.password,
          updatedUser.firstName,
          dto.lastName,
          updatedUser.role,
          updatedUser.profile,
          updatedUser.permissions,
          updatedUser.createdAt,
          new Date(),
          updatedUser.isActive,
          updatedUser.lastLoginAt
        );
      }

      if (dto.role) {
        updatedUser = updatedUser.updateRole(dto.role);
      }

      if (dto.profile) {
        updatedUser = updatedUser.updateProfile(dto.profile);
      }

      const savedUser = await this.userRepository.update(updatedUser);
      
      this.logger.info('User updated successfully', { 
        userId: savedUser.userId.value
      });

      return savedUser;
    } catch (error) {
      this.logger.error('Failed to update user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: id
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.info('Deleting user', { userId: id });

      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }

      await this.userRepository.delete(id);
      
      this.logger.info('User deleted successfully', { userId: id });
    } catch (error) {
      this.logger.error('Failed to delete user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: id
      });
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await this.userRepository.findById(id);
    } catch (error) {
      this.logger.error('Failed to find user by ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: id
      });
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.findAll();
    } catch (error) {
      this.logger.error('Failed to find all users', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findByEmail(email);
    } catch (error) {
      this.logger.error('Failed to find user by email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email
      });
      throw error;
    }
  }

  async findByTenantId(tenantId: TenantIdVO): Promise<User[]> {
    try {
      return await this.userRepository.findByTenantId(tenantId);
    } catch (error) {
      this.logger.error('Failed to find users by tenant ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: tenantId.value
      });
      throw error;
    }
  }

  async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      this.logger.info('Authenticating user', { email });

      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (!user.isActive) {
        throw new Error('User account is deactivated');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password.value);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      const updatedUser = user.recordLogin();
      await this.userRepository.update(updatedUser);

      this.logger.info('User authenticated successfully', { 
        userId: user.userId.value,
        email: user.email.value,
        tenantId: user.tenantId.value
      });

      return {
        user,
        token,
        refreshToken
      };
    } catch (error) {
      this.logger.error('Authentication failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email
      });
      throw error;
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      this.logger.info('Changing password', { userId });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password.value);
      if (!isOldPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      const newPasswordVO = new PasswordVO(hashedNewPassword);
      
      const updatedUser = user.changePassword(newPasswordVO);
      await this.userRepository.update(updatedUser);

      this.logger.info('Password changed successfully', { userId });
    } catch (error) {
      this.logger.error('Failed to change password', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }

  async updateProfile(userId: string, profile: Partial<UserProfile>): Promise<User> {
    try {
      this.logger.info('Updating user profile', { userId });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const updatedUser = user.updateProfile(profile);
      const savedUser = await this.userRepository.update(updatedUser);

      this.logger.info('User profile updated successfully', { userId });

      return savedUser;
    } catch (error) {
      this.logger.error('Failed to update user profile', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }

  async updateRole(userId: string, role: UserRole): Promise<User> {
    try {
      this.logger.info('Updating user role', { userId, role });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const updatedUser = user.updateRole(role);
      const savedUser = await this.userRepository.update(updatedUser);

      this.logger.info('User role updated successfully', { userId, role });

      return savedUser;
    } catch (error) {
      this.logger.error('Failed to update user role', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        role
      });
      throw error;
    }
  }

  async addPermission(userId: string, resource: string, action: string): Promise<User> {
    try {
      this.logger.info('Adding permission to user', { userId, resource, action });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const permission: UserPermission = {
        resource,
        action,
        grantedAt: new Date(),
        grantedBy: user.userId
      };

      const updatedUser = user.addPermission(permission);
      const savedUser = await this.userRepository.update(updatedUser);

      this.logger.info('Permission added successfully', { userId, resource, action });

      return savedUser;
    } catch (error) {
      this.logger.error('Failed to add permission', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        resource,
        action
      });
      throw error;
    }
  }

  async removePermission(userId: string, resource: string, action: string): Promise<User> {
    try {
      this.logger.info('Removing permission from user', { userId, resource, action });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const updatedUser = user.removePermission(resource, action);
      const savedUser = await this.userRepository.update(updatedUser);

      this.logger.info('Permission removed successfully', { userId, resource, action });

      return savedUser;
    } catch (error) {
      this.logger.error('Failed to remove permission', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        resource,
        action
      });
      throw error;
    }
  }

  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return false;
      }

      return user.hasPermission(resource, action);
    } catch (error) {
      this.logger.error('Failed to check permission', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        resource,
        action
      });
      return false;
    }
  }

  async recordLogin(userId: string): Promise<User> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const updatedUser = user.recordLogin();
      const savedUser = await this.userRepository.update(updatedUser);

      return savedUser;
    } catch (error) {
      this.logger.error('Failed to record login', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }

  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      return {
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        totalHours: 0,
        projectsCount: 0
      };
    } catch (error) {
      this.logger.error('Failed to get user stats', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }

  private generateToken(user: User): string {
    const payload = {
      id: user.id,
      userId: user.userId.value,
      email: user.email.value,
      role: user.role,
      tenantId: user.tenantId.value,
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, process.env['JWT_SECRET'] as string, {
      expiresIn: process.env['JWT_EXPIRES_IN'] || '24h'
    } as jwt.SignOptions);
  }

  private generateRefreshToken(user: User): string {
    const payload = {
      userId: user.userId.value,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, process.env['JWT_REFRESH_SECRET'] as string, {
      expiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d'
    } as jwt.SignOptions);
  }
}
