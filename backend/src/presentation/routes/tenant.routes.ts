import { Router } from 'express';
import { DIContainer } from '@/infrastructure/di/container';
import { TYPES } from '@/shared/types';
import { TenantController } from '@/presentation/controllers/tenant.controller';
import { AuthMiddleware } from '@/presentation/middleware/auth-middleware';
import { ErrorHandler } from '@/presentation/middleware/error-handler';

const container = DIContainer.getContainer();
const tenantController = container.get<TenantController>(TYPES.TenantController);

export const tenantRoutes = Router();

tenantRoutes.get('/settings/public',
  ErrorHandler.asyncHandler(tenantController.getPublicSettings.bind(tenantController))
);

tenantRoutes.use(AuthMiddleware.create());

tenantRoutes.post('/',
  ErrorHandler.asyncHandler(tenantController.createTenant.bind(tenantController))
);

tenantRoutes.get('/',
  ErrorHandler.asyncHandler(tenantController.listTenants.bind(tenantController))
);

tenantRoutes.get('/:tenantId',
  ErrorHandler.asyncHandler(tenantController.getTenant.bind(tenantController))
);

tenantRoutes.put('/:tenantId',
  ErrorHandler.asyncHandler(tenantController.updateTenant.bind(tenantController))
);
