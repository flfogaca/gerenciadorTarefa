import { injectable } from 'inversify';
import { EmailService } from './email.service';

export interface PushNotificationPayload {
  userId: string;
  tenantId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
  channels?: NotificationChannel[];
}

export type NotificationType = 
  | 'task_assigned'
  | 'task_completed'
  | 'task_overdue'
  | 'project_update'
  | 'comment_added'
  | 'mention'
  | 'deadline_reminder'
  | 'approval_required'
  | 'system_alert'
  | 'welcome';

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms';

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  sms: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  disabledTypes?: NotificationType[];
}

interface StoredNotification {
  id: string;
  userId: string;
  tenantId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

@injectable()
export class PushNotificationService {
  private notifications: Map<string, StoredNotification[]> = new Map();
  private emailService: EmailService;
  private subscriptions: Map<string, any[]> = new Map();

  constructor() {
    this.emailService = new EmailService();
  }

  async send(payload: PushNotificationPayload): Promise<void> {
    const channels = payload.channels || ['in_app'];
    
    for (const channel of channels) {
      switch (channel) {
        case 'in_app':
          await this.sendInApp(payload);
          break;
        case 'email':
          await this.sendEmail(payload);
          break;
        case 'push':
          await this.sendPush(payload);
          break;
        case 'sms':
          await this.sendSMS(payload);
          break;
      }
    }
  }

  private async sendInApp(payload: PushNotificationPayload): Promise<void> {
    const notification: StoredNotification = {
      id: this.generateId(),
      userId: payload.userId,
      tenantId: payload.tenantId,
      title: payload.title,
      body: payload.body,
      type: payload.type,
      data: payload.data,
      read: false,
      createdAt: new Date(),
    };

    const userKey = `${payload.tenantId}:${payload.userId}`;
    const existing = this.notifications.get(userKey) || [];
    existing.unshift(notification);
    
    if (existing.length > 100) {
      existing.pop();
    }
    
    this.notifications.set(userKey, existing);
  }

  private async sendEmail(payload: PushNotificationPayload): Promise<void> {
    try {
      const emailAddress = payload.data?.['email'] || '';
      if (!emailAddress) return;
      
      const actionUrl = payload.data?.['actionUrl'] || '';
      const html = this.buildEmailTemplate(payload.title, payload.body, actionUrl);
      
      await this.emailService.send({
        to: emailAddress,
        subject: payload.title,
        html,
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  private buildEmailTemplate(title: string, body: string, actionUrl?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6, #2563EB); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">${title}</h1>
          </div>
          <div class="content">
            <p>${body}</p>
            ${actionUrl ? `<a href="${actionUrl}" class="button">Ver Detalhes</a>` : ''}
          </div>
          <div class="footer">
            <p>Esta é uma notificação automática do GestorPro.</p>
            <p>Se você não deseja mais receber estas notificações, acesse as configurações da sua conta.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private async sendPush(payload: PushNotificationPayload): Promise<void> {
    const userKey = `${payload.tenantId}:${payload.userId}`;
    const subs = this.subscriptions.get(userKey) || [];
    
    for (const sub of subs) {
      try {
        console.log('Sending push notification to subscription:', sub.endpoint);
      } catch (error) {
        console.error('Failed to send push notification:', error);
      }
    }
  }

  private async sendSMS(payload: PushNotificationPayload): Promise<void> {
    console.log('SMS notification would be sent:', payload.title);
  }

  async getNotifications(userId: string, tenantId: string, options?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }): Promise<{ notifications: StoredNotification[]; total: number; unreadCount: number }> {
    const userKey = `${tenantId}:${userId}`;
    let notifications = this.notifications.get(userKey) || [];
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    if (options?.unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }
    
    const total = notifications.length;
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    
    return {
      notifications: notifications.slice(offset, offset + limit),
      total,
      unreadCount,
    };
  }

  async markAsRead(notificationId: string, userId: string, tenantId: string): Promise<void> {
    const userKey = `${tenantId}:${userId}`;
    const notifications = this.notifications.get(userKey) || [];
    
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
    
    this.notifications.set(userKey, notifications);
  }

  async markAllAsRead(userId: string, tenantId: string): Promise<void> {
    const userKey = `${tenantId}:${userId}`;
    const notifications = this.notifications.get(userKey) || [];
    
    notifications.forEach(n => n.read = true);
    
    this.notifications.set(userKey, notifications);
  }

  async deleteNotification(notificationId: string, userId: string, tenantId: string): Promise<void> {
    const userKey = `${tenantId}:${userId}`;
    const notifications = this.notifications.get(userKey) || [];
    
    const filtered = notifications.filter(n => n.id !== notificationId);
    this.notifications.set(userKey, filtered);
  }

  async registerPushSubscription(userId: string, tenantId: string, subscription: any): Promise<void> {
    const userKey = `${tenantId}:${userId}`;
    const existing = this.subscriptions.get(userKey) || [];
    
    const existingIndex = existing.findIndex(s => s.endpoint === subscription.endpoint);
    if (existingIndex === -1) {
      existing.push(subscription);
    } else {
      existing[existingIndex] = subscription;
    }
    
    this.subscriptions.set(userKey, existing);
  }

  async unregisterPushSubscription(userId: string, tenantId: string, endpoint: string): Promise<void> {
    const userKey = `${tenantId}:${userId}`;
    const existing = this.subscriptions.get(userKey) || [];
    
    const filtered = existing.filter(s => s.endpoint !== endpoint);
    this.subscriptions.set(userKey, filtered);
  }

  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendBulkNotification(
    userIds: string[],
    tenantId: string,
    payload: Omit<PushNotificationPayload, 'userId' | 'tenantId'>
  ): Promise<void> {
    for (const userId of userIds) {
      await this.send({
        ...payload,
        userId,
        tenantId,
      });
    }
  }

  async sendTaskAssignedNotification(
    assigneeId: string,
    tenantId: string,
    taskData: { taskId: string; taskTitle: string; projectName: string; assignedBy: string }
  ): Promise<void> {
    await this.send({
      userId: assigneeId,
      tenantId,
      title: 'Nova tarefa atribuída',
      body: `Você foi designado para a tarefa "${taskData.taskTitle}" no projeto ${taskData.projectName}`,
      type: 'task_assigned',
      data: {
        taskId: taskData.taskId,
        actionUrl: `/tarefas/${taskData.taskId}`,
      },
      priority: 'normal',
      channels: ['in_app', 'email'],
    });
  }

  async sendDeadlineReminderNotification(
    userId: string,
    tenantId: string,
    itemData: { type: 'task' | 'project'; id: string; title: string; deadline: Date }
  ): Promise<void> {
    const daysUntil = Math.ceil((itemData.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    await this.send({
      userId,
      tenantId,
      title: 'Lembrete de prazo',
      body: `${itemData.type === 'task' ? 'A tarefa' : 'O projeto'} "${itemData.title}" vence em ${daysUntil} ${daysUntil === 1 ? 'dia' : 'dias'}`,
      type: 'deadline_reminder',
      data: {
        itemId: itemData.id,
        itemType: itemData.type,
        actionUrl: `/${itemData.type === 'task' ? 'tarefas' : 'projetos'}/${itemData.id}`,
      },
      priority: daysUntil <= 1 ? 'high' : 'normal',
      channels: ['in_app', 'email'],
    });
  }
}

export const pushNotificationService = new PushNotificationService();
