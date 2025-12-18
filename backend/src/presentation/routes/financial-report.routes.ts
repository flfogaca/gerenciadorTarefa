import { Router } from 'express';
import { DIContainer } from '@/infrastructure/di/container';
import { TYPES } from '@/shared/types';
import { FinancialReportController } from '@/presentation/controllers/financial-report.controller';

const container = DIContainer.getContainer();
const reportController = container.get<FinancialReportController>(TYPES.FinancialReportController);

export const financialReportRoutes = Router();

financialReportRoutes.get('/dashboard', reportController.getDashboardReport.bind(reportController));
financialReportRoutes.get('/expenses', reportController.getExpenseReport.bind(reportController));
financialReportRoutes.get('/income', reportController.getIncomeReport.bind(reportController));
financialReportRoutes.get('/cash-flow', reportController.getCashFlowReport.bind(reportController));
financialReportRoutes.get('/project/:projectId', reportController.getProjectReport.bind(reportController));

