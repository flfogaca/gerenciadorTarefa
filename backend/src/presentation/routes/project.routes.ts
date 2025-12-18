import { Router } from 'express';
import { DIContainer } from '@/infrastructure/di/container';
import { TYPES } from '@/shared/types';
import { ProjectController } from '@/presentation/controllers/project.controller';

const container = DIContainer.getContainer();
const projectController = container.get<ProjectController>(TYPES.ProjectController);

export const projectRoutes = Router();

projectRoutes.post('/', projectController.createProject.bind(projectController));
projectRoutes.get('/', projectController.listProjects.bind(projectController));
projectRoutes.get('/:projectId', projectController.getProject.bind(projectController));
projectRoutes.put('/:projectId', projectController.updateProject.bind(projectController));
projectRoutes.put('/:projectId/status', projectController.changeProjectStatus.bind(projectController));
projectRoutes.delete('/:projectId', projectController.deleteProject.bind(projectController));
