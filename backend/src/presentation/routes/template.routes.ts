import { Router } from 'express';
import { DIContainer } from '@/infrastructure/di/container';
import { TYPES } from '@/shared/types';
import { TemplateController } from '@/presentation/controllers/template.controller';

const container = DIContainer.getContainer();
const templateController = container.get<TemplateController>(TYPES.TemplateController);

export const templateRoutes = Router();

templateRoutes.post('/', templateController.createTemplate.bind(templateController));
templateRoutes.get('/', templateController.getTemplates.bind(templateController));
templateRoutes.get('/:templateId', templateController.getTemplate.bind(templateController));
templateRoutes.put('/:templateId', templateController.updateTemplate.bind(templateController));
templateRoutes.delete('/:templateId', templateController.deleteTemplate.bind(templateController));
templateRoutes.post('/:templateId/use', templateController.useTemplate.bind(templateController));

