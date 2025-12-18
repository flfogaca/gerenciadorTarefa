import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { 
  ICreateSupplierUseCase, 
  IUpdateSupplierUseCase, 
  IGetSupplierUseCase,
  IListSuppliersUseCase,
  IDeleteSupplierUseCase,
  CreateSupplierResponse,
  UpdateSupplierResponse,
  GetSupplierResponse,
  ListSuppliersResponse,
  DeleteSupplierResponse
} from '@/application/use-cases';
import { TYPES } from '@/shared/types';
import { RequirePermission } from '@/core/permissions/permission-system';
import { RequireTenant } from '@/core/multi-tenant/tenant-context';
import { ValidationService } from '@/shared/validation/validation.service';
import { Logger } from '@/shared/logging/logger';
import Joi from 'joi';

@injectable()
export class SupplierController {
  private readonly createSupplierSchema = Joi.object({
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
    services: Joi.array().items(Joi.string()).default([]),
    settings: Joi.object().optional()
  });

  private readonly updateSupplierSchema = Joi.object({
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
    services: Joi.array().items(Joi.string()).optional(),
    settings: Joi.object().optional(),
    isActive: Joi.boolean().optional()
  });

  constructor(
    @inject(TYPES.CreateSupplierUseCase) private readonly createSupplierUseCase: ICreateSupplierUseCase,
    @inject(TYPES.UpdateSupplierUseCase) private readonly updateSupplierUseCase: IUpdateSupplierUseCase,
    @inject(TYPES.GetSupplierUseCase) private readonly getSupplierUseCase: IGetSupplierUseCase,
    @inject(TYPES.ListSuppliersUseCase) private readonly listSuppliersUseCase: IListSuppliersUseCase,
    @inject(TYPES.DeleteSupplierUseCase) private readonly deleteSupplierUseCase: IDeleteSupplierUseCase,
    @inject(TYPES.ValidationService) private readonly validationService: ValidationService,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) {}

  @RequirePermission('suppliers', 'create')
  @RequireTenant()
  async createSupplier(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const validationResult = await this.validationService.validate(this.createSupplierSchema, req.body);
      
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

      const result: CreateSupplierResponse = await this.createSupplierUseCase.execute(requestData);

      this.logger.info('Supplier created successfully', {
        supplierId: result.supplier.id,
        name: result.supplier.name,
        tenantId: result.supplier.tenantId.value,
        requestId: req.headers['x-request-id']
      });

      res.status(201).json({
        success: true,
        data: {
          supplier: {
            id: result.supplier.id,
            name: result.supplier.name,
            cnpj: result.supplier.cnpj,
            email: result.supplier.email,
            phone: result.supplier.phone,
            address: result.supplier.address,
            services: result.supplier.services,
            settings: result.supplier.settings,
            isActive: result.supplier.isActive,
            createdAt: result.supplier.createdAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to create supplier', {
        error: (error as Error).message,
        stack: (error as Error).stack,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create supplier'
      });
    }
  }

  @RequirePermission('suppliers', 'read')
  @RequireTenant()
  async getSupplier(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { supplierId } = req.params;

      const result: GetSupplierResponse = await this.getSupplierUseCase.execute({ supplierId: supplierId! });

      if (result.supplier.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only access suppliers from your own tenant'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          supplier: {
            id: result.supplier.id,
            name: result.supplier.name,
            cnpj: result.supplier.cnpj,
            email: result.supplier.email,
            phone: result.supplier.phone,
            address: result.supplier.address,
            services: result.supplier.services,
            settings: result.supplier.settings,
            isActive: result.supplier.isActive,
            createdAt: result.supplier.createdAt,
            updatedAt: result.supplier.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to get supplier', {
        error: (error as Error).message,
        supplierId: req.params['supplierId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve supplier'
      });
    }
  }

  @RequirePermission('suppliers', 'update')
  @RequireTenant()
  async updateSupplier(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { supplierId } = req.params;

      const validationResult = await this.validationService.validate(this.updateSupplierSchema, req.body);
      
      if (!validationResult.isValid) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationResult.errors
        });
        return;
      }

      const result: UpdateSupplierResponse = await this.updateSupplierUseCase.execute({
        supplierId,
        ...req.body
      });

      if (result.supplier.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update suppliers from your own tenant'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          supplier: {
            id: result.supplier.id,
            name: result.supplier.name,
            cnpj: result.supplier.cnpj,
            email: result.supplier.email,
            phone: result.supplier.phone,
            address: result.supplier.address,
            services: result.supplier.services,
            settings: result.supplier.settings,
            isActive: result.supplier.isActive,
            updatedAt: result.supplier.updatedAt
          }
        }
      });

    } catch (error) {
      this.logger.error('Failed to update supplier', {
        error: (error as Error).message,
        supplierId: req.params['supplierId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update supplier'
      });
    }
  }

  @RequirePermission('suppliers', 'delete')
  @RequireTenant()
  async deleteSupplier(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { supplierId } = req.params;

      const result: DeleteSupplierResponse = await this.deleteSupplierUseCase.execute({ supplierId: supplierId! });

      if (result.supplier.tenantId.value !== tenantContext.tenantId.value) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only delete suppliers from your own tenant'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          message: 'Supplier deleted successfully',
          supplierId: result.supplier.id
        }
      });

    } catch (error) {
      this.logger.error('Failed to delete supplier', {
        error: (error as Error).message,
        supplierId: req.params['supplierId'],
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to delete supplier'
      });
    }
  }

  @RequirePermission('suppliers', 'read')
  @RequireTenant()
  async listSuppliers(req: Request, res: Response, tenantContext: any): Promise<void> {
    try {
      const { limit = 10, offset = 0, isActive, search, service } = req.query;

      const result: ListSuppliersResponse = await this.listSuppliersUseCase.execute({
        tenantId: tenantContext.tenantId.value,
        limit: Number(limit),
        offset: Number(offset),
        filters: {
          isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
          search: search as string,
          service: service as string
        }
      });

      res.status(200).json({
        success: true,
        data: {
          suppliers: result.suppliers.map(supplier => ({
            id: supplier.id,
            name: supplier.name,
            cnpj: supplier.cnpj,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address,
            services: supplier.services,
            isActive: supplier.isActive,
            createdAt: supplier.createdAt
          })),
          total: result.total,
          limit: Number(limit),
          offset: Number(offset)
        }
      });

    } catch (error) {
      this.logger.error('Failed to list suppliers', {
        error: (error as Error).message,
        requestId: req.headers['x-request-id']
      });

      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to list suppliers'
      });
    }
  }
}
