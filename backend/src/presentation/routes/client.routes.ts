import { Router } from 'express';
import { DIContainer } from '@/infrastructure/di/container';
import { TYPES } from '@/shared/types';
import { ClientController } from '@/presentation/controllers/client.controller';

const container = DIContainer.getContainer();
const clientController = container.get<ClientController>(TYPES.ClientController);

export const clientRoutes = Router();

clientRoutes.post('/', clientController.createClient.bind(clientController));
clientRoutes.get('/', clientController.listClients.bind(clientController));
clientRoutes.get('/:clientId', clientController.getClient.bind(clientController));
clientRoutes.put('/:clientId', clientController.updateClient.bind(clientController));
clientRoutes.delete('/:clientId', clientController.deleteClient.bind(clientController));
