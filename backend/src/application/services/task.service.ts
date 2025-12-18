import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { ITaskService, CreateTaskDTO, UpdateTaskDTO, TaskStats } from '@/core/interfaces/services';
import { ITaskRepository } from '@/core/interfaces/repositories';
import { Task, TaskIdVO, TaskTag, TaskComment, TaskTimeEntry, TaskAttachment } from '@/core/entities/task';
import { TenantIdVO, UserIdVO } from '@/core/entities/tenant';
import { ProjectIdVO } from '@/core/entities/project';
import { TaskStatus, TaskPriority } from '@/core/base';
import { ILogger } from '@/shared/logging/logger';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class TaskService implements ITaskService {
  constructor(
    @inject(TYPES.TaskRepository) private readonly taskRepository: ITaskRepository,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  async create(dto: CreateTaskDTO): Promise<Task> {
    try {
      this.logger.info('Creating task', { taskId: dto.taskId, tenantId: dto.tenantId });

      const tenantId = new TenantIdVO(dto.tenantId);
      const taskId = new TaskIdVO(dto.taskId);
      const projectId = new ProjectIdVO(dto.projectId);
      
      const existingTask = await this.taskRepository.findByTaskId(taskId);
      if (existingTask) {
        throw new Error(`Task with ID ${dto.taskId} already exists`);
      }

      const task = Task.create(
        taskId,
        tenantId,
        projectId,
        dto.title,
        dto.description,
        new UserIdVO(dto.assigneeId),
        new UserIdVO(dto.reporterId),
        dto.priority || TaskPriority.MEDIUM,
        dto.dueDate
      );

      if (dto.estimatedHours) {
        const updatedTask = task.updateEstimation(dto.estimatedHours);
        const savedTask = await this.taskRepository.save(updatedTask);
        
        this.logger.info('Task created successfully', { 
          taskId: savedTask.taskId.value,
          title: savedTask.title,
          tenantId: savedTask.tenantId.value
        });

        return savedTask;
      }

      const savedTask = await this.taskRepository.save(task);
      
      this.logger.info('Task created successfully', { 
        taskId: savedTask.taskId.value,
        title: savedTask.title,
        tenantId: savedTask.tenantId.value
      });

      return savedTask;
    } catch (error) {
      this.logger.error('Failed to create task', {
        error: error instanceof Error ? error.message : 'Unknown error',
        taskId: dto.taskId,
        tenantId: dto.tenantId
      });
      throw error;
    }
  }

  async update(id: string, dto: UpdateTaskDTO): Promise<Task> {
    try {
      this.logger.info('Updating task', { taskId: id });

      const task = await this.taskRepository.findById(id);
      if (!task) {
        throw new Error(`Task with ID ${id} not found`);
      }

      let updatedTask = task;

      if (dto.title || dto.description) {
        updatedTask = updatedTask.updateDetails(
          dto.title || updatedTask.title,
          dto.description || updatedTask.description
        );
      }

      if (dto.assigneeId) {
        updatedTask = updatedTask.reassign(new UserIdVO(dto.assigneeId));
      }

      if (dto.priority) {
        updatedTask = updatedTask.changePriority(dto.priority);
      }

      if (dto.dueDate) {
        updatedTask = updatedTask.updateDueDate(dto.dueDate);
      }

      if (dto.estimatedHours !== undefined) {
        updatedTask = updatedTask.updateEstimation(dto.estimatedHours);
      }

      if (dto.attachments !== undefined) {
        const currentAttachmentIds = new Set(updatedTask.attachments.map(att => att.id));
        const newAttachmentIds = new Set(dto.attachments.map((att: any) => att.id));
        
        const attachmentsToAdd = dto.attachments.filter(
          (att: any) => !currentAttachmentIds.has(att.id)
        );
        
        const attachmentsToRemove = updatedTask.attachments.filter(
          att => !newAttachmentIds.has(att.id)
        );
        
        for (const attachmentData of attachmentsToAdd) {
          const attachment: TaskAttachment = {
            id: attachmentData.id,
            name: attachmentData.name,
            type: attachmentData.mimeType || attachmentData.type || 'application/octet-stream',
            size: attachmentData.size,
            url: attachmentData.url,
            uploadedAt: new Date(attachmentData.uploadedAt || Date.now()),
            uploadedBy: new UserIdVO(attachmentData.uploadedBy || '')
          };
          updatedTask = updatedTask.addAttachment(attachment);
        }
        
        for (const attachmentToRemove of attachmentsToRemove) {
          updatedTask = updatedTask.removeAttachment(attachmentToRemove.id);
        }
      }

      const savedTask = await this.taskRepository.update(updatedTask);
      
      this.logger.info('Task updated successfully', { 
        taskId: savedTask.taskId.value
      });

      return savedTask;
    } catch (error) {
      this.logger.error('Failed to update task', {
        error: error instanceof Error ? error.message : 'Unknown error',
        taskId: id
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.info('Deleting task', { taskId: id });

      const task = await this.taskRepository.findById(id);
      if (!task) {
        throw new Error(`Task with ID ${id} not found`);
      }

      await this.taskRepository.delete(id);
      
      this.logger.info('Task deleted successfully', { taskId: id });
    } catch (error) {
      this.logger.error('Failed to delete task', {
        error: error instanceof Error ? error.message : 'Unknown error',
        taskId: id
      });
      throw error;
    }
  }

  async findById(id: string): Promise<Task | null> {
    try {
      return await this.taskRepository.findById(id);
    } catch (error) {
      this.logger.error('Failed to find task by ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        taskId: id
      });
      throw error;
    }
  }

  async findAll(): Promise<Task[]> {
    try {
      return await this.taskRepository.findAll();
    } catch (error) {
      this.logger.error('Failed to find all tasks', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async findByTenantId(tenantId: TenantIdVO): Promise<Task[]> {
    try {
      return await this.taskRepository.findByTenantId(tenantId);
    } catch (error) {
      this.logger.error('Failed to find tasks by tenant ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: tenantId.value
      });
      throw error;
    }
  }

  async findByTaskId(taskId: string): Promise<Task | null> {
    try {
      const taskIdVO = new TaskIdVO(taskId);
      return await this.taskRepository.findByTaskId(taskIdVO);
    } catch (error) {
      this.logger.error('Failed to find task by task ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        taskId
      });
      throw error;
    }
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    try {
      const projectIdVO = new ProjectIdVO(projectId);
      return await this.taskRepository.findByProjectId(projectIdVO);
    } catch (error) {
      this.logger.error('Failed to find tasks by project ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId
      });
      throw error;
    }
  }

  async findByAssigneeId(assigneeId: string): Promise<Task[]> {
    try {
      return await this.taskRepository.findByAssigneeId(assigneeId);
    } catch (error) {
      this.logger.error('Failed to find tasks by assignee ID', {
        error: error instanceof Error ? error.message : 'Unknown error',
        assigneeId
      });
      throw error;
    }
  }

  async changeStatus(taskId: string, status: TaskStatus): Promise<Task> {
    try {
      this.logger.info('Changing task status', { taskId, status });

      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      const updatedTask = task.changeStatus(status);
      const savedTask = await this.taskRepository.update(updatedTask);

      this.logger.info('Task status changed successfully', { 
        taskId: savedTask.taskId.value,
        status: savedTask.status
      });

      return savedTask;
    } catch (error) {
      this.logger.error('Failed to change task status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        taskId,
        status
      });
      throw error;
    }
  }

  async changePriority(taskId: string, priority: TaskPriority): Promise<Task> {
    try {
      this.logger.info('Changing task priority', { taskId, priority });

      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      const updatedTask = task.changePriority(priority);
      const savedTask = await this.taskRepository.update(updatedTask);

      this.logger.info('Task priority changed successfully', { 
        taskId: savedTask.taskId.value,
        priority: savedTask.priority
      });

      return savedTask;
    } catch (error) {
      this.logger.error('Failed to change task priority', {
        error: error instanceof Error ? error.message : 'Unknown error',
        taskId,
        priority
      });
      throw error;
    }
  }

  async reassign(taskId: string, newAssigneeId: string): Promise<Task> {
    try {
      this.logger.info('Reassigning task', { taskId, newAssigneeId });

      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      const updatedTask = task.reassign(new UserIdVO(newAssigneeId));
      const savedTask = await this.taskRepository.update(updatedTask);

      this.logger.info('Task reassigned successfully', { 
        taskId: savedTask.taskId.value,
        newAssigneeId
      });

      return savedTask;
    } catch (error) {
      this.logger.error('Failed to reassign task', {
        error: error instanceof Error ? error.message : 'Unknown error',
        taskId,
        newAssigneeId
      });
      throw error;
    }
  }

  async addTag(taskId: string, tagName: string, color: string): Promise<Task> {
    try {
      this.logger.info('Adding tag to task', { taskId, tagName });

      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      const tag: TaskTag = {
        name: tagName,
        color,
        description: ''
      };

      const updatedTask = task.addTag(tag);
      const savedTask = await this.taskRepository.update(updatedTask);

      this.logger.info('Tag added successfully', { 
        taskId: savedTask.taskId.value,
        tagName
      });

      return savedTask;
    } catch (error) {
      this.logger.error('Failed to add tag', {
        error: error instanceof Error ? error.message : 'Unknown error',
        taskId,
        tagName
      });
      throw error;
    }
  }

  async removeTag(taskId: string, tagName: string): Promise<Task> {
    try {
      this.logger.info('Removing tag from task', { taskId, tagName });

      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      const updatedTask = task.removeTag(tagName);
      const savedTask = await this.taskRepository.update(updatedTask);

      this.logger.info('Tag removed successfully', { 
        taskId: savedTask.taskId.value,
        tagName
      });

      return savedTask;
    } catch (error) {
      this.logger.error('Failed to remove tag', {
        error: error instanceof Error ? error.message : 'Unknown error',
        taskId,
        tagName
      });
      throw error;
    }
  }

  async addWatcher(taskId: string, userId: string): Promise<Task> {
    try {
      this.logger.info('Adding watcher to task', { taskId, userId });

      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      const updatedTask = task.addWatcher(new UserIdVO(userId));
      const savedTask = await this.taskRepository.update(updatedTask);

      this.logger.info('Watcher added successfully', { 
        taskId: savedTask.taskId.value,
        userId
      });

      return savedTask;
    } catch (error) {
      this.logger.error('Failed to add watcher', {
        error: error instanceof Error ? error.message : 'Unknown error',
        taskId,
        userId
      });
      throw error;
    }
  }

  async removeWatcher(taskId: string, userId: string): Promise<Task> {
    try {
      this.logger.info('Removing watcher from task', { taskId, userId });

      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      const updatedTask = task.removeWatcher(new UserIdVO(userId));
      const savedTask = await this.taskRepository.update(updatedTask);

      this.logger.info('Watcher removed successfully', { 
        taskId: savedTask.taskId.value,
        userId
      });

      return savedTask;
    } catch (error) {
      this.logger.error('Failed to remove watcher', {
        error: error instanceof Error ? error.message : 'Unknown error',
        taskId,
        userId
      });
      throw error;
    }
  }

  async logTime(taskId: string, userId: string, duration: number, description?: string): Promise<Task> {
    try {
      this.logger.info('Logging time to task', { taskId, userId, duration });

      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      const timeEntry: TaskTimeEntry = {
        id: uuidv4(),
        userId: new UserIdVO(userId),
        duration,
        description: description || '',
        loggedAt: new Date()
      };

      const updatedTask = task.logTime(timeEntry);
      const savedTask = await this.taskRepository.update(updatedTask);

      this.logger.info('Time logged successfully', { 
        taskId: savedTask.taskId.value,
        userId,
        duration
      });

      return savedTask;
    } catch (error) {
      this.logger.error('Failed to log time', {
        error: error instanceof Error ? error.message : 'Unknown error',
        taskId,
        userId,
        duration
      });
      throw error;
    }
  }

  async addComment(taskId: string, userId: string, content: string): Promise<Task> {
    try {
      this.logger.info('Adding comment to task', { taskId, userId });

      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      const comment: TaskComment = {
        id: uuidv4(),
        content,
        authorId: new UserIdVO(userId),
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false
      };

      const updatedTask = task.addComment(comment);
      const savedTask = await this.taskRepository.update(updatedTask);

      this.logger.info('Comment added successfully', { 
        taskId: savedTask.taskId.value,
        userId
      });

      return savedTask;
    } catch (error) {
      this.logger.error('Failed to add comment', {
        error: error instanceof Error ? error.message : 'Unknown error',
        taskId,
        userId
      });
      throw error;
    }
  }

  async getTaskStats(taskId: string): Promise<TaskStats> {
    try {
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      return {
        totalTime: task.timeTracking.totalTime,
        completedTime: task.completedHours,
        commentsCount: task.comments.length,
        attachmentsCount: task.attachments.length,
        watchersCount: task.watchers.length,
        subtasksCount: task.subtasks.length,
        completedSubtasks: task.subtasks.filter(st => st.completed).length
      };
    } catch (error) {
      this.logger.error('Failed to get task stats', {
        error: error instanceof Error ? error.message : 'Unknown error',
        taskId
      });
      throw error;
    }
  }
}
