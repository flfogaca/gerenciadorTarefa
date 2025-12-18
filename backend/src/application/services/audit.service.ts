import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IAuditService, AuditFilters } from '@/core/interfaces/services';
import { ILogger } from '@/shared/logging/logger';
import { v4 as uuidv4 } from 'uuid';
import { IAuditLogRepository, AuditLogRecord } from '@/core/interfaces/repositories';

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  tenantId: string;
  timestamp: Date;
  metadata?: any;
}

export interface AuditLogSearchResult {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
}

@injectable()
export class AuditService implements IAuditService {
  constructor(
    @inject(TYPES.Logger) private readonly logger: ILogger,
    @inject(TYPES.AuditLogRepository) private readonly auditLogRepository: IAuditLogRepository
  ) {}

  async logAction(userId: string, action: string, resource: string, details: any): Promise<void> {
    try {
      this.logger.info('Logging audit action', { userId, action, resource });

      const auditLog: AuditLogEntry = {
        id: uuidv4(),
        userId,
        action,
        resource,
        resourceId: details.id || details.resourceId || 'unknown',
        details,
        ipAddress: details.ipAddress,
        userAgent: details.userAgent,
        tenantId: details.tenantId || null,
        timestamp: new Date(),
        metadata: {
          version: '1.0',
          source: 'api'
        }
      };

      await this.saveAuditLog(auditLog);
      
      this.logger.info('Audit action logged successfully', { 
        auditLogId: auditLog.id,
        userId, 
        action, 
        resource 
      });
    } catch (error) {
      this.logger.error('Failed to log audit action', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        action,
        resource
      });
      throw error;
    }
  }

  async getAuditLogs(filters: AuditFilters): Promise<any[]> {
    try {
      this.logger.info('Getting audit logs', { filters });

      const logs = await this.searchAuditLogs(filters);
      
      this.logger.info('Audit logs retrieved', { count: logs.length });
      
      return logs;
    } catch (error) {
      this.logger.error('Failed to get audit logs', {
        error: error instanceof Error ? error.message : 'Unknown error',
        filters
      });
      throw error;
    }
  }

  async getUserAuditLogs(userId: string): Promise<any[]> {
    try {
      this.logger.info('Getting user audit logs', { userId });

      const logs = await this.searchAuditLogs({ userId });
      
      this.logger.info('User audit logs retrieved', { userId, count: logs.length });
      
      return logs;
    } catch (error) {
      this.logger.error('Failed to get user audit logs', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }

  async logUserLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logAction(userId, 'LOGIN', 'user', {
      id: userId,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString()
    });
  }

  async logUserLogout(userId: string, ipAddress?: string): Promise<void> {
    await this.logAction(userId, 'LOGOUT', 'user', {
      id: userId,
      ipAddress,
      timestamp: new Date().toISOString()
    });
  }

  async logUserCreated(userId: string, createdBy: string, userData: any): Promise<void> {
    await this.logAction(createdBy, 'CREATE', 'user', {
      id: userId,
      targetUserId: userId,
      userData: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role
      },
      timestamp: new Date().toISOString()
    });
  }

  async logUserUpdated(userId: string, updatedBy: string, changes: any): Promise<void> {
    await this.logAction(updatedBy, 'UPDATE', 'user', {
      id: userId,
      targetUserId: userId,
      changes,
      timestamp: new Date().toISOString()
    });
  }

  async logUserDeleted(userId: string, deletedBy: string): Promise<void> {
    await this.logAction(deletedBy, 'DELETE', 'user', {
      id: userId,
      targetUserId: userId,
      timestamp: new Date().toISOString()
    });
  }

  async logProjectCreated(projectId: string, createdBy: string, projectData: any): Promise<void> {
    await this.logAction(createdBy, 'CREATE', 'project', {
      id: projectId,
      projectId,
      projectData: {
        name: projectData.name,
        description: projectData.description,
        clientId: projectData.clientId,
        managerId: projectData.managerId
      },
      timestamp: new Date().toISOString()
    });
  }

  async logProjectUpdated(projectId: string, updatedBy: string, changes: any): Promise<void> {
    await this.logAction(updatedBy, 'UPDATE', 'project', {
      id: projectId,
      projectId,
      changes,
      timestamp: new Date().toISOString()
    });
  }

  async logProjectDeleted(projectId: string, deletedBy: string): Promise<void> {
    await this.logAction(deletedBy, 'DELETE', 'project', {
      id: projectId,
      projectId,
      timestamp: new Date().toISOString()
    });
  }

  async logTaskCreated(taskId: string, createdBy: string, taskData: any): Promise<void> {
    await this.logAction(createdBy, 'CREATE', 'task', {
      id: taskId,
      taskId,
      taskData: {
        title: taskData.title,
        description: taskData.description,
        projectId: taskData.projectId,
        assigneeId: taskData.assigneeId,
        priority: taskData.priority
      },
      timestamp: new Date().toISOString()
    });
  }

  async logTaskUpdated(taskId: string, updatedBy: string, changes: any): Promise<void> {
    await this.logAction(updatedBy, 'UPDATE', 'task', {
      id: taskId,
      taskId,
      changes,
      timestamp: new Date().toISOString()
    });
  }

  async logTaskDeleted(taskId: string, deletedBy: string): Promise<void> {
    await this.logAction(deletedBy, 'DELETE', 'task', {
      id: taskId,
      taskId,
      timestamp: new Date().toISOString()
    });
  }

  async logTaskStatusChanged(taskId: string, changedBy: string, oldStatus: string, newStatus: string): Promise<void> {
    await this.logAction(changedBy, 'STATUS_CHANGE', 'task', {
      id: taskId,
      taskId,
      oldStatus,
      newStatus,
      timestamp: new Date().toISOString()
    });
  }

  async logTaskReassigned(taskId: string, reassignedBy: string, oldAssignee: string, newAssignee: string): Promise<void> {
    await this.logAction(reassignedBy, 'REASSIGN', 'task', {
      id: taskId,
      taskId,
      oldAssignee,
      newAssignee,
      timestamp: new Date().toISOString()
    });
  }

  async logTimeLogged(taskId: string, loggedBy: string, duration: number, description?: string): Promise<void> {
    await this.logAction(loggedBy, 'TIME_LOG', 'task', {
      id: taskId,
      taskId,
      duration,
      description,
      timestamp: new Date().toISOString()
    });
  }

  async logPermissionGranted(userId: string, grantedBy: string, resource: string, action: string): Promise<void> {
    await this.logAction(grantedBy, 'PERMISSION_GRANT', 'permission', {
      id: userId,
      targetUserId: userId,
      resource,
      action,
      timestamp: new Date().toISOString()
    });
  }

  async logPermissionRevoked(userId: string, revokedBy: string, resource: string, action: string): Promise<void> {
    await this.logAction(revokedBy, 'PERMISSION_REVOKE', 'permission', {
      id: userId,
      targetUserId: userId,
      resource,
      action,
      timestamp: new Date().toISOString()
    });
  }

  async logSecurityEvent(eventType: string, userId: string, details: any): Promise<void> {
    await this.logAction(userId, 'SECURITY_EVENT', 'security', {
      id: uuidv4(),
      eventType,
      details,
      timestamp: new Date().toISOString()
    });
  }

  async getAuditLogsByDateRange(startDate: Date, endDate: Date, tenantId?: string): Promise<AuditLogEntry[]> {
    try {
      this.logger.info('Getting audit logs by date range', { startDate, endDate, tenantId });

      const logs = await this.searchAuditLogs({
        startDate,
        endDate,
        tenantId: tenantId || undefined
      });
      
      this.logger.info('Audit logs by date range retrieved', { count: logs.length });
      
      return logs;
    } catch (error) {
      this.logger.error('Failed to get audit logs by date range', {
        error: error instanceof Error ? error.message : 'Unknown error',
        startDate,
        endDate,
        tenantId
      });
      throw error;
    }
  }

  async getAuditLogsByAction(action: string, tenantId?: string): Promise<AuditLogEntry[]> {
    try {
      this.logger.info('Getting audit logs by action', { action, tenantId });

      const logs = await this.searchAuditLogs({
        action,
        tenantId: tenantId || undefined
      });
      
      this.logger.info('Audit logs by action retrieved', { action, count: logs.length });
      
      return logs;
    } catch (error) {
      this.logger.error('Failed to get audit logs by action', {
        error: error instanceof Error ? error.message : 'Unknown error',
        action,
        tenantId
      });
      throw error;
    }
  }

  private async saveAuditLog(auditLog: AuditLogEntry): Promise<void> {
    const tenantId = auditLog.tenantId && auditLog.tenantId !== 'unknown' ? auditLog.tenantId : null;
    
    const record: AuditLogRecord = {
      id: auditLog.id,
      tenantId,
      userId: auditLog.userId,
      action: auditLog.action,
      resource: auditLog.resource,
      resourceId: auditLog.resourceId || null,
      details: auditLog.details,
      ipAddress: auditLog.ipAddress || null,
      userAgent: auditLog.userAgent || null,
      metadata: auditLog.metadata || {},
      createdAt: auditLog.timestamp,
    };

    await this.auditLogRepository.create(record);
    this.logger.info('Audit log saved', { auditLogId: auditLog.id });
  }

  private async searchAuditLogs(filters: AuditFilters): Promise<AuditLogEntry[]> {
    const { logs } = await this.auditLogRepository.findMany(filters);

    return logs.map(log => ({
      id: log.id,
      tenantId: log.tenantId || 'unknown',
      userId: log.userId,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId || 'unknown',
      details: log.details,
      ipAddress: log.ipAddress || undefined,
      userAgent: log.userAgent || undefined,
      timestamp: log.createdAt,
      metadata: log.metadata || {},
    }));
  }
}
