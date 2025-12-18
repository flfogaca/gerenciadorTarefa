import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { ITaskRepository } from '@/core/interfaces/repositories';
import { Task, TaskIdVO } from '@/core/entities/task';
import { TaskStatus, TaskPriority } from '@/core/base';
import { TenantIdVO, UserIdVO } from '@/core/entities/tenant';

@injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(
    @inject(TYPES.PrismaClient) private readonly prisma: PrismaClient
  ) {}

  async findById(id: string): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: true,
        reporter: true,
        comments: {
          include: {
            user: true
          }
        },
        timeEntries: {
          include: {
            user: true
          }
        }
      }
    });

    if (!task) return null;

    return this.mapToDomain(task);
  }

  async findByTaskId(taskId: TaskIdVO): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: { taskId: taskId.value },
      include: {
        assignee: true,
        reporter: true,
        comments: {
          include: {
            user: true
          }
        },
        timeEntries: {
          include: {
            user: true
          }
        }
      }
    });

    if (!task) return null;

    return this.mapToDomain(task);
  }

  async findByProjectId(projectId: TenantIdVO): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { projectId: projectId.value },
      include: {
        assignee: true,
        reporter: true,
        comments: {
          include: {
            user: true
          }
        },
        timeEntries: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return tasks.map(task => this.mapToDomain(task));
  }

  async findByAssigneeId(assigneeId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { assigneeId: assigneeId },
      include: {
        assignee: true,
        reporter: true,
        comments: {
          include: {
            user: true
          }
        },
        timeEntries: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return tasks.map(task => this.mapToDomain(task));
  }

  async findByReporterId(reporterId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { reporterId: reporterId },
      include: {
        assignee: true,
        reporter: true,
        comments: {
          include: {
            user: true
          }
        },
        timeEntries: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return tasks.map(task => this.mapToDomain(task));
  }

  async findByStatus(status: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { status: status as any },
      include: {
        assignee: true,
        reporter: true,
        comments: {
          include: {
            user: true
          }
        },
        timeEntries: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return tasks.map(task => this.mapToDomain(task));
  }

  async findByPriority(priority: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { priority: priority as any },
      include: {
        assignee: true,
        reporter: true,
        comments: {
          include: {
            user: true
          }
        },
        timeEntries: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return tasks.map(task => this.mapToDomain(task));
  }

  async findByTenantId(tenantId: TenantIdVO): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { tenantId: tenantId.value },
      include: {
        assignee: true,
        reporter: true,
        comments: {
          include: {
            user: true
          }
        },
        timeEntries: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return tasks.map(task => this.mapToDomain(task));
  }

  async findOverdueTasks(): Promise<Task[]> {
    const now = new Date();
    const tasks = await this.prisma.task.findMany({
      where: {
        AND: [
          { isActive: true },
          { status: { not: 'done' } },
          { dueDate: { lt: now } }
        ]
      },
      include: {
        assignee: true,
        reporter: true,
        comments: {
          include: {
            user: true
          }
        },
        timeEntries: {
          include: {
            user: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    return tasks.map(task => this.mapToDomain(task));
  }

  async findByWatcher(userId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        watchers: {
          path: ['watchers'],
          array_contains: [userId]
        }
      },
      include: {
        assignee: true,
        reporter: true,
        comments: {
          include: {
            user: true
          }
        },
        timeEntries: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return tasks.map(task => this.mapToDomain(task));
  }

  async findByTag(tagName: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        tags: {
          path: ['tags'],
          array_contains: [{ name: tagName }]
        }
      },
      include: {
        assignee: true,
        reporter: true,
        comments: {
          include: {
            user: true
          }
        },
        timeEntries: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return tasks.map(task => this.mapToDomain(task));
  }

  async findTasksDueSoon(days: number): Promise<Task[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const tasks = await this.prisma.task.findMany({
      where: {
        AND: [
          { isActive: true },
          { status: { not: 'done' } },
          { dueDate: { gte: now } },
          { dueDate: { lte: futureDate } }
        ]
      },
      include: {
        assignee: true,
        reporter: true,
        comments: {
          include: {
            user: true
          }
        },
        timeEntries: {
          include: {
            user: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    return tasks.map(task => this.mapToDomain(task));
  }

  async findAll(): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      include: {
        assignee: true,
        reporter: true,
        comments: {
          include: {
            user: true
          }
        },
        timeEntries: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return tasks.map(task => this.mapToDomain(task));
  }

  async save(entity: Task): Promise<Task> {
    const task = await this.prisma.task.create({
      data: {
        id: entity.id,
        taskId: entity.taskId.value,
        tenantId: entity.tenantId.value,
        projectId: entity.projectId.value,
        title: entity.title,
        description: entity.description,
        assigneeId: entity.assigneeId.value,
        reporterId: entity.reporterId.value,
        status: entity.status as any,
        priority: entity.priority as any,
        dueDate: entity.dueDate,
        estimatedHours: entity.estimatedHours,
        completedHours: entity.completedHours,
        tags: entity.tags as any,
        attachments: entity.attachments as any,
        watchers: entity.watchers.map(w => w.value) as any,
        subtasks: entity.subtasks as any,
        timeTracking: entity.timeTracking as any,
        isActive: entity.isActive,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt
      }
    });

    return this.mapToDomain(task);
  }

  async update(entity: Task): Promise<Task> {
    const task = await this.prisma.task.update({
      where: { id: entity.id },
      data: {
        title: entity.title,
        description: entity.description,
        assigneeId: entity.assigneeId.value,
        reporterId: entity.reporterId.value,
        status: entity.status as any,
        priority: entity.priority as any,
        dueDate: entity.dueDate,
        estimatedHours: entity.estimatedHours,
        completedHours: entity.completedHours,
        tags: entity.tags as any,
        attachments: entity.attachments as any,
        watchers: entity.watchers.map(w => w.value) as any,
        subtasks: entity.subtasks as any,
        timeTracking: entity.timeTracking as any,
        isActive: entity.isActive,
        updatedAt: entity.updatedAt
      }
    });

    return this.mapToDomain(task);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({
      where: { id }
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.task.count({
      where: { id }
    });

    return count > 0;
  }

  private mapToDomain(task: any): Task {
    if (!task) {
      throw new Error('Task data is null or undefined');
    }

    if (!task.taskId) {
      throw new Error(`Task taskId is missing for task ${task.id}`);
    }

    if (!task.tenantId) {
      throw new Error(`Task tenantId is missing for task ${task.id}`);
    }

    if (!task.projectId) {
      throw new Error(`Task projectId is missing for task ${task.id}`);
    }

    if (!task.assigneeId) {
      throw new Error(`Task assigneeId is missing for task ${task.id}`);
    }

    if (!task.reporterId) {
      throw new Error(`Task reporterId is missing for task ${task.id}`);
    }

    return new Task(
      task.id,
      new TaskIdVO(task.taskId),
      new TenantIdVO(task.tenantId),
      new TenantIdVO(task.projectId),
      task.title || '',
      task.description || '',
      new UserIdVO(task.assigneeId),
      new UserIdVO(task.reporterId),
      task.status as TaskStatus,
      task.priority as TaskPriority,
      task.dueDate ? new Date(task.dueDate) : new Date(),
      task.estimatedHours || 0,
      task.completedHours || 0,
      task.tags || [],
      task.attachments || [],
      task.comments || [],
      (task.watchers || []).map((w: string) => new UserIdVO(w)),
      task.subtasks || [],
      task.timeTracking || {},
      task.createdAt ? new Date(task.createdAt) : new Date(),
      task.updatedAt ? new Date(task.updatedAt) : new Date(),
      task.isActive !== undefined ? task.isActive : true
    );
  }
}
