import { Router } from 'express';
import { DIContainer } from '@/infrastructure/di/container';
import { TYPES } from '@/shared/types';
import { PaymentController } from '@/presentation/controllers/payment.controller';

const container = DIContainer.getContainer();
const paymentController = container.get<PaymentController>(TYPES.PaymentController);

export const paymentRoutes = Router();

paymentRoutes.get('/', paymentController.getPayments.bind(paymentController));
paymentRoutes.get('/:id', paymentController.getPayment.bind(paymentController));
paymentRoutes.post('/', paymentController.createPayment.bind(paymentController));
paymentRoutes.put('/:id', paymentController.updatePayment.bind(paymentController));
paymentRoutes.delete('/:id', paymentController.deletePayment.bind(paymentController));
paymentRoutes.post('/:id/process', paymentController.processPayment.bind(paymentController));
paymentRoutes.post('/:id/complete', paymentController.completePayment.bind(paymentController));
paymentRoutes.post('/:id/refund', paymentController.refundPayment.bind(paymentController));

