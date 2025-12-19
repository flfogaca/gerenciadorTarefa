import { Router } from 'express';
import { DIContainer } from '@/infrastructure/di/container';
import { TYPES } from '@/shared/types';
import { UserController } from '@/presentation/controllers/user.controller';
import { authRateLimiter, passwordResetRateLimiter } from '@/presentation/middleware/rate-limiter';
import { validateRequest, authSchemas } from '@/shared/validation/schemas';

const container = DIContainer.getContainer();
const userController = container.get<UserController>(TYPES.UserController);

export const userRoutes = Router();

userRoutes.post('/auth/login', authRateLimiter, validateRequest(authSchemas.login), userController.authenticateUser.bind(userController));
userRoutes.post('/auth/refresh', userController.refreshToken.bind(userController));
userRoutes.post('/auth/forgot-password', passwordResetRateLimiter, validateRequest(authSchemas.forgotPassword), userController.forgotPassword.bind(userController));
userRoutes.post('/auth/reset-password', passwordResetRateLimiter, validateRequest(authSchemas.resetPassword), userController.resetPassword.bind(userController));
userRoutes.post('/auth/2fa/verify', userController.verify2FALogin.bind(userController));
userRoutes.post('/register', authRateLimiter, userController.registerUser.bind(userController));
userRoutes.get('/me', userController.getCurrentUser.bind(userController));
userRoutes.post('/me/2fa/setup', userController.setup2FA.bind(userController));
userRoutes.post('/me/2fa/verify', userController.verify2FA.bind(userController));
userRoutes.post('/me/2fa/disable', userController.disable2FA.bind(userController));
userRoutes.get('/me/2fa/status', userController.get2FAStatus.bind(userController));
userRoutes.post('/', userController.createUser.bind(userController));
userRoutes.get('/', userController.listUsers.bind(userController));
userRoutes.get('/:userId', userController.getUser.bind(userController));
userRoutes.get('/:userId/documents', userController.getUserDocuments.bind(userController));
userRoutes.delete('/:userId/documents/:documentId', userController.deleteUserDocument.bind(userController));
userRoutes.put('/:userId', userController.updateUser.bind(userController));
userRoutes.put('/:userId/password', validateRequest(authSchemas.changePassword), userController.changePassword.bind(userController));
userRoutes.delete('/:userId', userController.deleteUser.bind(userController));
