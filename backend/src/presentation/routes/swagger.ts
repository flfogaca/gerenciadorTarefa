export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'GestorPro API',
    version: '1.0.0',
    description: 'API completa para gerenciamento de projetos, tarefas e equipes',
    contact: {
      name: 'GestorPro Team',
      email: 'suporte@gestorpro.com'
    }
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1'
    }
  ],
  tags: [
    { name: 'Auth', description: 'Autenticação e autorização' },
    { name: 'Users', description: 'Gerenciamento de usuários' },
    { name: 'Projects', description: 'Gerenciamento de projetos' },
    { name: 'Tasks', description: 'Gerenciamento de tarefas' },
    { name: 'Clients', description: 'Gerenciamento de clientes' },
    { name: 'Suppliers', description: 'Gerenciamento de fornecedores' },
    { name: 'Financial', description: 'Operações financeiras' },
    { name: 'Reports', description: 'Relatórios e analytics' },
    { name: 'Notifications', description: 'Sistema de notificações' },
    { name: 'Settings', description: 'Configurações do sistema' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          details: { type: 'array', items: { type: 'string' } }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          role: { type: 'string', enum: ['super_admin', 'tenant_admin', 'manager', 'employee', 'client'] },
          tenantId: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Project: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'] },
          progress: { type: 'number', minimum: 0, maximum: 100 },
          budget: {
            type: 'object',
            properties: {
              planned: { type: 'number' },
              spent: { type: 'number' },
              currency: { type: 'string' }
            }
          },
          timeline: {
            type: 'object',
            properties: {
              startDate: { type: 'string', format: 'date' },
              endDate: { type: 'string', format: 'date' }
            }
          }
        }
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
          projectId: { type: 'string' },
          assigneeId: { type: 'string' },
          dueDate: { type: 'string', format: 'date-time' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          tenantId: { type: 'string' }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              token: { type: 'string' },
              refreshToken: { type: 'string' }
            }
          }
        }
      },
      Pagination: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          limit: { type: 'integer' },
          offset: { type: 'integer' }
        }
      }
    }
  },
  paths: {
    '/users/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Autenticar usuário',
        description: 'Realiza login e retorna tokens JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login bem-sucedido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' }
              }
            }
          },
          '401': {
            description: 'Credenciais inválidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/users/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Renovar token',
        description: 'Usa refresh token para obter novo access token',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Token renovado com sucesso' },
          '401': { description: 'Refresh token inválido ou expirado' }
        }
      }
    },
    '/users/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Solicitar reset de senha',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Email enviado se conta existir' }
        }
      }
    },
    '/users/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Redefinir senha',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                  token: { type: 'string' },
                  password: { type: 'string', minLength: 8 }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Senha alterada com sucesso' },
          '400': { description: 'Token inválido ou expirado' }
        }
      }
    },
    '/users/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar novo usuário',
        description: 'Registro público (se habilitado pelo admin)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Usuário criado com sucesso' },
          '400': { description: 'Dados inválidos ou registro desabilitado' }
        }
      }
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Obter usuário atual',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Dados do usuário logado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          '401': { description: 'Não autenticado' }
        }
      }
    },
    '/users/me/2fa/setup': {
      post: {
        tags: ['Auth'],
        summary: 'Configurar 2FA',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'QR Code e secret gerados' }
        }
      }
    },
    '/users/me/2fa/verify': {
      post: {
        tags: ['Auth'],
        summary: 'Verificar código 2FA',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token'],
                properties: {
                  token: { type: 'string', minLength: 6, maxLength: 6 },
                  isSetup: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Código verificado' },
          '401': { description: 'Código inválido' }
        }
      }
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Listar usuários',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
          { name: 'role', in: 'query', schema: { type: 'string' } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } }
        ],
        responses: {
          '200': { description: 'Lista de usuários' }
        }
      },
      post: {
        tags: ['Users'],
        summary: 'Criar usuário',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName', 'role', 'tenantId'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  role: { type: 'string' },
                  tenantId: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Usuário criado' }
        }
      }
    },
    '/projects': {
      get: {
        tags: ['Projects'],
        summary: 'Listar projetos',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'offset', in: 'query', schema: { type: 'integer' } }
        ],
        responses: {
          '200': { description: 'Lista de projetos' }
        }
      },
      post: {
        tags: ['Projects'],
        summary: 'Criar projeto',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Project' }
            }
          }
        },
        responses: {
          '201': { description: 'Projeto criado' }
        }
      }
    },
    '/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Obter projeto',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Dados do projeto' },
          '404': { description: 'Projeto não encontrado' }
        }
      },
      put: {
        tags: ['Projects'],
        summary: 'Atualizar projeto',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Projeto atualizado' }
        }
      },
      delete: {
        tags: ['Projects'],
        summary: 'Excluir projeto',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Projeto excluído' }
        }
      }
    },
    '/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'Listar tarefas',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'assigneeId', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Lista de tarefas' }
        }
      },
      post: {
        tags: ['Tasks'],
        summary: 'Criar tarefa',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Task' }
            }
          }
        },
        responses: {
          '201': { description: 'Tarefa criada' }
        }
      }
    },
    '/clients': {
      get: {
        tags: ['Clients'],
        summary: 'Listar clientes',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Lista de clientes' }
        }
      },
      post: {
        tags: ['Clients'],
        summary: 'Criar cliente',
        security: [{ bearerAuth: [] }],
        responses: {
          '201': { description: 'Cliente criado' }
        }
      }
    },
    '/suppliers': {
      get: {
        tags: ['Suppliers'],
        summary: 'Listar fornecedores',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Lista de fornecedores' }
        }
      },
      post: {
        tags: ['Suppliers'],
        summary: 'Criar fornecedor',
        security: [{ bearerAuth: [] }],
        responses: {
          '201': { description: 'Fornecedor criado' }
        }
      }
    },
    '/expenses': {
      get: {
        tags: ['Financial'],
        summary: 'Listar despesas',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Lista de despesas' }
        }
      },
      post: {
        tags: ['Financial'],
        summary: 'Criar despesa',
        security: [{ bearerAuth: [] }],
        responses: {
          '201': { description: 'Despesa criada' }
        }
      }
    },
    '/invoices': {
      get: {
        tags: ['Financial'],
        summary: 'Listar faturas',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Lista de faturas' }
        }
      }
    },
    '/payments': {
      get: {
        tags: ['Financial'],
        summary: 'Listar pagamentos',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Lista de pagamentos' }
        }
      }
    },
    '/reports/dashboard': {
      get: {
        tags: ['Reports'],
        summary: 'Dashboard geral',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Dados do dashboard' }
        }
      }
    },
    '/financial-reports/dashboard': {
      get: {
        tags: ['Reports'],
        summary: 'Dashboard financeiro',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Relatório financeiro' }
        }
      }
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Listar notificações',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Lista de notificações' }
        }
      }
    },
    '/notifications/{id}/read': {
      post: {
        tags: ['Notifications'],
        summary: 'Marcar notificação como lida',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Notificação marcada como lida' }
        }
      }
    },
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          '200': { description: 'Sistema funcionando' }
        }
      }
    },
    '/tenants/settings/public': {
      get: {
        tags: ['Settings'],
        summary: 'Configurações públicas do tenant',
        description: 'Retorna configurações públicas como status de registro',
        responses: {
          '200': { description: 'Configurações públicas' }
        }
      }
    }
  }
};





