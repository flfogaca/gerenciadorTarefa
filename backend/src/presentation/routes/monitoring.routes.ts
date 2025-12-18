import { Router } from 'express';
import { DIContainer } from '@/infrastructure/di/container';
import { TYPES } from '@/shared/types';
import { MonitoringController } from '@/presentation/controllers/monitoring.controller';

const container = DIContainer.getContainer();
const monitoringController = container.get<MonitoringController>(TYPES.MonitoringController);

export const monitoringRoutes = Router();

monitoringRoutes.get('/health', monitoringController.getHealthCheck.bind(monitoringController));

monitoringRoutes.get('/metrics', monitoringController.getMetrics.bind(monitoringController));

monitoringRoutes.get('/cache/stats', monitoringController.getCacheStats.bind(monitoringController));

monitoringRoutes.post('/cache/flush', monitoringController.flushCache.bind(monitoringController));

monitoringRoutes.get('/audit', monitoringController.getAuditLogs.bind(monitoringController));

monitoringRoutes.get('/audit/user/:userId', monitoringController.getUserAuditLogs.bind(monitoringController));

monitoringRoutes.get('/system', monitoringController.getSystemInfo.bind(monitoringController));

monitoringRoutes.post('/metrics/track', monitoringController.trackCustomMetric.bind(monitoringController));
