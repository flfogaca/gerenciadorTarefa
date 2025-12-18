import { Router } from 'express';
import { DIContainer } from '@/infrastructure/di/container';
import { TYPES } from '@/shared/types';
import { InvoiceController } from '@/presentation/controllers/invoice.controller';

const container = DIContainer.getContainer();
const invoiceController = container.get<InvoiceController>(TYPES.InvoiceController);

export const invoiceRoutes = Router();

invoiceRoutes.get('/', invoiceController.getInvoices.bind(invoiceController));
invoiceRoutes.get('/:id', invoiceController.getInvoice.bind(invoiceController));
invoiceRoutes.post('/', invoiceController.createInvoice.bind(invoiceController));
invoiceRoutes.put('/:id', invoiceController.updateInvoice.bind(invoiceController));
invoiceRoutes.delete('/:id', invoiceController.deleteInvoice.bind(invoiceController));
invoiceRoutes.post('/:id/send', invoiceController.sendInvoice.bind(invoiceController));
invoiceRoutes.post('/:id/mark-as-paid', invoiceController.markInvoiceAsPaid.bind(invoiceController));
invoiceRoutes.post('/:id/cancel', invoiceController.cancelInvoice.bind(invoiceController));

