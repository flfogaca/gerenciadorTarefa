import { BaseEntity, TenantId, UserId, ProjectId, TaskId, TaskStatus, TaskPriority } from '../base';
import { TenantIdVO } from './tenant';

export class TaskIdVO extends TenantIdVO {
  constructor(value: string) {
    super(value);
  }
}

export class Task extends BaseEntity {
  constructor(
    public readonly id: string,
    public readonly taskId: TaskId,
    public readonly tenantId: TenantId,
    public readonly projectId: ProjectId,
    public readonly title: string,
    public readonly description: string,
    public readonly assigneeId: UserId,
    public readonly reporterId: UserId,
    public readonly status: TaskStatus,
    public readonly priority: TaskPriority,
    public readonly dueDate: Date,
    public readonly estimatedHours: number,
    public readonly completedHours: number,
    public readonly tags: TaskTag[],
    public readonly attachments: TaskAttachment[],
    public readonly comments: TaskComment[],
    public readonly watchers: UserId[],
    public readonly subtasks: TaskSubtask[],
    public readonly timeTracking: TaskTimeTracking,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly isActive: boolean = true
  ) {
    super();
  }

  static create(
    taskId: TaskId,
    tenantId: TenantId,
    projectId: ProjectId,
    title: string,
    description: string,
    assigneeId: UserId,
    reporterId: UserId,
    priority: TaskPriority = TaskPriority.MEDIUM,
    dueDate?: Date
  ): Task {
    const now = new Date();
    const id = `task_${taskId.value}_${now.getTime()}`;
    const defaultDueDate = dueDate || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    
    return new Task(
      id,
      taskId,
      tenantId,
      projectId,
      title,
      description,
      assigneeId,
      reporterId,
      TaskStatus.TODO,
      priority,
      defaultDueDate,
      0, // estimatedHours
      0, // completedHours
      [], // tags
      [], // attachments
      [], // comments
      [], // watchers
      [], // subtasks
      TaskTimeTracking.empty(),
      now,
      now
    );
  }

