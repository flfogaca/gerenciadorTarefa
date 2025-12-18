import { Router } from 'express';
import { DIContainer } from '@/infrastructure/di/container';
import { TYPES } from '@/shared/types';
import { UserSettingsController } from '@/presentation/controllers/user-settings.controller';

const container = DIContainer.getContainer();
const userSettingsController = container.get<UserSettingsController>(TYPES.UserSettingsController);

export const userSettingsRoutes = Router();

userSettingsRoutes.get('/me', userSettingsController.getMySettings.bind(userSettingsController));
userSettingsRoutes.put('/me', userSettingsController.updateMySettings.bind(userSettingsController));

