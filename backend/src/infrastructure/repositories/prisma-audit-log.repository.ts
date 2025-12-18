import { PrismaClient, Prisma } from '@prisma/client';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IAuditLogRepository, AuditLogRecord } from '@/core/interfaces/repositories';
import { AuditFilters } from '@/core/interfaces/services';

@injectable()
export class PrismaAuditLogRepository implements IAuditLogRepository {
  constructor(
    @inject(TYPES.PrismaClient) private readonly prisma: PrismaClient
  ) {}

  async create(entry: AuditLogRecord): Promise<void> {
    try {
      const tenantId = entry.tenantId && entry.tenantId !== 'unknown' ? entry.tenantId : null;
      
      const userExists = await this.prisma.user.findUnique({
        where: { userId: entry.userId },
        select: { userId: true }
      });

      if (!userExists) {
        const adminUser = await this.prisma.user.findFirst({
          where: { role: 'tenant_admin' },
          select: { userId: true }
        });
        
        if (!adminUser) {
          return;
        }
        
        entry.userId = adminUser.userId;
      }
      
      await this.prisma.auditLog.create({
        data: {
          id: entry.id,
          tenantId,
          userId: entry.userId,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId ?? null,
          details: entry.details,
          ipAddress: entry.ipAddress ?? null,
          userAgent: entry.userAgent ?? null,
          metadata: entry.metadata ?? {},
          createdAt: entry.createdAt ?? new Date(),
        }
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  async findMany(filters: AuditFilters): Promise<{ logs: AuditLogRecord[]; total: number }> {
    const where: Prisma.AuditLogWhereInput = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.resource) {
      where.resource = filters.resource;
    }

    if (filters.tenantId) {
      where.tenantId = filters.tenantId;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};

      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }

      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const take = filters.limit && filters.limit > 0 ? filters.limit : 50;
    const skip = filters.offset && filters.offset > 0 ? filters.offset : 0;

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      this.prisma.auditLog.count({ where })
    ]);

    const mapped: AuditLogRecord[] = logs.map(log => ({
      id: log.id,
      tenantId: log.tenantId,
      userId: log.userId,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId ?? undefined,
      details: log.details,
      ipAddress: log.ipAddress ?? undefined,
      userAgent: log.userAgent ?? undefined,
      metadata: log.metadata ?? {},
      createdAt: log.createdAt,
      updatedAt: log.createdAt,
    }));

    return { logs: mapped, total };
  }
}


