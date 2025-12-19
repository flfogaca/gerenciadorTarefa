import { Request, Response } from 'express';
import { inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { ImportService, ValidationRule } from '@/application/services/import.service';
import { ILogger } from '@/shared/logging/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ImportController {
  constructor(
    @inject(TYPES.Logger) private readonly logger: ILogger,
    @inject(TYPES.ImportService) private readonly importService: ImportService
  ) {
    // Se não injetado, cria instância
    if (!this.importService) {
      this.importService = new ImportService();
    }
  }

  /**
   * Detecta colunas do arquivo
   */
  detectColumns = async (req: Request, res: Response): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'Arquivo não fornecido' });
        return;
      }

      const isExcel = file.mimetype.includes('spreadsheet') || 
                     file.originalname.endsWith('.xlsx') || 
                     file.originalname.endsWith('.xls');
      
      const columns = this.importService.detectColumns(file.buffer, isExcel);
      
      res.json({ columns, isExcel });
    } catch (error) {
      this.logger.error('Erro ao detectar colunas', { error: (error as Error).message });
      res.status(500).json({ error: 'Erro ao processar arquivo' });
    }
  };

  /**
   * Importa projetos
   */
  importProjects = async (req: Request, res: Response): Promise<void> => {
    try {
      const { mapping, tenantId } = req.body;
      const file = req.file;
      
      if (!file || !mapping || !tenantId) {
        res.status(400).json({ error: 'Dados incompletos' });
        return;
      }

      const isExcel = file.mimetype.includes('spreadsheet') || 
                     file.originalname.endsWith('.xlsx') || 
                     file.originalname.endsWith('.xls');

      const validationRules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string', min: 3, max: 255 },
        { field: 'clientId', required: true, type: 'string' },
        { field: 'managerId', required: true, type: 'string' }
      ];

      const result = isExcel
        ? await this.importService.importExcel(file.buffer, mapping, undefined, validationRules)
        : await this.importService.importCSV(file.buffer, mapping, validationRules);

      if (!result.success || result.errors.length > 0) {
        res.status(400).json(result);
        return;
      }

      // Importa os projetos
      const importedProjects = [];
      for (const record of result.data) {
        try {
          const project = await prisma.project.create({
            data: {
              projectId: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              tenantId,
              name: record.name,
              description: record.description || null,
              clientId: record.clientId,
              managerId: record.managerId,
              status: record.status || 'planning',
              size: record.size || null,
              budget: record.budget ? JSON.parse(record.budget) : {},
              timeline: record.timeline ? JSON.parse(record.timeline) : {},
              team: record.team ? JSON.parse(record.team) : { members: [], roles: [] },
              settings: record.settings ? JSON.parse(record.settings) : {}
            }
          });
          importedProjects.push(project);
        } catch (error) {
          result.errors.push({
            row: 0,
            field: 'database',
            message: `Erro ao criar projeto: ${(error as Error).message}`
          });
        }
      }

      res.json({
        ...result,
        imported: importedProjects.length,
        projects: importedProjects
      });
    } catch (error) {
      this.logger.error('Erro ao importar projetos', { error: (error as Error).message });
      res.status(500).json({ error: 'Erro ao importar projetos' });
    }
  };

  /**
   * Importa tarefas
   */
  importTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const { mapping, tenantId } = req.body;
      const file = req.file;
      
      if (!file || !mapping || !tenantId) {
        res.status(400).json({ error: 'Dados incompletos' });
        return;
      }

      const isExcel = file.mimetype.includes('spreadsheet') || 
                     file.originalname.endsWith('.xlsx') || 
                     file.originalname.endsWith('.xls');

      const validationRules: ValidationRule[] = [
        { field: 'title', required: true, type: 'string', min: 3, max: 255 },
        { field: 'projectId', required: true, type: 'string' },
        { field: 'assigneeId', required: true, type: 'string' },
        { field: 'reporterId', required: true, type: 'string' }
      ];

      const result = isExcel
        ? await this.importService.importExcel(file.buffer, mapping, undefined, validationRules)
        : await this.importService.importCSV(file.buffer, mapping, validationRules);

      if (!result.success || result.errors.length > 0) {
        res.status(400).json(result);
        return;
      }

      // Importa as tarefas
      const importedTasks = [];
      for (const record of result.data) {
        try {
          const task = await prisma.task.create({
            data: {
              taskId: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              tenantId,
              projectId: record.projectId,
              title: record.title,
              description: record.description || null,
              assigneeId: record.assigneeId,
              reporterId: record.reporterId,
              status: record.status || 'todo',
              priority: record.priority || 'medium',
              dueDate: record.dueDate ? new Date(record.dueDate) : null,
              executionDays: record.executionDays ? parseInt(record.executionDays) : null,
              estimatedHours: record.estimatedHours ? parseFloat(record.estimatedHours) : 0,
              tags: record.tags ? JSON.parse(record.tags) : []
            }
          });
          importedTasks.push(task);
        } catch (error) {
          result.errors.push({
            row: 0,
            field: 'database',
            message: `Erro ao criar tarefa: ${(error as Error).message}`
          });
        }
      }

      res.json({
        ...result,
        imported: importedTasks.length,
        tasks: importedTasks
      });
    } catch (error) {
      this.logger.error('Erro ao importar tarefas', { error: (error as Error).message });
      res.status(500).json({ error: 'Erro ao importar tarefas' });
    }
  };

  /**
   * Importa clientes
   */
  importClients = async (req: Request, res: Response): Promise<void> => {
    try {
      const { mapping, tenantId } = req.body;
      const file = req.file;
      
      if (!file || !mapping || !tenantId) {
        res.status(400).json({ error: 'Dados incompletos' });
        return;
      }

      const isExcel = file.mimetype.includes('spreadsheet') || 
                     file.originalname.endsWith('.xlsx') || 
                     file.originalname.endsWith('.xls');

      const validationRules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string', min: 3, max: 255 },
        { field: 'email', required: false, type: 'email' }
      ];

      const result = isExcel
        ? await this.importService.importExcel(file.buffer, mapping, undefined, validationRules)
        : await this.importService.importCSV(file.buffer, mapping, validationRules);

      if (!result.success || result.errors.length > 0) {
        res.status(400).json(result);
        return;
      }

      // Importa os clientes
      const importedClients = [];
      for (const record of result.data) {
        try {
          const client = await prisma.client.create({
            data: {
              tenantId,
              name: record.name,
              cnpj: record.cnpj || null,
              email: record.email || null,
              phone: record.phone || null,
              address: record.address ? JSON.parse(record.address) : null,
              settings: record.settings ? JSON.parse(record.settings) : {}
            }
          });
          importedClients.push(client);
        } catch (error) {
          result.errors.push({
            row: 0,
            field: 'database',
            message: `Erro ao criar cliente: ${(error as Error).message}`
          });
        }
      }

      res.json({
        ...result,
        imported: importedClients.length,
        clients: importedClients
      });
    } catch (error) {
      this.logger.error('Erro ao importar clientes', { error: (error as Error).message });
      res.status(500).json({ error: 'Erro ao importar clientes' });
    }
  };
}

