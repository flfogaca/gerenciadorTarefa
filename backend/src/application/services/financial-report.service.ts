import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IFinancialReportService, FinancialReport, FinancialReportFilters } from '@/core/interfaces/services';
import { IExpenseRepository, IInvoiceRepository, IPaymentRepository, IFinancialTransactionRepository } from '@/core/interfaces/repositories';
import { TenantIdVO } from '@/core/entities/tenant';
import { ExpenseStatus } from '@/core/entities/expense';
import { InvoiceStatus } from '@/core/entities/invoice';
import { PaymentStatus } from '@/core/entities/payment';
import { TransactionType } from '@/core/entities/financial-transaction';
import { ILogger } from '@/shared/logging/logger';

@injectable()
export class FinancialReportService implements IFinancialReportService {
  constructor(
    @inject(TYPES.ExpenseRepository) private readonly expenseRepository: IExpenseRepository,
    @inject(TYPES.InvoiceRepository) private readonly invoiceRepository: IInvoiceRepository,
    @inject(TYPES.PaymentRepository) private readonly paymentRepository: IPaymentRepository,
    @inject(TYPES.FinancialTransactionRepository) private readonly transactionRepository: IFinancialTransactionRepository,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  async generateDashboardReport(filters: FinancialReportFilters): Promise<FinancialReport> {
    try {
      this.logger.info('Generating dashboard financial report', { tenantId: filters.tenantId });

      const tenantId = new TenantIdVO(filters.tenantId);
      const startDate = filters.startDate || new Date(new Date().getFullYear(), 0, 1);
      const endDate = filters.endDate || new Date();

      const [expenses, invoices, payments, transactions] = await Promise.all([
        this.expenseRepository.findByDateRange(startDate, endDate, tenantId),
        this.invoiceRepository.findByDateRange(startDate, endDate, tenantId),
        this.paymentRepository.findByDateRange(startDate, endDate, tenantId),
        this.transactionRepository.findByDateRange(startDate, endDate, tenantId)
      ]);

      const incomeInvoices = invoices.filter(inv => inv.type === 'income' && inv.status === InvoiceStatus.PAID);
      const expenseInvoices = invoices.filter(inv => inv.type === 'expense');
      const paidExpenses = expenses.filter(exp => exp.status === ExpenseStatus.PAID);
      const completedPayments = payments.filter(pay => pay.status === PaymentStatus.COMPLETED);

      const totalIncome = incomeInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const totalExpenses = paidExpenses.reduce((sum, exp) => sum + exp.amount, 0) +
                           expenseInvoices.filter(inv => inv.status === InvoiceStatus.PAID).reduce((sum, inv) => sum + inv.total, 0);
      const netProfit = totalIncome - totalExpenses;

      const expensesByCategory = this.calculateExpensesByCategory(expenses);
      const incomeByProject = this.calculateIncomeByProject(incomeInvoices);
      const expensesByProject = this.calculateExpensesByProject(paidExpenses);
      const monthlyTrends = this.calculateMonthlyTrends(transactions, startDate, endDate);

      const report: FinancialReport = {
        summary: {
          totalIncome,
          totalExpenses,
          netProfit,
          totalInvoices: invoices.length,
          paidInvoices: incomeInvoices.length,
          overdueInvoices: invoices.filter(inv => inv.status === InvoiceStatus.OVERDUE).length,
          totalPayments: payments.length,
          pendingPayments: payments.filter(pay => pay.status === PaymentStatus.PENDING).length
        },
        expensesByCategory,
        incomeByProject,
        expensesByProject,
        monthlyTrends,
        generatedAt: new Date()
      };

      this.logger.info('Dashboard financial report generated successfully', { tenantId: filters.tenantId });
      return report;
    } catch (error) {
      this.logger.error('Failed to generate dashboard financial report', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: filters.tenantId
      });
      throw error;
    }
  }

