import Joi from 'joi';

const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[A-Z]/, 'uppercase')
  .pattern(/[a-z]/, 'lowercase')
  .pattern(/[0-9]/, 'number')
  .pattern(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/, 'special')
  .messages({
    'string.min': 'A senha deve ter no mínimo {#limit} caracteres',
    'string.max': 'A senha deve ter no máximo {#limit} caracteres',
    'string.pattern.name': 'A senha deve conter pelo menos uma {#name}',
  });

const emailSchema = Joi.string().email().lowercase().trim().messages({
  'string.email': 'Email inválido',
  'string.empty': 'Email é obrigatório',
});

const tenantIdSchema = Joi.string().trim().default('default-tenant');

const paginationSchema = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().trim(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
};

export const authSchemas = {
  login: Joi.object({
    email: emailSchema.required(),
    password: Joi.string().required().messages({
      'string.empty': 'Senha é obrigatória',
    }),
    tenantId: tenantIdSchema,
  }),

  register: Joi.object({
    email: emailSchema.required(),
    password: passwordSchema.required(),
    firstName: Joi.string().min(2).max(50).trim().required().messages({
      'string.min': 'Nome deve ter no mínimo {#limit} caracteres',
      'string.max': 'Nome deve ter no máximo {#limit} caracteres',
    }),
    lastName: Joi.string().min(2).max(50).trim().required().messages({
      'string.min': 'Sobrenome deve ter no mínimo {#limit} caracteres',
      'string.max': 'Sobrenome deve ter no máximo {#limit} caracteres',
    }),
    tenantId: tenantIdSchema,
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: passwordSchema.required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'As senhas não conferem',
    }),
  }),

  forgotPassword: Joi.object({
    email: emailSchema.required(),
    tenantId: tenantIdSchema,
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: passwordSchema.required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'As senhas não conferem',
    }),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

export const userSchemas = {
  create: Joi.object({
    email: emailSchema.required(),
    password: passwordSchema.required(),
    firstName: Joi.string().min(2).max(50).trim().required(),
    lastName: Joi.string().min(2).max(50).trim().required(),
    role: Joi.string()
      .valid('super_admin', 'tenant_admin', 'manager', 'employee', 'client')
      .default('employee'),
    profile: Joi.object({
      phone: Joi.string().allow('').optional(),
      department: Joi.string().allow('').optional(),
      position: Joi.string().allow('').optional(),
      avatar: Joi.string().uri().allow('').optional(),
    }).optional(),
    tenantId: tenantIdSchema,
  }),

  update: Joi.object({
    email: emailSchema.optional(),
    firstName: Joi.string().min(2).max(50).trim().optional(),
    lastName: Joi.string().min(2).max(50).trim().optional(),
    role: Joi.string()
      .valid('super_admin', 'tenant_admin', 'manager', 'employee', 'client')
      .optional(),
    profile: Joi.object({
      phone: Joi.string().allow('').optional(),
      department: Joi.string().allow('').optional(),
      position: Joi.string().allow('').optional(),
      avatar: Joi.string().uri().allow('').optional(),
    }).optional(),
    isActive: Joi.boolean().optional(),
  }),

  list: Joi.object({
    ...paginationSchema,
    search: Joi.string().trim().optional(),
    role: Joi.string().valid('super_admin', 'tenant_admin', 'manager', 'employee', 'client').optional(),
    isActive: Joi.boolean().optional(),
  }),
};

export const projectSchemas = {
  create: Joi.object({
    name: Joi.string().min(3).max(100).trim().required().messages({
      'string.min': 'Nome do projeto deve ter no mínimo {#limit} caracteres',
    }),
    description: Joi.string().max(1000).allow('').optional(),
    clientId: Joi.string().required(),
    managerId: Joi.string().required(),
    status: Joi.string()
      .valid('planning', 'active', 'on_hold', 'completed', 'cancelled')
      .default('planning'),
    budget: Joi.object({
      planned: Joi.number().min(0).optional(),
      currency: Joi.string().default('BRL'),
    }).optional(),
    timeline: Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional(),
    }).optional(),
    team: Joi.object({
      members: Joi.array().items(Joi.object({
        userId: Joi.string().required(),
        role: Joi.string().required(),
      })).optional(),
    }).optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(3).max(100).trim().optional(),
    description: Joi.string().max(1000).allow('').optional(),
    clientId: Joi.string().optional(),
    managerId: Joi.string().optional(),
    status: Joi.string()
      .valid('planning', 'active', 'on_hold', 'completed', 'cancelled')
      .optional(),
    budget: Joi.object({
      planned: Joi.number().min(0).optional(),
      spent: Joi.number().min(0).optional(),
      currency: Joi.string().optional(),
    }).optional(),
    timeline: Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
    }).optional(),
  }),

  list: Joi.object({
    ...paginationSchema,
    search: Joi.string().trim().optional(),
    status: Joi.string().valid('planning', 'active', 'on_hold', 'completed', 'cancelled').optional(),
    clientId: Joi.string().optional(),
    managerId: Joi.string().optional(),
  }),
};

