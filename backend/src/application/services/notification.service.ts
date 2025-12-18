import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { INotificationService } from '@/core/interfaces/services';
import { ILogger } from '@/shared/logging/logger';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { INotificationRepository, NotificationRecord } from '@/core/interfaces/repositories';

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
  variables: string[];
}

export interface NotificationChannel {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

export interface NotificationPreferences {
  userId: string;
  channels: NotificationChannel;
  types: {
    taskAssigned: boolean;
    taskCompleted: boolean;
    projectUpdated: boolean;
    deadlineApproaching: boolean;
    systemAlert: boolean;
  };
}

@injectable()
export class NotificationService implements INotificationService {
  private emailTransporter!: nodemailer.Transporter;
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor(
    @inject(TYPES.Logger) private readonly logger: ILogger,
    @inject(TYPES.NotificationRepository) private readonly notificationRepository: INotificationRepository
  ) {
    this.initializeEmailTransporter();
    this.loadTemplates();
  }

  private initializeEmailTransporter(): void {
    this.emailTransporter = nodemailer.createTransport({
      host: process.env['SMTP_HOST'],
      port: parseInt(process.env['SMTP_PORT'] || '587'),
      secure: false,
      auth: {
        user: process.env['SMTP_USER'],
        pass: process.env['SMTP_PASS']
      }
    });
  }