  async generateExpenseReport(filters: FinancialReportFilters): Promise<any> {
    try {
      const tenantId = new TenantIdVO(filters.tenantId);
      const startDate = filters.startDate || new Date(new Date().getFullYear(), 0, 1);
      const endDate = filters.endDate || new Date();

      const expenses = await this.expenseRepository.findByDateRange(startDate, endDate, tenantId);
      
      return {
        expenses,
        total: expenses.reduce((sum, exp) => sum + exp.amount, 0),
        byCategory: this.calculateExpensesByCategory(expenses),
        byStatus: this.calculateExpensesByStatus(expenses),
        generatedAt: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to generate expense report', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  async generateIncomeReport(filters: FinancialReportFilters): Promise<any> {
    try {
      const tenantId = new TenantIdVO(filters.tenantId);
      const startDate = filters.startDate || new Date(new Date().getFullYear(), 0, 1);
      const endDate = filters.endDate || new Date();

      const invoices = await this.invoiceRepository.findByDateRange(startDate, endDate, tenantId);
      const incomeInvoices = invoices.filter(inv => inv.type === 'income');
      
      return {
        invoices: incomeInvoices,
        total: incomeInvoices.reduce((sum, inv) => sum + inv.total, 0),
        byStatus: this.calculateInvoicesByStatus(incomeInvoices),
        byProject: this.calculateIncomeByProject(incomeInvoices),
        generatedAt: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to generate income report', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  async generateCashFlowReport(filters: FinancialReportFilters): Promise<any> {
    try {
      const tenantId = new TenantIdVO(filters.tenantId);
      const startDate = filters.startDate || new Date(new Date().getFullYear(), 0, 1);
      const endDate = filters.endDate || new Date();

      const transactions = await this.transactionRepository.findByDateRange(startDate, endDate, tenantId);
      
      return {
        transactions,
        income: transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0),
        expenses: transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0),
        netFlow: transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0) -
                transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0),
        monthlyTrends: this.calculateMonthlyTrends(transactions, startDate, endDate),
        generatedAt: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to generate cash flow report', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  async generateProjectReport(projectId: string, filters: FinancialReportFilters): Promise<any> {
    try {
      const tenantId = new TenantIdVO(filters.tenantId);
      const expenses = await this.expenseRepository.findByProjectId(projectId);
      const invoices = await this.invoiceRepository.findByProjectId(projectId);
      const payments = await this.paymentRepository.findMany({
        tenantId,
        filters: {
          invoiceId: invoices.find(inv => inv.projectId === projectId)?.id
        }
      });

      return {
        projectId,
        expenses,
        invoices,
        payments: payments.payments,
        totalExpenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
        totalIncome: invoices.filter(inv => inv.type === 'income').reduce((sum, inv) => sum + inv.total, 0),
        netProfit: invoices.filter(inv => inv.type === 'income').reduce((sum, inv) => sum + inv.total, 0) -
                  expenses.reduce((sum, exp) => sum + exp.amount, 0),
        generatedAt: new Date()
      };
    } catch (error) {
      this.logger.error('Failed to generate project report', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  private calculateExpensesByCategory(expenses: any[]): Array<{ category: string; amount: number; percentage: number }> {
    const categoryMap = new Map<string, number>();
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    expenses.forEach(exp => {
      const current = categoryMap.get(exp.category) || 0;
      categoryMap.set(exp.category, current + exp.amount);
    });

    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);
  }

  private calculateExpensesByStatus(expenses: any[]): Array<{ status: string; count: number; amount: number }> {
    const statusMap = new Map<string, { count: number; amount: number }>();

    expenses.forEach(exp => {
      const current = statusMap.get(exp.status) || { count: 0, amount: 0 };
      statusMap.set(exp.status, {
        count: current.count + 1,
        amount: current.amount + exp.amount
      });
    });

    return Array.from(statusMap.entries()).map(([status, data]) => ({
      status,
      ...data
    }));
  }

  private calculateInvoicesByStatus(invoices: any[]): Array<{ status: string; count: number; amount: number }> {
    const statusMap = new Map<string, { count: number; amount: number }>();

    invoices.forEach(inv => {
      const current = statusMap.get(inv.status) || { count: 0, amount: 0 };
      statusMap.set(inv.status, {
        count: current.count + 1,
        amount: current.amount + inv.total
      });
    });

    return Array.from(statusMap.entries()).map(([status, data]) => ({
      status,
      ...data
    }));
  }

  private calculateIncomeByProject(invoices: any[]): Array<{ projectId: string; projectName: string; amount: number }> {
    const projectMap = new Map<string, { name: string; amount: number }>();

    invoices.forEach(inv => {
      if (inv.projectId) {
        const current = projectMap.get(inv.projectId) || { name: inv.project?.name || 'N/A', amount: 0 };
        projectMap.set(inv.projectId, {
          name: current.name,
          amount: current.amount + inv.total
        });
      }
    });

    return Array.from(projectMap.entries()).map(([projectId, data]) => ({
      projectId,
      projectName: data.name,
      amount: data.amount
    })).sort((a, b) => b.amount - a.amount);
  }

  private calculateExpensesByProject(expenses: any[]): Array<{ projectId: string; projectName: string; amount: number }> {
    const projectMap = new Map<string, { name: string; amount: number }>();

    expenses.forEach(exp => {
      if (exp.projectId) {
        const current = projectMap.get(exp.projectId) || { name: exp.project?.name || 'N/A', amount: 0 };
        projectMap.set(exp.projectId, {
          name: current.name,
          amount: current.amount + exp.amount
        });
      }
    });

    return Array.from(projectMap.entries()).map(([projectId, data]) => ({
      projectId,
      projectName: data.name,
      amount: data.amount
    })).sort((a, b) => b.amount - a.amount);
  }

  private calculateMonthlyTrends(transactions: any[], startDate: Date, endDate: Date): Array<{ month: string; income: number; expenses: number; profit: number }> {
    const monthMap = new Map<string, { income: number; expenses: number }>();

    transactions.forEach(txn => {
      const month = new Date(txn.date).toISOString().substring(0, 7);
      const current = monthMap.get(month) || { income: 0, expenses: 0 };
      
      if (txn.type === TransactionType.INCOME) {
        monthMap.set(month, { ...current, income: current.income + txn.amount });
      } else if (txn.type === TransactionType.EXPENSE) {
        monthMap.set(month, { ...current, expenses: current.expenses + txn.amount });
      }
    });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        profit: data.income - data.expenses
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}

