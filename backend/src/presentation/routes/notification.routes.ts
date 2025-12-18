import { Router } from 'express';
import { DIContainer } from '@/infrastructure/di/container';
import { TYPES } from '@/shared/types';
import { NotificationController } from '@/presentation/controllers/notification.controller';

const container = DIContainer.getContainer();
const notificationController = container.get<NotificationController>(TYPES.NotificationController);

export const notificationRoutes = Router();

notificationRoutes.get('/', notificationController.getNotifications.bind(notificationController));
notificationRoutes.get('/unread-count', notificationController.getUnreadCount.bind(notificationController));
notificationRoutes.post('/:notificationId/read', notificationController.markAsRead.bind(notificationController));
notificationRoutes.post('/read-all', notificationController.markAllAsRead.bind(notificationController));

