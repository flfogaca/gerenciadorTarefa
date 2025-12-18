import { Router } from 'express';
import { DIContainer } from '@/infrastructure/di/container';
import { TYPES } from '@/shared/types';
import { ExpenseController } from '@/presentation/controllers/expense.controller';

const container = DIContainer.getContainer();
const expenseController = container.get<ExpenseController>(TYPES.ExpenseController);

export const expenseRoutes = Router();

expenseRoutes.get('/', expenseController.getExpenses.bind(expenseController));
expenseRoutes.get('/:id', expenseController.getExpense.bind(expenseController));
expenseRoutes.post('/', expenseController.createExpense.bind(expenseController));
expenseRoutes.put('/:id', expenseController.updateExpense.bind(expenseController));
expenseRoutes.delete('/:id', expenseController.deleteExpense.bind(expenseController));
expenseRoutes.post('/:id/approve', expenseController.approveExpense.bind(expenseController));
expenseRoutes.post('/:id/reject', expenseController.rejectExpense.bind(expenseController));
expenseRoutes.post('/:id/mark-as-paid', expenseController.markExpenseAsPaid.bind(expenseController));

