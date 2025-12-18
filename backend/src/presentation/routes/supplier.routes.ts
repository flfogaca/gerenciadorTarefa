import { Router } from 'express';
import { DIContainer } from '@/infrastructure/di/container';
import { TYPES } from '@/shared/types';
import { SupplierController } from '@/presentation/controllers/supplier.controller';

const container = DIContainer.getContainer();
const supplierController = container.get<SupplierController>(TYPES.SupplierController);

export const supplierRoutes = Router();

supplierRoutes.post('/', supplierController.createSupplier.bind(supplierController));
supplierRoutes.get('/', supplierController.listSuppliers.bind(supplierController));
supplierRoutes.get('/:supplierId', supplierController.getSupplier.bind(supplierController));
supplierRoutes.put('/:supplierId', supplierController.updateSupplier.bind(supplierController));
supplierRoutes.delete('/:supplierId', supplierController.deleteSupplier.bind(supplierController));