export const taskSchemas = {
  create: Joi.object({
    title: Joi.string().min(3).max(200).trim().required(),
    description: Joi.string().max(2000).allow('').optional(),
    projectId: Joi.string().required(),
    assigneeId: Joi.string().required(),
    status: Joi.string().valid('todo', 'in_progress', 'review', 'done', 'cancelled').default('todo'),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    dueDate: Joi.date().iso().optional(),
    estimatedHours: Joi.number().min(0).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(200).trim().optional(),
    description: Joi.string().max(2000).allow('').optional(),
    assigneeId: Joi.string().optional(),
    status: Joi.string().valid('todo', 'in_progress', 'review', 'done', 'cancelled').optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    dueDate: Joi.date().iso().allow(null).optional(),
    estimatedHours: Joi.number().min(0).optional(),
    completedHours: Joi.number().min(0).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
  }),

  list: Joi.object({
    ...paginationSchema,
    search: Joi.string().trim().optional(),
    projectId: Joi.string().optional(),
    assigneeId: Joi.string().optional(),
    status: Joi.string().valid('todo', 'in_progress', 'review', 'done', 'cancelled').optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  }),

  logTime: Joi.object({
    duration: Joi.number().min(0.1).required().messages({
      'number.min': 'Duração deve ser no mínimo 0.1 hora',
    }),
    description: Joi.string().max(500).allow('').optional(),
  }),
};

export const clientSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).trim().required(),
    cnpj: Joi.string().pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).allow('').optional().messages({
      'string.pattern.base': 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX',
    }),
    email: emailSchema.optional(),
    phone: Joi.string().max(20).allow('').optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      number: Joi.string().optional(),
      complement: Joi.string().optional(),
      neighborhood: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      zipCode: Joi.string().optional(),
      country: Joi.string().default('Brasil'),
    }).optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).trim().optional(),
    cnpj: Joi.string().pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).allow('').optional(),
    email: emailSchema.optional(),
    phone: Joi.string().max(20).allow('').optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      number: Joi.string().optional(),
      complement: Joi.string().optional(),
      neighborhood: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      zipCode: Joi.string().optional(),
      country: Joi.string().optional(),
    }).optional(),
    isActive: Joi.boolean().optional(),
  }),

  list: Joi.object({
    ...paginationSchema,
    search: Joi.string().trim().optional(),
    isActive: Joi.boolean().optional(),
  }),
};

export const supplierSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).trim().required(),
    cnpj: Joi.string().pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).allow('').optional(),
    email: emailSchema.optional(),
    phone: Joi.string().max(20).allow('').optional(),
    services: Joi.array().items(Joi.string()).optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      number: Joi.string().optional(),
      complement: Joi.string().optional(),
      neighborhood: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      zipCode: Joi.string().optional(),
      country: Joi.string().default('Brasil'),
    }).optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).trim().optional(),
    cnpj: Joi.string().pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).allow('').optional(),
    email: emailSchema.optional(),
    phone: Joi.string().max(20).allow('').optional(),
    services: Joi.array().items(Joi.string()).optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      number: Joi.string().optional(),
      complement: Joi.string().optional(),
      neighborhood: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      zipCode: Joi.string().optional(),
      country: Joi.string().optional(),
    }).optional(),
    isActive: Joi.boolean().optional(),
  }),

  list: Joi.object({
    ...paginationSchema,
    search: Joi.string().trim().optional(),
    isActive: Joi.boolean().optional(),
  }),
};

export function validateRequest(schema: Joi.ObjectSchema) {
  return (req: any, res: any, next: any) => {
    const dataToValidate = {
      ...req.body,
      ...req.query,
      ...req.params,
    };

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        error: 'Validation Error',
        message: 'Dados inválidos na requisição',
        details: errors,
      });
    }

    req.validatedData = value;
    next();
  };
}





