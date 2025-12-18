import { injectable, inject } from 'inversify';
import { IClientRepository } from '@/core/interfaces/repositories';
import { TYPES } from '@/shared/types';
import { Logger } from '@/shared/logging/logger';
import { 
  CreateClientRequest, 
  CreateClientResponse,
  UpdateClientRequest,
  UpdateClientResponse,
  GetClientRequest,
  GetClientResponse,
  ListClientsRequest,
  ListClientsResponse,
  DeleteClientRequest,
  DeleteClientResponse
} from '@/application/use-cases';
import { Client } from '@/core/entities/client';
import { TenantIdVO } from '@/core/entities/tenant';

@injectable()
export class CreateClientUseCase {
  constructor(
    @inject(TYPES.ClientRepository) private readonly clientRepository: IClientRepository,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  async execute(request: CreateClientRequest): Promise<CreateClientResponse> {
    try {
      const client = new Client({
        tenantId: new TenantIdVO(request.tenantId),
        name: request.name,
        cnpj: request.cnpj,
        email: request.email,
        phone: request.phone,
        address: request.address,
        settings: request.settings || {}
      });

      const createdClient = await this.clientRepository.create(client);

      this.logger.info('Client created', {
        clientId: createdClient.id,
        name: createdClient.name,
        tenantId: createdClient.tenantId.value
      });

      return { client: createdClient };
    } catch (error) {
      this.logger.error('Failed to create client', {
        error: (error as Error).message,
        request
      });
      throw error;
    }
  }
}

@injectable()
export class UpdateClientUseCase {
  constructor(
    @inject(TYPES.ClientRepository) private readonly clientRepository: IClientRepository,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  async execute(request: UpdateClientRequest): Promise<UpdateClientResponse> {
    try {
      const existingClient = await this.clientRepository.findById(request.clientId);
      
      if (!existingClient) {
        throw new Error('Client not found');
      }

      const updatedClient = new Client({
        ...existingClient,
        ...request,
        id: existingClient.id,
        tenantId: existingClient.tenantId
      });

      const result = await this.clientRepository.update(updatedClient);

      this.logger.info('Client updated', {
        clientId: result.id,
        name: result.name,
        tenantId: result.tenantId.value
      });

      return { client: result };
    } catch (error) {
      this.logger.error('Failed to update client', {
        error: (error as Error).message,
        request
      });
      throw error;
    }
  }
}

@injectable()
export class GetClientUseCase {
  constructor(
    @inject(TYPES.ClientRepository) private readonly clientRepository: IClientRepository,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  async execute(request: GetClientRequest): Promise<GetClientResponse> {
    try {
      const client = await this.clientRepository.findById(request.clientId);
      
      if (!client) {
        throw new Error('Client not found');
      }

      return { client };
    } catch (error) {
      this.logger.error('Failed to get client', {
        error: (error as Error).message,
        request
      });
      throw error;
    }
  }
}

@injectable()
export class ListClientsUseCase {
  constructor(
    @inject(TYPES.ClientRepository) private readonly clientRepository: IClientRepository,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  async execute(request: ListClientsRequest): Promise<ListClientsResponse> {
    try {
      const { clients, total } = await this.clientRepository.findMany({
        tenantId: new TenantIdVO(request.tenantId),
        limit: request.limit,
        offset: request.offset,
        filters: request.filters
      });

      return { clients, total };
    } catch (error) {
      this.logger.error('Failed to list clients', {
        error: (error as Error).message,
        request
      });
      throw error;
    }
  }
}

@injectable()
export class DeleteClientUseCase {
  constructor(
    @inject(TYPES.ClientRepository) private readonly clientRepository: IClientRepository,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  async execute(request: DeleteClientRequest): Promise<DeleteClientResponse> {
    try {
      const client = await this.clientRepository.findById(request.clientId);
      
      if (!client) {
        throw new Error('Client not found');
      }

      await this.clientRepository.delete(request.clientId);

      this.logger.info('Client deleted', {
        clientId: client.id,
        name: client.name,
        tenantId: client.tenantId.value
      });

      return { client };
    } catch (error) {
      this.logger.error('Failed to delete client', {
        error: (error as Error).message,
        request
      });
      throw error;
    }
  }
}
