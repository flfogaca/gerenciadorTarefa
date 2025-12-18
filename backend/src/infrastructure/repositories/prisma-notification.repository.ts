import { PrismaClient, Prisma } from '@prisma/client';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { INotificationRepository, NotificationRecord } from '@/core/interfaces/repositories';

@injectable()
export class PrismaNotificationRepository implements INotificationRepository {
  constructor(
    @inject(TYPES.PrismaClient) private readonly prisma: PrismaClient
  ) {}

  async create(entry: NotificationRecord): Promise<void> {
    await this.prisma.notification.create({
      data: {
        id: entry.id,
        tenantId: entry.tenantId ?? null,
        userId: entry.userId ?? null,
        type: entry.type,
        title: entry.title ?? null,
        message: entry.message ?? null,
        data: entry.data ?? {},
        channel: entry.channel,
        status: entry.status,
        priority: entry.priority ?? 'normal',
        readAt: entry.readAt ?? null,
        sentAt: entry.sentAt ?? null,
        createdAt: entry.createdAt ?? new Date(),
      }
    });
  }

  async updateStatus(notificationId: string, status: string, extras?: { readAt?: Date | null; sentAt?: Date | null }): Promise<void> {
    const data: Prisma.NotificationUpdateInput = {
      status,
    };

    if (extras?.readAt !== undefined) {
      data.readAt = extras.readAt;
    }

    if (extras?.sentAt !== undefined) {
      data.sentAt = extras.sentAt;
    }

    await this.prisma.notification.update({
      where: { id: notificationId },
      data
    });
  }

  async findByUser(userId: string): Promise<NotificationRecord[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: [
        { readAt: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return notifications.map(notification => ({
      id: notification.id,
      tenantId: notification.tenantId ?? undefined,
      userId: notification.userId ?? undefined,
      type: notification.type,
      title: notification.title ?? undefined,
      message: notification.message ?? undefined,
      data: notification.data ?? {},
      channel: notification.channel,
      status: notification.status,
      priority: notification.priority ?? undefined,
      readAt: notification.readAt ?? undefined,
      sentAt: notification.sentAt ?? undefined,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    }));
  }
}


