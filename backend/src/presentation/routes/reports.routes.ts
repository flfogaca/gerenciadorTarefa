import { Router } from 'express';
import { DIContainer } from '@/infrastructure/di/container';
import { TYPES } from '@/shared/types';
import { ReportsController } from '@/presentation/controllers/reports.controller';

const container = DIContainer.getContainer();
const reportsController = container.get<ReportsController>(TYPES.ReportsController);

export const reportsRoutes = Router();

reportsRoutes.get('/dashboard', reportsController.getDashboardReport.bind(reportsController));
reportsRoutes.get('/dashboard/manager', reportsController.getManagerDashboard.bind(reportsController));
reportsRoutes.get('/dashboard/employee', reportsController.getEmployeeDashboard.bind(reportsController));
reportsRoutes.get('/dashboard/director', reportsController.getDirectorDashboard.bind(reportsController));
reportsRoutes.get('/project/:projectId', reportsController.getProjectReport.bind(reportsController));
reportsRoutes.get('/task/:taskId', reportsController.getTaskReport.bind(reportsController));
reportsRoutes.get('/client/:clientId', reportsController.getClientReport.bind(reportsController));
reportsRoutes.get('/supplier/:supplierId', reportsController.getSupplierReport.bind(reportsController));
