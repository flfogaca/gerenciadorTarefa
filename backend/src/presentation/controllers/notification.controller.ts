import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/presentation/middleware/auth-middleware';
import { INotificationService } from '@/core/interfaces/services';
import { TYPES } from '@/shared/types';
import { RequirePermission } from '@/core/permissions/permission-system';
import { RequireTenant } from '@/core/multi-tenant/tenant-context';
import { Logger } from '@/shared/logging/logger';
import Joi from 'joi';

@injectable()
export class NotificationController {
  private readonly markAsReadSchema = Joi.object({
    notificationId: Joi.string().required()
  });

  constructor(
    @inject(TYPES.NotificationService) private readonly notificationService: INotificationService,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  @RequirePermission('notifications', 'read')
  @RequireTenant()
  async getNotifications(req: AuthenticatedRequest, res: Response, tenantContext: any): Promise<void> {
    try {
      const userId = req.user?.userId || req.user?.id || req.params['userId'];
      
      if (!userId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'User ID is required'
        });
        return;
      }

      const notifications = await this.notificationService.getUserNotifications(userId);

      res.status(200).json({
        success: true,
        data: {
          notifications: notifications.map((notification: any) => ({
            id: notification.id,
            type: notification.type,
            title: notification.title || notification.data?.title || 'Notificação',
            message: notification.message || notification.data?.message || '',
            data: notification.data,
            isRead: notification.status === 'read' || notification.isRead === true,
            createdAt: notification.createdAt || notification.sentAt,
            readAt: notification.readAt
          })),
          unreadCount: notifications.filter((n: any) => n.status !== 'read' && n.isRead !== true).length
        }
      });

    } catch (error) {
      this.logger.error('Failed to get notifications', {
        error: (error as Error).message,
        userId: req.user?.userId,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve notifications'
      });
    }
  }

  @RequirePermission('notifications', 'update')
  @RequireTenant()
  async markAsRead(req: AuthenticatedRequest, res: Response, tenantContext: any): Promise<void> {
    try {
      const { notificationId } = req.params;
      if (!notificationId) {
        res.status(400).json({
          success: false,
          error: 'Notification ID is required'
        });
        return;
      }

      await this.notificationService.markAsRead(notificationId);

      this.logger.info('Notification marked as read', {
        notificationId,
        requestId: req.headers['x-request-id']
      });

      res.status(200).json({
        success: true,
        data: {
          message: 'Notification marked as read',
          notificationId
        }
      });

    } catch (error) {
      this.logger.error('Failed to mark notification as read', {
        error: (error as Error).message,
        notificationId: req.params['notificationId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to mark notification as read'
      });
    }
  }

  @RequirePermission('notifications', 'update')
  @RequireTenant()
  async markAllAsRead(req: AuthenticatedRequest, res: Response, tenantContext: any): Promise<void> {
    try {
      const userId = req.user?.userId || req.body.userId;
      
      if (!userId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'User ID is required'
        });
        return;
      }

      const notifications = await this.notificationService.getUserNotifications(userId);
      
      const unreadNotifications = notifications.filter((n: any) => n.status !== 'read' && n.isRead !== true);
      
      for (const notification of unreadNotifications) {
        await this.notificationService.markAsRead(notification.id);
      }

      this.logger.info('All notifications marked as read', {
        userId,
        count: unreadNotifications.length,
        requestId: req.headers['x-request-id']
      });

      res.status(200).json({
        success: true,
        data: {
          message: 'All notifications marked as read',
          count: unreadNotifications.length
        }
      });

    } catch (error) {
      this.logger.error('Failed to mark all notifications as read', {
        error: (error as Error).message,
        userId: req.user?.userId,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to mark all notifications as read'
      });
    }
  }

  @RequirePermission('notifications', 'read')
  @RequireTenant()
  async getUnreadCount(req: AuthenticatedRequest, res: Response, tenantContext: any): Promise<void> {
    try {
      const userId = req.user?.userId || req.user?.id || req.params['userId'];
      
      if (!userId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'User ID is required'
        });
        return;
      }

      const notifications = await this.notificationService.getUserNotifications(userId);
      const unreadCount = notifications.filter((n: any) => n.status !== 'read' && n.isRead !== true).length;

      res.status(200).json({
        success: true,
        data: {
          unreadCount
        }
      });

    } catch (error) {
      this.logger.error('Failed to get unread count', {
        error: (error as Error).message,
        userId: req.user?.userId,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to get unread count'
      });
    }
  }
}