  updateDetails(title: string, description: string): Task {
    return new Task(
      this.id,
      this.taskId,
      this.tenantId,
      this.projectId,
      title,
      description,
      this.assigneeId,
      this.reporterId,
      this.status,
      this.priority,
      this.dueDate,
      this.estimatedHours,
      this.completedHours,
      this.tags,
      this.attachments,
      this.comments,
      this.watchers,
      this.subtasks,
      this.timeTracking,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  changeStatus(newStatus: TaskStatus): Task {
    return new Task(
      this.id,
      this.taskId,
      this.tenantId,
      this.projectId,
      this.title,
      this.description,
      this.assigneeId,
      this.reporterId,
      newStatus,
      this.priority,
      this.dueDate,
      this.estimatedHours,
      this.completedHours,
      this.tags,
      this.attachments,
      this.comments,
      this.watchers,
      this.subtasks,
      this.timeTracking,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  changePriority(newPriority: TaskPriority): Task {
    return new Task(
      this.id,
      this.taskId,
      this.tenantId,
      this.projectId,
      this.title,
      this.description,
      this.assigneeId,
      this.reporterId,
      this.status,
      newPriority,
      this.dueDate,
      this.estimatedHours,
      this.completedHours,
      this.tags,
      this.attachments,
      this.comments,
      this.watchers,
      this.subtasks,
      this.timeTracking,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  reassign(newAssigneeId: UserId): Task {
    return new Task(
      this.id,
      this.taskId,
      this.tenantId,
      this.projectId,
      this.title,
      this.description,
      newAssigneeId,
      this.reporterId,
      this.status,
      this.priority,
      this.dueDate,
      this.estimatedHours,
      this.completedHours,
      this.tags,
      this.attachments,
      this.comments,
      this.watchers,
      this.subtasks,
      this.timeTracking,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  updateDueDate(newDueDate: Date): Task {
    return new Task(
      this.id,
      this.taskId,
      this.tenantId,
      this.projectId,
      this.title,
      this.description,
      this.assigneeId,
      this.reporterId,
      this.status,
      this.priority,
      newDueDate,
      this.estimatedHours,
      this.completedHours,
      this.tags,
      this.attachments,
      this.comments,
      this.watchers,
      this.subtasks,
      this.timeTracking,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  updateEstimation(newEstimatedHours: number): Task {
    return new Task(
      this.id,
      this.taskId,
      this.tenantId,
      this.projectId,
      this.title,
      this.description,
      this.assigneeId,
      this.reporterId,
      this.status,
      this.priority,
      this.dueDate,
      newEstimatedHours,
      this.completedHours,
      this.tags,
      this.attachments,
      this.comments,
      this.watchers,
      this.subtasks,
      this.timeTracking,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  addTag(tag: TaskTag): Task {
    const existingTag = this.tags.find(t => t.name === tag.name);
    
    if (existingTag) {
      return this;
    }

    return new Task(
      this.id,
      this.taskId,
      this.tenantId,
      this.projectId,
      this.title,
      this.description,
      this.assigneeId,
      this.reporterId,
      this.status,
      this.priority,
      this.dueDate,
      this.estimatedHours,
      this.completedHours,
      [...this.tags, tag],
      this.attachments,
      this.comments,
      this.watchers,
      this.subtasks,
      this.timeTracking,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  removeTag(tagName: string): Task {
    const filteredTags = this.tags.filter(t => t.name !== tagName);

    return new Task(
      this.id,
      this.taskId,
      this.tenantId,
      this.projectId,
      this.title,
      this.description,
      this.assigneeId,
      this.reporterId,
      this.status,
      this.priority,
      this.dueDate,
      this.estimatedHours,
      this.completedHours,
      filteredTags,
      this.attachments,
      this.comments,
      this.watchers,
      this.subtasks,
      this.timeTracking,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  addAttachment(attachment: TaskAttachment): Task {
    return new Task(
      this.id,
      this.taskId,
      this.tenantId,
      this.projectId,
      this.title,
      this.description,
      this.assigneeId,
      this.reporterId,
      this.status,
      this.priority,
      this.dueDate,
      this.estimatedHours,
      this.completedHours,
      this.tags,
      [...this.attachments, attachment],
      this.comments,
      this.watchers,
      this.subtasks,
      this.timeTracking,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  removeAttachment(attachmentId: string): Task {
    return new Task(
      this.id,
      this.taskId,
      this.tenantId,
      this.projectId,
      this.title,
      this.description,
      this.assigneeId,
      this.reporterId,
      this.status,
      this.priority,
      this.dueDate,
      this.estimatedHours,
      this.completedHours,
      this.tags,
      this.attachments.filter(att => att.id !== attachmentId),
      this.comments,
      this.watchers,
      this.subtasks,
      this.timeTracking,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  addComment(comment: TaskComment): Task {
    return new Task(
      this.id,
      this.taskId,
      this.tenantId,
      this.projectId,
      this.title,
      this.description,
      this.assigneeId,
      this.reporterId,
      this.status,
      this.priority,
      this.dueDate,
      this.estimatedHours,
      this.completedHours,
      this.tags,
      this.attachments,
      [...this.comments, comment],
      this.watchers,
      this.subtasks,
      this.timeTracking,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  addWatcher(userId: UserId): Task {
    const existingWatcher = this.watchers.find(w => w.equals(userId));
    
    if (existingWatcher) {
      return this;
    }

    return new Task(
      this.id,
      this.taskId,
      this.tenantId,
      this.projectId,
      this.title,
      this.description,
      this.assigneeId,
      this.reporterId,
      this.status,
      this.priority,
      this.dueDate,
      this.estimatedHours,
      this.completedHours,
      this.tags,
      this.attachments,
      this.comments,
      [...this.watchers, userId],
      this.subtasks,
      this.timeTracking,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  removeWatcher(userId: UserId): Task {
    const filteredWatchers = this.watchers.filter(w => !w.equals(userId));

    return new Task(
      this.id,
      this.taskId,
      this.tenantId,
      this.projectId,
      this.title,
      this.description,
      this.assigneeId,
      this.reporterId,
      this.status,
      this.priority,
      this.dueDate,
      this.estimatedHours,
      this.completedHours,
      this.tags,
      this.attachments,
      this.comments,
      filteredWatchers,
      this.subtasks,
      this.timeTracking,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  logTime(timeEntry: TaskTimeEntry): Task {
    const newTimeTracking = this.timeTracking.addEntry(timeEntry);
    const newCompletedHours = this.completedHours + timeEntry.duration;

    return new Task(
      this.id,
      this.taskId,
      this.tenantId,
      this.projectId,
      this.title,
      this.description,
      this.assigneeId,
      this.reporterId,
      this.status,
      this.priority,
      this.dueDate,
      this.estimatedHours,
      newCompletedHours,
      this.tags,
      this.attachments,
      this.comments,
      this.watchers,
      this.subtasks,
      newTimeTracking,
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  deactivate(): Task {
    return new Task(
      this.id,
      this.taskId,
      this.tenantId,
      this.projectId,
      this.title,
      this.description,
      this.assigneeId,
      this.reporterId,
      this.status,
      this.priority,
      this.dueDate,
      this.estimatedHours,
      this.completedHours,
      this.tags,
      this.attachments,
      this.comments,
      this.watchers,
      this.subtasks,
      this.timeTracking,
      this.createdAt,
      new Date(),
      false
    );
  }

  get isOverdue(): boolean {
    return new Date() > this.dueDate && this.status !== TaskStatus.DONE;
  }

  get progress(): number {
    if (this.status === TaskStatus.DONE) return 100;
    if (this.estimatedHours === 0) return 0;
    
    return Math.min(Math.round((this.completedHours / this.estimatedHours) * 100), 100);
  }

  get remainingHours(): number {
    return Math.max(this.estimatedHours - this.completedHours, 0);
  }

  get code(): string {
    return this.taskId.value;
  }
}

export interface TaskTag {
  readonly name: string;
  readonly color: string;
  readonly description?: string;
}

export interface TaskAttachment {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly size: number;
  readonly url: string;
  readonly uploadedAt: Date;
  readonly uploadedBy: UserId;
}

export interface TaskComment {
  readonly id: string;
  readonly content: string;
  readonly authorId: UserId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly isEdited: boolean;
}

export interface TaskSubtask {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly completedAt?: Date;
}

export interface TaskTimeTracking {
  readonly entries: TaskTimeEntry[];
  readonly totalTime: number;
}

export interface TaskTimeEntry {
  readonly id: string;
  readonly userId: UserId;
  readonly duration: number; // in hours
  readonly description?: string;
  readonly loggedAt: Date;
}

export class TaskTimeTracking {
  constructor(
    public readonly entries: TaskTimeEntry[],
    public readonly totalTime: number
  ) {}

  static empty(): TaskTimeTracking {
    return new TaskTimeTracking([], 0);
  }

  addEntry(entry: TaskTimeEntry): TaskTimeTracking {
    return new TaskTimeTracking(
      [...this.entries, entry],
      this.totalTime + entry.duration
    );
  }
}