  private loadTemplates(): void {
    this.templates.set('task-assigned', {
      id: 'task-assigned',
      name: 'Task Assigned',
      subject: 'Nova tarefa atribuída: {{taskTitle}}',
      htmlTemplate: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Nova Tarefa Atribuída</h2>
          <p>Olá {{userName}},</p>
          <p>Uma nova tarefa foi atribuída a você:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>{{taskTitle}}</h3>
            <p><strong>Projeto:</strong> {{projectName}}</p>
            <p><strong>Prioridade:</strong> {{priority}}</p>
            <p><strong>Prazo:</strong> {{dueDate}}</p>
            <p><strong>Descrição:</strong> {{description}}</p>
          </div>
          <p>Acesse o sistema para mais detalhes.</p>
          <p>Equipe GestorPro</p>
        </div>
      `,
      textTemplate: `
        Nova Tarefa Atribuída
        
        Olá {{userName}},
        
        Uma nova tarefa foi atribuída a você:
        
        Título: {{taskTitle}}
        Projeto: {{projectName}}
        Prioridade: {{priority}}
        Prazo: {{dueDate}}
        Descrição: {{description}}
        
        Acesse o sistema para mais detalhes.
        
        Equipe GestorPro
      `,
      variables: ['userName', 'taskTitle', 'projectName', 'priority', 'dueDate', 'description']
    });

    this.templates.set('task-completed', {
      id: 'task-completed',
      name: 'Task Completed',
      subject: 'Tarefa concluída: {{taskTitle}}',
      htmlTemplate: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Tarefa Concluída</h2>
          <p>Olá {{userName}},</p>
          <p>A tarefa foi concluída com sucesso:</p>
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>{{taskTitle}}</h3>
            <p><strong>Projeto:</strong> {{projectName}}</p>
            <p><strong>Concluída em:</strong> {{completedAt}}</p>
          </div>
          <p>Parabéns pelo trabalho!</p>
          <p>Equipe GestorPro</p>
        </div>
      `,
      textTemplate: `
        Tarefa Concluída
        
        Olá {{userName}},
        
        A tarefa foi concluída com sucesso:
        
        Título: {{taskTitle}}
        Projeto: {{projectName}}
        Concluída em: {{completedAt}}
        
        Parabéns pelo trabalho!
        
        Equipe GestorPro
      `,
      variables: ['userName', 'taskTitle', 'projectName', 'completedAt']
    });

    this.templates.set('deadline-approaching', {
      id: 'deadline-approaching',
      name: 'Deadline Approaching',
      subject: 'Prazo se aproximando: {{taskTitle}}',
      htmlTemplate: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Prazo se Aproximando</h2>
          <p>Olá {{userName}},</p>
          <p>O prazo da seguinte tarefa está se aproximando:</p>
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3>{{taskTitle}}</h3>
            <p><strong>Projeto:</strong> {{projectName}}</p>
            <p><strong>Prazo:</strong> {{dueDate}}</p>
            <p><strong>Dias restantes:</strong> {{daysRemaining}}</p>
          </div>
          <p>Não deixe para a última hora!</p>
          <p>Equipe GestorPro</p>
        </div>
      `,
      textTemplate: `
        Prazo se Aproximando
        
        Olá {{userName}},
        
        O prazo da seguinte tarefa está se aproximando:
        
        Título: {{taskTitle}}
        Projeto: {{projectName}}
        Prazo: {{dueDate}}
        Dias restantes: {{daysRemaining}}
        
        Não deixe para a última hora!
        
        Equipe GestorPro
      `,
      variables: ['userName', 'taskTitle', 'projectName', 'dueDate', 'daysRemaining']
    });
  }

  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    try {
      this.logger.info('Sending email notification', { to, subject });

      const mailOptions = {
        from: process.env['SMTP_FROM'],
        to,
        subject,
        html: content,
        text: content.replace(/<[^>]*>/g, '')
      };

      await this.emailTransporter.sendMail(mailOptions);
      
      this.logger.info('Email sent successfully', { to, subject });
    } catch (error) {
      this.logger.error('Failed to send email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        to,
        subject
      });
      throw error;
    }
  }

  async sendPushNotification(userId: string, title: string, message: string): Promise<void> {
    try {
      this.logger.info('Sending push notification', { userId, title });

      const notification = {
        id: uuidv4(),
        userId,
        title,
        message,
        type: 'push',
        channel: 'push',
        sentAt: new Date(),
        status: 'sent',
        data: { title, message, channel: 'push' }
      };

      await this.saveNotification(notification);
      
      this.logger.info('Push notification sent successfully', { userId, title });
    } catch (error) {
      this.logger.error('Failed to send push notification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        title
      });
      throw error;
    }
  }

  async sendSMS(phone: string, message: string): Promise<void> {
    try {
      this.logger.info('Sending SMS notification', { phone });

      const notification = {
        id: uuidv4(),
        phone,
        message,
        type: 'sms',
        channel: 'sms',
        sentAt: new Date(),
        status: 'sent',
        data: { phone, message, channel: 'sms' }
      };

      await this.saveNotification(notification);
      
      this.logger.info('SMS sent successfully', { phone });
    } catch (error) {
      this.logger.error('Failed to send SMS', {
        error: error instanceof Error ? error.message : 'Unknown error',
        phone
      });
      throw error;
    }
  }

  async createNotification(userId: string, type: string, data: any): Promise<void> {
    try {
      this.logger.info('Creating notification', { userId, type });

      const template = this.templates.get(type);
      if (!template) {
        throw new Error(`Notification template '${type}' not found`);
      }

      const notification = {
        id: uuidv4(),
        userId,
        type,
        data,
        createdAt: new Date(),
        status: 'pending',
        channel: 'in_app'
      };

      await this.saveNotification(notification);
      
      this.logger.info('Notification created successfully', { userId, type });
    } catch (error) {
      this.logger.error('Failed to create notification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        type
      });
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      this.logger.info('Marking notification as read', { notificationId });

      await this.updateNotificationStatus(notificationId, 'read', { readAt: new Date() });
      
      this.logger.info('Notification marked as read', { notificationId });
    } catch (error) {
      this.logger.error('Failed to mark notification as read', {
        error: error instanceof Error ? error.message : 'Unknown error',
        notificationId
      });
      throw error;
    }
  }

  async getUserNotifications(userId: string): Promise<any[]> {
    try {
      this.logger.info('Getting user notifications', { userId });

      const notifications = await this.getNotificationsByUser(userId);
      
      this.logger.info('User notifications retrieved', { userId, count: notifications.length });
      
      return notifications;
    } catch (error) {
      this.logger.error('Failed to get user notifications', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }

  async sendTaskAssignedNotification(userId: string, taskData: any): Promise<void> {
    const template = this.templates.get('task-assigned');
    if (!template) return;

    const subject = this.replaceVariables(template.subject, taskData);
    const content = this.replaceVariables(template.htmlTemplate, taskData);

    await this.sendEmail(taskData.userEmail, subject, content);
    await this.createNotification(userId, 'task-assigned', taskData);
  }

  async sendTaskCompletedNotification(userId: string, taskData: any): Promise<void> {
    const template = this.templates.get('task-completed');
    if (!template) return;

    const subject = this.replaceVariables(template.subject, taskData);
    const content = this.replaceVariables(template.htmlTemplate, taskData);

    await this.sendEmail(taskData.userEmail, subject, content);
    await this.createNotification(userId, 'task-completed', taskData);
  }

  async sendDeadlineApproachingNotification(userId: string, taskData: any): Promise<void> {
    const template = this.templates.get('deadline-approaching');
    if (!template) return;

    const subject = this.replaceVariables(template.subject, taskData);
    const content = this.replaceVariables(template.htmlTemplate, taskData);

    await this.sendEmail(taskData.userEmail, subject, content);
    await this.createNotification(userId, 'deadline-approaching', taskData);
  }

  private replaceVariables(template: string, data: any): string {
    let result = template;
    
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, data[key] || '');
    });

    return result;
  }

  private async saveNotification(notification: any): Promise<void> {
    const record: NotificationRecord = {
      id: notification.id ?? uuidv4(),
      tenantId: notification.tenantId ?? notification.data?.tenantId ?? null,
      userId: notification.userId ?? notification.data?.userId ?? null,
      type: notification.type ?? 'generic',
      title: notification.title ?? notification.data?.title ?? null,
      message: notification.message ?? notification.data?.message ?? null,
      data: notification.data ?? {},
      channel: notification.channel ?? notification.deliveryChannel ?? 'in_app',
      status: notification.status ?? 'pending',
      priority: notification.priority ?? 'normal',
      readAt: notification.readAt ?? null,
      sentAt: notification.sentAt ?? null,
      createdAt: notification.createdAt ?? new Date()
    };

    await this.notificationRepository.create(record);
    this.logger.debug('Notification persisted', { notificationId: record.id, channel: record.channel });
  }

  private async updateNotificationStatus(notificationId: string, status: string, extras?: { readAt?: Date | null; sentAt?: Date | null }): Promise<void> {
    await this.notificationRepository.updateStatus(notificationId, status, extras);
    this.logger.debug('Notification status updated', { notificationId, status });
  }

  private async getNotificationsByUser(userId: string): Promise<any[]> {
    const notifications = await this.notificationRepository.findByUser(userId);
    return notifications.map(notification => ({
      ...notification,
      isRead: notification.readAt !== undefined && notification.readAt !== null,
    }));
  }
}
