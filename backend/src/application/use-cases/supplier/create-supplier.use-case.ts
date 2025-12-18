import { injectable, inject } from 'inversify';
import { ISupplierRepository } from '@/core/interfaces/repositories';
import { TYPES } from '@/shared/types';
import { Logger } from '@/shared/logging/logger';
import { 
  CreateSupplierRequest, 
  CreateSupplierResponse,
  UpdateSupplierRequest,
  UpdateSupplierResponse,
  GetSupplierRequest,
  GetSupplierResponse,
  ListSuppliersRequest,
  ListSuppliersResponse,
  DeleteSupplierRequest,
  DeleteSupplierResponse
} from '@/application/use-cases';
import { Supplier } from '@/core/entities/supplier';
import { TenantIdVO } from '@/core/entities/tenant';

@injectable()
export class CreateSupplierUseCase {
  constructor(
    @inject(TYPES.SupplierRepository) private readonly supplierRepository: ISupplierRepository,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  async execute(request: CreateSupplierRequest): Promise<CreateSupplierResponse> {
    try {
      const supplier = new Supplier({
        tenantId: new TenantIdVO(request.tenantId),
        name: request.name,
        cnpj: request.cnpj,
        email: request.email,
        phone: request.phone,
        address: request.address,
        services: request.services || [],
        settings: request.settings || {}
      });

      const createdSupplier = await this.supplierRepository.create(supplier);

      this.logger.info('Supplier created', {
        supplierId: createdSupplier.id,
        name: createdSupplier.name,
        tenantId: createdSupplier.tenantId.value
      });

      return { supplier: createdSupplier };
    } catch (error) {
      this.logger.error('Failed to create supplier', {
        error: (error as Error).message,
        request
      });
      throw error;
    }
  }
}

@injectable()
export class UpdateSupplierUseCase {
  constructor(
    @inject(TYPES.SupplierRepository) private readonly supplierRepository: ISupplierRepository,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  async execute(request: UpdateSupplierRequest): Promise<UpdateSupplierResponse> {
    try {
      const existingSupplier = await this.supplierRepository.findById(request.supplierId);
      
      if (!existingSupplier) {
        throw new Error('Supplier not found');
      }

      const updatedSupplier = new Supplier({
        ...existingSupplier,
        ...request,
        id: existingSupplier.id,
        tenantId: existingSupplier.tenantId
      });

      const result = await this.supplierRepository.update(updatedSupplier);

      this.logger.info('Supplier updated', {
        supplierId: result.id,
        name: result.name,
        tenantId: result.tenantId.value
      });

      return { supplier: result };
    } catch (error) {
      this.logger.error('Failed to update supplier', {
        error: (error as Error).message,
        request
      });
      throw error;
    }
  }
}

@injectable()
export class GetSupplierUseCase {
  constructor(
    @inject(TYPES.SupplierRepository) private readonly supplierRepository: ISupplierRepository,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  async execute(request: GetSupplierRequest): Promise<GetSupplierResponse> {
    try {
      const supplier = await this.supplierRepository.findById(request.supplierId);
      
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      return { supplier };
    } catch (error) {
      this.logger.error('Failed to get supplier', {
        error: (error as Error).message,
        request
      });
      throw error;
    }
  }
}

@injectable()
export class ListSuppliersUseCase {
  constructor(
    @inject(TYPES.SupplierRepository) private readonly supplierRepository: ISupplierRepository,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  async execute(request: ListSuppliersRequest): Promise<ListSuppliersResponse> {
    try {
      const { suppliers, total } = await this.supplierRepository.findMany({
        tenantId: new TenantIdVO(request.tenantId),
        limit: request.limit,
        offset: request.offset,
        filters: request.filters
      });

      return { suppliers, total };
    } catch (error) {
      this.logger.error('Failed to list suppliers', {
        error: (error as Error).message,
        request
      });
      throw error;
    }
  }
}

@injectable()
export class DeleteSupplierUseCase {
  constructor(
    @inject(TYPES.SupplierRepository) private readonly supplierRepository: ISupplierRepository,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  async execute(request: DeleteSupplierRequest): Promise<DeleteSupplierResponse> {
    try {
      const supplier = await this.supplierRepository.findById(request.supplierId);
      
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      await this.supplierRepository.delete(request.supplierId);

      this.logger.info('Supplier deleted', {
        supplierId: supplier.id,
        name: supplier.name,
        tenantId: supplier.tenantId.value
      });

      return { supplier };
    } catch (error) {
      this.logger.error('Failed to delete supplier', {
        error: (error as Error).message,
        request
      });
      throw error;
    }
  }
}
