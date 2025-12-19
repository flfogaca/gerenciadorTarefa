import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { 
  ICreateClientUseCase, 
  IUpdateClientUseCase, 
  IGetClientUseCase,
  IListClientsUseCase,
  IDeleteClientUseCase,
  CreateClientResponse,
  UpdateClientResponse,
  GetClientResponse,
  ListClientsResponse,
  DeleteClientResponse
} from '@/application/use-cases';
import { TYPES } from '@/shared/types';
import { RequirePermission } from '@/core/permissions/permission-system';
import { RequireTenant } from '@/core/multi-tenant/tenant-context';
import { ValidationService } from '@/shared/validation/validation.service';
import { Logger } from '@/shared/logging/logger';
import Joi from 'joi';

@injectable()
export class ClientController {
  private readonly createClientSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    cnpj: Joi.string().pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      number: Joi.string().optional(),
      complement: Joi.string().optional(),
      neighborhood: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().length(2).optional(),
      zipCode: Joi.string().pattern(/^\d{5}-\d{3}$/).optional(),
      country: Joi.string().default('Brasil')
    }).optional(),
    settings: Joi.object().optional()
  });

  private readonly updateClientSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    cnpj: Joi.string().pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      number: Joi.string().optional(),
      complement: Joi.string().optional(),
      neighborhood: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().length(2).optional(),
      zipCode: Joi.string().pattern(/^\d{5}-\d{3}$/).optional(),
      country: Joi.string().optional()
    }).optional(),
    settings: Joi.object().optional(),
    isActive: Joi.boolean().optional()
  });

  constructor(
    @inject(TYPES.CreateClientUseCase) private readonly createClientUseCase: ICreateClientUseCase,
    @inject(TYPES.UpdateClientUseCase) private readonly updateClientUseCase: IUpdateClientUseCase,
    @inject(TYPES.GetClientUseCase) private readonly getClientUseCase: IGetClientUseCase,
    @inject(TYPES.ListClientsUseCase) private readonly listClientsUseCase: IListClientsUseCase,
    @inject(TYPES.DeleteClientUseCase) private readonly deleteClientUseCase: IDeleteClientUseCase,
    @inject(TYPES.ValidationService) private readonly validationService: ValidationService,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  @RequirePermission('clients', 'create')
  @RequireTenant()
  async createClient(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const validationResult = await this.validationService.validate(this.createClientSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const requestData = {
        ...req.body,
        tenantId: tenantContext.tenantId.value
      };

      const result: CreateClientResponse = await this.createClientUseCase.execute(requestData);

      this.logger.info('Client created successfully', {
        clientId: result.client.id,
        name: result.client.name,
        tenantId: result.client.tenantId.value,
        requestId: req.headers['x-request-id']
      });

      res.status(201).json({
        success: true,
        data: {
          client: {
            id: result.client.id,
            name: result.client.name,
            cnpj: result.client.cnpj,
            email: result.client.email,
            phone: result.client.phone,
            address: result.client.address,
            settings: result.client.settings,
            isActive: result.client.isActive,
            createdAt: result.client.createdAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to create client', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create client'
      });
    }
  }

  @RequirePermission('clients', 'read')
  @RequireTenant()
  async getClient(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { clientId } = req.params;

      const result: GetClientResponse = await this.getClientUseCase.execute({ clientId: clientId! });

      if (result.client.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only access clients from your own tenant'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          client: {
            id: result.client.id,
            name: result.client.name,
            cnpj: result.client.cnpj,
            email: result.client.email,
            phone: result.client.phone,
            address: result.client.address,
            settings: result.client.settings,
            isActive: result.client.isActive,
            createdAt: result.client.createdAt,
            updatedAt: result.client.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to get client', {
        error: (error as Error).message,
        clientId: req.params['clientId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve client'
      });
    }
  }

  @RequirePermission('clients', 'update')
  @RequireTenant()
  async updateClient(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { clientId } = req.params;

      const validationResult = await this.validationService.validate(this.updateClientSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const result: UpdateClientResponse = await this.updateClientUseCase.execute({
        clientId,
        ...req.body
      });

      if (result.client.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update clients from your own tenant'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          client: {
            id: result.client.id,
            name: result.client.name,
            cnpj: result.client.cnpj,
            email: result.client.email,
            phone: result.client.phone,
            address: result.client.address,
            settings: result.client.settings,
            isActive: result.client.isActive,
            updatedAt: result.client.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to update client', {
        error: (error as Error).message,
        clientId: req.params['clientId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update client'
      });
    }
  }

  @RequirePermission('clients', 'delete')
  @RequireTenant()
  async deleteClient(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { clientId } = req.params;

      const result: DeleteClientResponse = await this.deleteClientUseCase.execute({ clientId: clientId! });

      if (result.client.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only delete clients from your own tenant'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          message: 'Client deleted successfully',
          clientId: result.client.id
        }
      });

    } catch (error) {
      this.logger.error('Failed to delete client', {
        error: (error as Error).message,
        clientId: req.params['clientId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete client'
      });
    }
  }

  @RequirePermission('clients', 'read')
  @RequireTenant()
  async listClients(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { limit = 10, offset = 0, isActive, search } = req.query;

      const result: ListClientsResponse = await this.listClientsUseCase.execute({
        tenantId: tenantContext.tenantId.value,
        limit: Number(limit),
        offset: Number(offset),
        filters: {
          isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
          search: search as string
        }
      });

      res.status(200).json({
        success: true,
        data: {
          clients: result.clients.map(client => ({
            id: client.id,
            name: client.name,
            cnpj: client.cnpj,
            email: client.email,
            phone: client.phone,
            address: client.address,
            isActive: client.isActive,
            createdAt: client.createdAt
          })),
          total: result.total,
          limit: Number(limit),
          offset: Number(offset)
        }
      });

    } catch (error) {
      this.logger.error('Failed to list clients', {
        error: (error as Error).message,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to list clients'
      });
    }
  }

  @RequirePermission('clients', 'read')
  @RequireTenant()
  async getClientDocuments(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { clientId } = req.params;
      const result: GetClientResponse = await this.getClientUseCase.execute({ clientId: clientId! });

      if (result.client.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only access clients from your own tenant'
        });
        return;
      }

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      try {
        const client = await prisma.client.findUnique({ where: { id: clientId } });
        const documents = Array.isArray(client?.documents) ? client.documents : [];

        res.status(200).json({
          success: true,
          data: { documents }
        });
      } finally {
        await prisma.$disconnect();
      }
    } catch (error) {
      this.logger.error('Failed to get client documents', {
        error: (error as Error).message,
        clientId: req.params['clientId']
      });
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve documents'
      });
    }
  }

  @RequirePermission('clients', 'update')
  @RequireTenant()
  async deleteClientDocument(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { clientId, documentId } = req.params;
      const result: GetClientResponse = await this.getClientUseCase.execute({ clientId: clientId! });

      if (result.client.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update clients from your own tenant'
        });
        return;
      }

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      try {
        const client = await prisma.client.findUnique({ where: { id: clientId } });
        const documents = Array.isArray(client?.documents) ? client.documents : [];
        const updatedDocuments = documents.filter((doc: any) => doc.id !== documentId);

        await prisma.client.update({
          where: { id: clientId },
          data: { documents: updatedDocuments }
        });

        res.status(200).json({
          success: true,
          data: { message: 'Document deleted successfully' }
        });
      } finally {
        await prisma.$disconnect();
      }
    } catch (error) {
      this.logger.error('Failed to delete client document', {
        error: (error as Error).message,
        clientId: req.params['clientId']
      });
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete document'
      });
    }
  }
}
