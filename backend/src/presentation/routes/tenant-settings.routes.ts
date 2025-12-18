import { Router } from 'express';
import { DIContainer } from '@/infrastructure/di/container';
import { TYPES } from '@/shared/types';
import { TenantSettingsController } from '@/presentation/controllers/tenant-settings.controller';

const container = DIContainer.getContainer();
const tenantSettingsController = container.get<TenantSettingsController>(TYPES.TenantSettingsController);

export const tenantSettingsRoutes = Router();

tenantSettingsRoutes.get('/', tenantSettingsController.getTenantSettings.bind(tenantSettingsController));
tenantSettingsRoutes.put('/', tenantSettingsController.updateTenantSettings.bind(tenantSettingsController));

