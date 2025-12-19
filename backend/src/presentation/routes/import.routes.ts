import { Router } from 'express';
import multer from 'multer';
import { DIContainer } from '@/infrastructure/di/container';
import { TYPES } from '@/shared/types';
import { ImportController } from '@/presentation/controllers/import.controller';

const container = DIContainer.getContainer();
const importController = container.get<ImportController>(TYPES.ImportController);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype) || 
        file.originalname.endsWith('.csv') || 
        file.originalname.endsWith('.xlsx') || 
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use CSV ou Excel.'));
    }
  }
});

export const importRoutes = Router();

importRoutes.post('/detect-columns', upload.single('file'), importController.detectColumns.bind(importController));
importRoutes.post('/projects', upload.single('file'), importController.importProjects.bind(importController));
importRoutes.post('/tasks', upload.single('file'), importController.importTasks.bind(importController));
importRoutes.post('/clients', upload.single('file'), importController.importClients.bind(importController));

