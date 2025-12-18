import Joi from 'joi';
import { injectable } from 'inversify';

export interface ValidationResult {
  isValid: boolean;
  errors?: any[];
}

export interface IValidationService {
  validate(schema: Joi.ObjectSchema, data: any): Promise<ValidationResult>;
  validateCreateTenant(data: any): Promise<ValidationResult>;
  validateUpdateTenant(data: any): Promise<ValidationResult>;
  validateCreateUser(data: any): Promise<ValidationResult>;
  validateUpdateUser(data: any): Promise<ValidationResult>;
}

@injectable()
export class ValidationService implements IValidationService {
  async validate(schema: Joi.ObjectSchema, data: any): Promise<ValidationResult> {
    try {
      await schema.validateAsync(data, { abortEarly: false });
      return { isValid: true };
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        return {
          isValid: false,
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          }))
        };
      }
      throw error;
    }
  }

  async validateCreateTenant(data: any): Promise<ValidationResult> {
    const schema = Joi.object({
      tenantId: Joi.string()
        .min(3)
        .max(50)
        .pattern(/^[a-zA-Z0-9_-]+$/)
        .required()
        .messages({
          'string.pattern.base': 'TenantId can only contain letters, numbers, underscores and hyphens',
          'string.min': 'TenantId must be at least 3 characters long',
          'string.max': 'TenantId must be at most 50 characters long'
        }),
      name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
          'string.min': 'Name must be at least 2 characters long',
          'string.max': 'Name must be at most 100 characters long'
        }),
      domain: Joi.string()
        .domain()
        .required()
        .messages({
          'string.domain': 'Domain must be a valid domain name'
        }),
      adminEmail: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Admin email must be a valid email address'
        }),
      adminPassword: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
          'string.min': 'Password must be at least 8 characters long',
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        }),
      adminFirstName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': 'First name must be at least 2 characters long',
          'string.max': 'First name must be at most 50 characters long'
        }),
      adminLastName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': 'Last name must be at least 2 characters long',
          'string.max': 'Last name must be at most 50 characters long'
        }),
      settings: Joi.object().optional()
    });

    return this.validate(schema, data);
  }

  async validateUpdateTenant(data: any): Promise<ValidationResult> {
    const schema = Joi.object({
      name: Joi.string()
        .min(2)
        .max(100)
        .optional()
        .messages({
          'string.min': 'Name must be at least 2 characters long',
          'string.max': 'Name must be at most 100 characters long'
        }),
      domain: Joi.string()
        .domain()
        .optional()
        .messages({
          'string.domain': 'Domain must be a valid domain name'
        }),
      settings: Joi.object().optional()
    });

    return this.validate(schema, data);
  }

  async validateCreateUser(data: any): Promise<ValidationResult> {
    const schema = Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Email must be a valid email address'
        }),
      password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
          'string.min': 'Password must be at least 8 characters long',
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        }),
      firstName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': 'First name must be at least 2 characters long',
          'string.max': 'First name must be at most 50 characters long'
        }),
      lastName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': 'Last name must be at least 2 characters long',
          'string.max': 'Last name must be at most 50 characters long'
        }),
      role: Joi.string()
        .valid('SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'EMPLOYEE', 'CLIENT')
        .required()
        .messages({
          'any.only': 'Role must be one of: SUPER_ADMIN, TENANT_ADMIN, MANAGER, EMPLOYEE, CLIENT'
        }),
      tenantId: Joi.string()
        .required()
        .messages({
          'any.required': 'Tenant ID is required'
        }),
      profile: Joi.object().optional()
    });

    return this.validate(schema, data);
  }

  async validateUpdateUser(data: any): Promise<ValidationResult> {
    const schema = Joi.object({
      firstName: Joi.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
          'string.min': 'First name must be at least 2 characters long',
          'string.max': 'First name must be at most 50 characters long'
        }),
      lastName: Joi.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
          'string.min': 'Last name must be at least 2 characters long',
          'string.max': 'Last name must be at most 50 characters long'
        }),
      role: Joi.string()
        .valid('SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'EMPLOYEE', 'CLIENT')
        .optional()
        .messages({
          'any.only': 'Role must be one of: SUPER_ADMIN, TENANT_ADMIN, MANAGER, EMPLOYEE, CLIENT'
        }),
      profile: Joi.object().optional()
    });

    return this.validate(schema, data);
  }

  // Schemas para outros tipos de validação
  static createProjectSchema = Joi.object({
    projectId: Joi.string().required(),
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    clientId: Joi.string().required(),
    managerId: Joi.string().required(),
    tenantId: Joi.string().required(),
    budget: Joi.object({
      planned: Joi.number().min(0).required(),
      spent: Joi.number().min(0).default(0),
      currency: Joi.string().length(3).default('BRL'),
      categories: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        planned: Joi.number().min(0).required(),
        spent: Joi.number().min(0).default(0)
      })).default([])
    }).required(),
    timeline: Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().greater(Joi.ref('startDate')).required(),
      milestones: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        dueDate: Joi.date().required(),
        description: Joi.string().optional()
      })).default([])
    }).required()
  });

  static createTaskSchema = Joi.object({
    taskId: Joi.string().required(),
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).optional(),
    projectId: Joi.string().required(),
    assigneeId: Joi.string().required(),
    reporterId: Joi.string().required(),
    tenantId: Joi.string().required(),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
    dueDate: Joi.date().optional(),
    estimatedHours: Joi.number().min(0).default(0)
  });
}
