import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { DIContainer } from '@/infrastructure/di/container';
import { TYPES } from '@/shared/types';
import { TaskController } from '@/presentation/controllers/task.controller';

const container = DIContainer.getContainer();
const taskController = container.get<TaskController>(TYPES.TaskController);

const uploadPath = process.env['UPLOAD_PATH'] || './uploads';
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadPath),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const allowed = (process.env['ALLOWED_FILE_TYPES'] || '').split(',').filter(Boolean);
const maxSize = Number(process.env['MAX_FILE_SIZE'] || 10 * 1024 * 1024);

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (allowed.length === 0 || allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('File type not allowed'));
}

const upload = multer({ storage, limits: { fileSize: maxSize }, fileFilter });

export const taskRoutes = Router();

taskRoutes.post('/', taskController.createTask.bind(taskController));
taskRoutes.get('/', taskController.listTasks.bind(taskController));
taskRoutes.get('/:taskId', taskController.getTask.bind(taskController));
taskRoutes.put('/:taskId', taskController.updateTask.bind(taskController));
taskRoutes.put('/:taskId/status', taskController.changeTaskStatus.bind(taskController));
taskRoutes.put('/:taskId/reassign', taskController.reassignTask.bind(taskController));
taskRoutes.put('/:taskId/log-time', taskController.logTime.bind(taskController));
taskRoutes.post('/:taskId/comments', taskController.addComment.bind(taskController));
taskRoutes.post('/:taskId/files', upload.array('files', 10), taskController.uploadFiles.bind(taskController));
taskRoutes.delete('/:taskId/files/:fileId', taskController.deleteFile.bind(taskController));
taskRoutes.delete('/:taskId', taskController.deleteTask.bind(taskController));
