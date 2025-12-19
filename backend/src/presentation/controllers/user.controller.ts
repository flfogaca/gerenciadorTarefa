import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { 
  ICreateUserUseCase, 
  IUpdateUserUseCase, 
  IAuthenticateUserUseCase,
  IChangePasswordUseCase,
  IGetUserUseCase,
  IListUsersUseCase,
  IDeleteUserUseCase,
  CreateUserResponse,
  UpdateUserResponse,
  AuthenticateUserResponse,
  ChangePasswordResponse,
  GetUserResponse,
  ListUsersResponse,
  DeleteUserResponse
} from '@/application/use-cases';
import { TYPES } from '@/shared/types';
import { RequirePermission } from '@/core/permissions/permission-system';
import { RequireTenant } from '@/core/multi-tenant/tenant-context';
import { ValidationService } from '@/shared/validation/validation.service';
import { Logger } from '@/shared/logging/logger';
import Joi from 'joi';

@injectable()
export class UserController {
  private readonly createUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    role: Joi.string().valid('SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'EMPLOYEE', 'CLIENT').required(),
    tenantId: Joi.string().required(),
    profile: Joi.object().optional()
  });

  private readonly updateUserSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    role: Joi.string().valid('SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'EMPLOYEE', 'CLIENT').optional(),
    profile: Joi.object().optional()
  });

  private readonly authenticateSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    tenantId: Joi.string().optional()
  });

  private readonly changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
  });

  constructor(
    @inject(TYPES.CreateUserUseCase) private readonly createUserUseCase: ICreateUserUseCase,
    @inject(TYPES.UpdateUserUseCase) private readonly updateUserUseCase: IUpdateUserUseCase,
    @inject(TYPES.AuthenticateUserUseCase) private readonly authenticateUserUseCase: IAuthenticateUserUseCase,
    @inject(TYPES.ChangePasswordUseCase) private readonly changePasswordUseCase: IChangePasswordUseCase,
    @inject(TYPES.GetUserUseCase) private readonly getUserUseCase: IGetUserUseCase,
    @inject(TYPES.ListUsersUseCase) private readonly listUsersUseCase: IListUsersUseCase,
    @inject(TYPES.DeleteUserUseCase) private readonly deleteUserUseCase: IDeleteUserUseCase,
    @inject(TYPES.ValidationService) private readonly validationService: ValidationService,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  @RequirePermission('users', 'create')
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = await this.validationService.validate(this.createUserSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const result: CreateUserResponse = await this.createUserUseCase.execute(req.body);

      this.logger.info('User created successfully', {
        userId: result.user.userId.value,
        email: result.user.email.value,
        tenantId: result.user.tenantId.value,
        requestId: req.headers['x-request-id']
      });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            userId: result.user.userId.value,
            email: result.user.email.value,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            role: result.user.role,
            tenantId: result.user.tenantId.value,
            isActive: result.user.isActive,
            createdAt: result.user.createdAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to create user', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create user'
      });
    }
  }

  async authenticateUser(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = await this.validationService.validate(this.authenticateSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const result: AuthenticateUserResponse = await this.authenticateUserUseCase.execute(req.body);

      this.logger.info('User authenticated successfully', {
        userId: result.user.userId.value,
        email: result.user.email.value,
        tenantId: result.user.tenantId.value,
        requestId: req.headers['x-request-id']
      });

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            userId: result.user.userId.value,
            email: result.user.email.value,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            role: result.user.role,
            tenantId: result.user.tenantId.value,
            isActive: result.user.isActive,
            lastLoginAt: result.user.lastLoginAt
          },
          token: result.token,
          refreshToken: result.refreshToken
        }
      });

    } catch (error) {
      this.logger.error('Authentication failed', {
        error: (error as Error).message,
        requestId: req.headers['x-request-id']
      });

      res.status(401).json({
        error: 'Authentication failed',
        message: (error as Error).message
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.body?.refreshToken || req.headers['x-refresh-token'];
      if (!refreshToken) {
        res.status(400).json({ error: 'Bad Request', message: 'Refresh token is required' });
        return;
      }
      const jwtLib = require('jsonwebtoken');
      const decoded = jwtLib.verify(refreshToken, process.env['JWT_REFRESH_SECRET']);
      const userId = decoded?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized', message: 'Invalid refresh token' });
        return;
      }
      const userResult: GetUserResponse = await this.getUserUseCase.execute({ userId });
      const userEntity = userResult.user;
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({
        id: userEntity.id,
        userId: userEntity.userId.value,
        email: userEntity.email.value,
        role: userEntity.role,
        tenantId: userEntity.tenantId.value,
        iat: Math.floor(Date.now() / 1000)
      }, process.env['JWT_SECRET'], { expiresIn: process.env['JWT_EXPIRES_IN'] || '24h' });

      res.status(200).json({
        success: true,
        data: {
          token
        }
      });
    } catch (error) {
      this.logger.error('Refresh token failed', {
        error: (error as Error).message,
        requestId: req.headers['x-request-id']
      });
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid refresh token' });
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          userId: user.userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
          profile: user.profile,
          permissions: user.permissions || [],
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      this.logger.error('Error getting current user', { error: (error as Error).message });
      res.status(500).json({
        error: 'Internal server error',
        message: (error as Error).message
      });
    }
  }

  @RequirePermission('users', 'read')
  @RequireTenant()
  async getUser(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { userId } = req.params;

      const result: GetUserResponse = await this.getUserUseCase.execute({ userId: userId! });

      if (result.user.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only access users from your own tenant'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            userId: result.user.userId.value,
            email: result.user.email.value,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            role: result.user.role,
            tenantId: result.user.tenantId.value,
            profile: result.user.profile,
            isActive: result.user.isActive,
            lastLoginAt: result.user.lastLoginAt,
            createdAt: result.user.createdAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to get user', {
        error: (error as Error).message,
        userId: req.params['userId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve user'
      });
    }
  }

  @RequirePermission('users', 'update')
  @RequireTenant()
  async updateUser(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { userId } = req.params;

      const validationResult = await this.validationService.validate(this.updateUserSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const result: UpdateUserResponse = await this.updateUserUseCase.execute({
        userId,
        ...req.body
      });

      if (result.user.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update users from your own tenant'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            userId: result.user.userId.value,
            email: result.user.email.value,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            role: result.user.role,
            tenantId: result.user.tenantId.value,
            profile: result.user.profile,
            isActive: result.user.isActive,
            updatedAt: result.user.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to update user', {
        error: (error as Error).message,
        userId: req.params['userId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update user'
      });
    }
  }

  @RequirePermission('users', 'update')
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const validationResult = await this.validationService.validate(this.changePasswordSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const result: ChangePasswordResponse = await this.changePasswordUseCase.execute({
        userId,
        ...req.body
      });

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      this.logger.error('Failed to change password', {
        error: (error as Error).message,
        userId: req.params['userId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to change password'
      });
    }
  }

  @RequirePermission('users', 'read')
  @RequireTenant()
  async listUsers(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      if (!tenantContext?.tenantId?.value) {
        this.logger.error('Tenant context is invalid in listUsers', {
          hasTenantContext: !!tenantContext,
          hasTenantId: !!tenantContext?.tenantId,
          hasTenantIdValue: !!tenantContext?.tenantId?.value
        });
        res.status(500).json({
          error: 'Internal server error',
          message: 'Tenant context is invalid'
        });
        return;
      }

      const { limit = 10, offset = 0, role, isActive, search } = req.query;

      const result: ListUsersResponse = await this.listUsersUseCase.execute({
        tenantId: tenantContext.tenantId.value,
        limit: Number(limit),
        offset: Number(offset),
        filters: {
          role: role as any,
          isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
          search: search as string
        } as any
      });

      res.status(200).json({
        success: true,
        data: {
          users: result.users.map(user => ({
            id: user.id,
            userId: user.userId.value,
            email: user.email.value,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            tenantId: user.tenantId.value,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt
          })),
          total: result.total,
          limit: Number(limit),
          offset: Number(offset)
        }
      });

    } catch (error) {
      this.logger.error('Failed to list users', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        requestId: req.headers['x-request-id'],
        tenantId: tenantContext?.tenantId?.value
      });

      res.status(500).json({
        error: 'Internal server error',
        message: process.env['NODE_ENV'] === 'development' 
          ? (error as Error).message 
          : 'Failed to list users'
      });
    }
  }

  @RequirePermission('users', 'delete')
  @RequireTenant()
  async deleteUser(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { userId } = req.params;

      const result: DeleteUserResponse = await this.deleteUserUseCase.execute({ userId: userId! });

      this.logger.info('User deleted successfully', {
        userId: result.userId,
        requestId: req.headers['x-request-id']
      });

      res.status(200).json({
        success: true,
        data: {
          message: 'User deleted successfully',
          userId: result.userId
        }
      });

    } catch (error) {
      this.logger.error('Failed to delete user', {
        error: (error as Error).message,
        userId: req.params['userId'],
        requestId: req.headers['x-request-id']
      });

      if ((error as Error).message === 'User not found') {
        res.status(404).json({
          error: 'Not found',
          message: 'User not found'
        });
        return;
      }

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete user'
      });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, tenantId = 'default-tenant' } = req.body;

      const { ForgotPasswordUseCase } = await import('@/application/use-cases/user/forgot-password.use-case');
      const forgotPasswordUseCase = new ForgotPasswordUseCase(
        (await import('@/infrastructure/di/container')).DIContainer.getContainer().get(TYPES.UserRepository)
      );

      const result = await forgotPasswordUseCase.execute(email, tenantId);

      this.logger.info('Password reset requested', {
        email,
        tenantId,
        requestId: req.headers['x-request-id']
      });

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      this.logger.error('Failed to process forgot password', {
        error: (error as Error).message,
        requestId: req.headers['x-request-id']
      });

      res.status(200).json({
        success: true,
        data: {
          message: 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.'
        }
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      const { ResetPasswordUseCase } = await import('@/application/use-cases/user/reset-password.use-case');
      const resetPasswordUseCase = new ResetPasswordUseCase(
        (await import('@/infrastructure/di/container')).DIContainer.getContainer().get(TYPES.UserRepository)
      );

      const result = await resetPasswordUseCase.execute(token, password);

      if (!result.success) {
        res.status(400).json({
          success: false,
          data: result
        });
        return;
      }

      this.logger.info('Password reset completed', {
        requestId: req.headers['x-request-id']
      });

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      this.logger.error('Failed to reset password', {
        error: (error as Error).message,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to reset password'
      });
    }
  }

  async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const { RegisterUserUseCase } = await import('@/application/use-cases/user/register-user.use-case');
      const registerUserUseCase = new RegisterUserUseCase(
        (await import('@/infrastructure/di/container')).DIContainer.getContainer().get(TYPES.UserRepository),
        (await import('@/infrastructure/di/container')).DIContainer.getContainer().get(TYPES.TenantRepository)
      );

      const result = await registerUserUseCase.execute(req.body);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message
        });
        return;
      }

      this.logger.info('User registered', {
        userId: result.userId,
        requestId: req.headers['x-request-id']
      });

      res.status(201).json({
        success: true,
        data: result
      });

    } catch (error) {
      this.logger.error('Failed to register user', {
        error: (error as Error).message,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to register user'
      });
    }
  }

  async setup2FA(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { Setup2FAUseCase } = await import('@/application/use-cases/user/setup-2fa.use-case');
      const setup2FAUseCase = new Setup2FAUseCase(
        (await import('@/infrastructure/di/container')).DIContainer.getContainer().get(TYPES.UserRepository)
      );

      const result = await setup2FAUseCase.execute(user.userId);

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      this.logger.error('Failed to setup 2FA', {
        error: (error as Error).message,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to setup 2FA'
      });
    }
  }

  async verify2FA(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { token, isSetup } = req.body;

      const { Verify2FAUseCase } = await import('@/application/use-cases/user/verify-2fa.use-case');
      const verify2FAUseCase = new Verify2FAUseCase(
        (await import('@/infrastructure/di/container')).DIContainer.getContainer().get(TYPES.UserRepository)
      );

      const result = await verify2FAUseCase.execute(user.userId, token, isSetup);

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      this.logger.error('Failed to verify 2FA', {
        error: (error as Error).message,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to verify 2FA'
      });
    }
  }

  async disable2FA(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { token } = req.body;

      const { Disable2FAUseCase } = await import('@/application/use-cases/user/disable-2fa.use-case');
      const disable2FAUseCase = new Disable2FAUseCase(
        (await import('@/infrastructure/di/container')).DIContainer.getContainer().get(TYPES.UserRepository)
      );

      const result = await disable2FAUseCase.execute(user.userId, token);

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      this.logger.error('Failed to disable 2FA', {
        error: (error as Error).message,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to disable 2FA'
      });
    }
  }

  async get2FAStatus(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const result: GetUserResponse = await this.getUserUseCase.execute({ userId: user.userId });
      const twoFactorEnabled = result.user.profile?.twoFactorEnabled === true;
      const systemEnabled = process.env['ENABLE_TWO_FACTOR_AUTH'] === 'true';

      res.status(200).json({
        success: true,
        data: {
          enabled: twoFactorEnabled,
          systemEnabled,
          backupCodesRemaining: result.user.profile?.twoFactorBackupCodes?.length || 0
        }
      });

    } catch (error) {
      this.logger.error('Failed to get 2FA status', {
        error: (error as Error).message,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get 2FA status'
      });
    }
  }

  async verify2FALogin(req: Request, res: Response): Promise<void> {
    try {
      const { tempToken, token } = req.body;

      if (!tempToken || !token) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Token and tempToken are required'
        });
        return;
      }

      const jwt = require('jsonwebtoken');
      let decoded;
      try {
        decoded = jwt.verify(tempToken, process.env['JWT_SECRET']);
      } catch {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired temp token'
        });
        return;
      }

      const { Verify2FAUseCase } = await import('@/application/use-cases/user/verify-2fa.use-case');
      const verify2FAUseCase = new Verify2FAUseCase(
        (await import('@/infrastructure/di/container')).DIContainer.getContainer().get(TYPES.UserRepository)
      );

      const verifyResult = await verify2FAUseCase.execute(decoded.userId, token);

      if (!verifyResult.success) {
        res.status(401).json({
          success: false,
          data: verifyResult
        });
        return;
      }

      const userResult: GetUserResponse = await this.getUserUseCase.execute({ userId: decoded.userId });
      const userEntity = userResult.user;

      const accessToken = jwt.sign({
        id: userEntity.id,
        userId: userEntity.userId.value,
        email: userEntity.email.value,
        role: userEntity.role,
        tenantId: userEntity.tenantId.value,
        iat: Math.floor(Date.now() / 1000)
      }, process.env['JWT_SECRET'], { expiresIn: process.env['JWT_EXPIRES_IN'] || '24h' });

      const refreshToken = jwt.sign({
        userId: userEntity.userId.value,
        type: 'refresh'
      }, process.env['JWT_REFRESH_SECRET'], { expiresIn: '7d' });

      res.status(200).json({
        success: true,
        data: {
          success: true,
          token: accessToken,
          refreshToken,
          user: {
            id: userEntity.id,
            userId: userEntity.userId.value,
            email: userEntity.email.value,
            firstName: userEntity.firstName,
            lastName: userEntity.lastName,
            role: userEntity.role,
            tenantId: userEntity.tenantId.value
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to verify 2FA login', {
        error: (error as Error).message,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to verify 2FA'
      });
    }
  }

  @RequirePermission('users', 'read')
  async getUserDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const result: GetUserResponse = await this.getUserUseCase.execute({ userId: userId! });
      
      const profile = result.user.profile as any;
      const documents = Array.isArray(profile?.documents) 
        ? profile.documents 
        : [];

      res.status(200).json({
        success: true,
        data: { documents }
      });
    } catch (error) {
      this.logger.error('Failed to get user documents', {
        error: (error as Error).message,
        userId: req.params['userId']
      });
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve documents'
      });
    }
  }

  @RequirePermission('users', 'update')
  async deleteUserDocument(req: Request, res: Response): Promise<void> {
    try {
      const { userId, documentId } = req.params;
      const result: GetUserResponse = await this.getUserUseCase.execute({ userId: userId! });
      
      const profile = result.user.profile as any;
      const documents = Array.isArray(profile?.documents) 
        ? profile.documents 
        : [];
      
      const updatedDocuments = documents.filter((doc: any) => doc.id !== documentId);
      
      await this.updateUserUseCase.execute({
        userId: userId!,
        profile: {
          ...result.user.profile,
          documents: updatedDocuments
        } as any
      });

      res.status(200).json({
        success: true,
        data: { message: 'Document deleted successfully' }
      });
    } catch (error) {
      this.logger.error('Failed to delete user document', {
        error: (error as Error).message,
        userId: req.params['userId']
      });
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete document'
      });
    }
  }
}
