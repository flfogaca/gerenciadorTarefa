import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '@/shared/types';
import { IFinancialReportService } from '@/core/interfaces/services';
import { RequirePermission } from '@/core/permissions/permission-system';
import { RequireTenant } from '@/core/multi-tenant/tenant-context';
import { Logger } from '@/shared/logging/logger';

@injectable()
export class FinancialReportController {
  constructor(
    @inject(TYPES.FinancialReportService) private readonly reportService: IFinancialReportService,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  @RequirePermission('financial_reports', 'read')
  @RequireTenant()
  async getDashboardReport(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { startDate, endDate, projectId, category } = req.query;

      const report = await this.reportService.generateDashboardReport({
        tenantId: tenantContext.tenantId.value,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        projectId: projectId as string,
        category: category as string
      });

      res.status(200).json({
        success: true,
        data: {
          report
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to get dashboard report', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get dashboard report'
      });
    }
  }

  @RequirePermission('financial_reports', 'read')
  @RequireTenant()
  async getExpenseReport(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { startDate, endDate, projectId, category } = req.query;

      const report = await this.reportService.generateExpenseReport({
        tenantId: tenantContext.tenantId.value,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        projectId: projectId as string,
        category: category as string
      });

      res.status(200).json({
        success: true,
        data: {
          report
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to get expense report', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get expense report'
      });
    }
  }

  @RequirePermission('financial_reports', 'read')
  @RequireTenant()
  async getIncomeReport(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { startDate, endDate, projectId } = req.query;

      const report = await this.reportService.generateIncomeReport({
        tenantId: tenantContext.tenantId.value,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        projectId: projectId as string
      });

      res.status(200).json({
        success: true,
        data: {
          report
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to get income report', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get income report'
      });
    }
  }

  @RequirePermission('financial_reports', 'read')
  @RequireTenant()
  async getCashFlowReport(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const report = await this.reportService.generateCashFlowReport({
        tenantId: tenantContext.tenantId.value,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });

      res.status(200).json({
        success: true,
        data: {
          report
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to get cash flow report', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get cash flow report'
      });
    }
  }

  @RequirePermission('financial_reports', 'read')
  @RequireTenant()
  async getProjectReport(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { projectId } = req.params;
      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }
      const { startDate, endDate } = req.query;

      const report = await this.reportService.generateProjectReport(projectId, {
        tenantId: tenantContext.tenantId.value,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });

      res.status(200).json({
        success: true,
        data: {
          report
        }
      });
    } catch (error: any) {
      this.logger.error('Failed to get project report', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get project report'
      });
    }
  }
}

