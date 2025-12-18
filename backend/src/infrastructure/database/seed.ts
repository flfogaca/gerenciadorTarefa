import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar tenant principal
  const tenant = await prisma.tenant.upsert({
    where: { tenantId: 'default-tenant' },
    update: {},
    create: {
      tenantId: 'default-tenant',
      name: 'GestorPro',
      domain: 'gestorpro.com',
      settings: {
        allowRegistration: true,
        maxUsers: 100,
        features: ['tasks', 'projects', 'reports']
      }
    }
  });

  console.log('✅ Tenant criado:', tenant.name);

  const admin = await prisma.user.upsert({
    where: { userId: 'admin-user-1' },
    update: {},
    create: {
      userId: 'admin-user-1',
      email: 'admin@gestorpro.com',
      firstName: 'Administrador',
      lastName: 'Sistema',
      password: await bcrypt.hash('123456', 12),
      role: 'tenant_admin',
      tenantId: tenant.tenantId,
      profile: {
        phone: '+55 11 99999-9999',
        department: 'TI',
        position: 'Administrador'
      },
      isActive: true
    }
  });

  console.log('✅ Usuário administrador criado:', admin.email);

  const gestor = await prisma.user.upsert({
    where: { userId: 'gestor-user-1' },
    update: {},
    create: {
      userId: 'gestor-user-1',
      email: 'gestor@gestorpro.com',
      firstName: 'Gestor',
      lastName: 'Projetos',
      password: await bcrypt.hash('123456', 12),
      role: 'manager',
      tenantId: tenant.tenantId,
      profile: {
        phone: '+55 11 99999-8888',
        department: 'Gestão',
        position: 'Gerente de Projetos'
      },
      isActive: true
    }
  });

  console.log('✅ Usuário gestor criado:', gestor.email);

  const funcionario = await prisma.user.upsert({
    where: { userId: 'func-user-1' },
    update: {},
    create: {
      userId: 'func-user-1',
      email: 'funcionario@gestorpro.com',
      firstName: 'Funcionário',
      lastName: 'Exemplo',
      password: await bcrypt.hash('123456', 12),
      role: 'employee',
      tenantId: tenant.tenantId,
      profile: {
        phone: '+55 11 99999-7777',
        department: 'Desenvolvimento',
        position: 'Desenvolvedor'
      },
      isActive: true
    }
  });

  console.log('✅ Usuário funcionário criado:', funcionario.email);

  const diretor = await prisma.user.upsert({
    where: { userId: 'diretor-user-1' },
    update: {},
    create: {
      userId: 'diretor-user-1',
      email: 'diretor@gestorpro.com',
      firstName: 'Diretor',
      lastName: 'Executivo',
      password: await bcrypt.hash('123456', 12),
      role: 'super_admin',
      tenantId: tenant.tenantId,
      profile: {
        phone: '+55 11 99999-6666',
        department: 'Diretoria',
        position: 'Diretor'
      },
      isActive: true
    }
  });

  console.log('✅ Usuário diretor criado:', diretor.email);

  const passwordHash = await bcrypt.hash('123456', 12);

  const usuariosAdicionais = [
    {
      userId: 'user-ana-silva',
      email: 'ana.silva@gestorpro.com',
      firstName: 'Ana',
      lastName: 'Silva',
      role: 'manager' as const,
      profile: {
        phone: '+55 11 98765-4321',
        department: 'Gestão de Projetos',
        position: 'Gerente de Projetos Sênior'
      }
    },
    {
      userId: 'user-carlos-santos',
      email: 'carlos.santos@gestorpro.com',
      firstName: 'Carlos',
      lastName: 'Santos',
      role: 'employee' as const,
      profile: {
        phone: '+55 11 98765-4322',
        department: 'Desenvolvimento',
        position: 'Desenvolvedor Full Stack'
      }
    },
    {
      userId: 'user-maria-oliveira',
      email: 'maria.oliveira@gestorpro.com',
      firstName: 'Maria',
      lastName: 'Oliveira',
      role: 'employee' as const,
      profile: {
        phone: '+55 11 98765-4323',
        department: 'Design',
        position: 'Designer UX/UI'
      }
    },
    {
      userId: 'user-joao-costa',
      email: 'joao.costa@gestorpro.com',
      firstName: 'João',
      lastName: 'Costa',
      role: 'employee' as const,
      profile: {
        phone: '+55 11 98765-4324',
        department: 'Desenvolvimento',
        position: 'Desenvolvedor Backend'
      }
    },
    {
      userId: 'user-paula-ferreira',
      email: 'paula.ferreira@gestorpro.com',
      firstName: 'Paula',
      lastName: 'Ferreira',
      role: 'manager' as const,
      profile: {
        phone: '+55 11 98765-4325',
        department: 'Marketing',
        position: 'Gerente de Marketing'
      }
    },
    {
      userId: 'user-rafael-almeida',
      email: 'rafael.almeida@gestorpro.com',
      firstName: 'Rafael',
      lastName: 'Almeida',
      role: 'employee' as const,
      profile: {
        phone: '+55 11 98765-4326',
        department: 'Desenvolvimento',
        position: 'Desenvolvedor Frontend'
      }
    },
    {
      userId: 'user-juliana-rodrigues',
      email: 'juliana.rodrigues@gestorpro.com',
      firstName: 'Juliana',
      lastName: 'Rodrigues',
      role: 'employee' as const,
      profile: {
        phone: '+55 11 98765-4327',
        department: 'QA',
        position: 'Analista de Qualidade'
      }
    },
    {
      userId: 'user-fernando-lima',
      email: 'fernando.lima@gestorpro.com',
      firstName: 'Fernando',
      lastName: 'Lima',
      role: 'manager' as const,
      profile: {
        phone: '+55 11 98765-4328',
        department: 'Vendas',
        position: 'Gerente de Vendas'
      }
    }
  ];

  for (const usuario of usuariosAdicionais) {
    await prisma.user.upsert({
      where: { userId: usuario.userId },
      update: {},
      create: {
        ...usuario,
        password: passwordHash,
        tenantId: tenant.tenantId,
        isActive: true
      }
    });
    console.log(`✅ Usuário criado: ${usuario.email}`);
  }

  const clientes = [
    {
      name: 'TechSolutions Brasil',
      cnpj: '12.345.678/0001-90',
      email: 'contato@techsolutions.com.br',
      phone: '+55 11 3456-7890',
      address: {
        street: 'Av. Paulista',
        number: '1000',
        complement: 'Sala 1501',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        country: 'Brasil'
      },
      isActive: true
    },
    {
      name: 'Inovação Digital Ltda',
      cnpj: '23.456.789/0001-01',
      email: 'comercial@inovacaodigital.com.br',
      phone: '+55 21 2345-6789',
      address: {
        street: 'Rua do Ouvidor',
        number: '50',
        complement: '8º andar',
        neighborhood: 'Centro',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '20040-030',
        country: 'Brasil'
      },
      isActive: true
    },
    {
      name: 'Sistemas Avançados S.A.',
      cnpj: '34.567.890/0001-12',
      email: 'vendas@sistemasavancados.com.br',
      phone: '+55 31 3456-7890',
      address: {
        street: 'Av. Afonso Pena',
        number: '3000',
        complement: 'Conjunto 1001',
        neighborhood: 'Centro',
        city: 'Belo Horizonte',
        state: 'MG',
        zipCode: '30130-009',
        country: 'Brasil'
      },
      isActive: true
    },
    {
      name: 'Cloud Services Brasil',
      cnpj: '45.678.901/0001-23',
      email: 'contato@cloudservices.com.br',
      phone: '+55 41 3456-7890',
      address: {
        street: 'Av. Sete de Setembro',
        number: '5000',
        complement: 'Torre A',
        neighborhood: 'Batel',
        city: 'Curitiba',
        state: 'PR',
        zipCode: '80240-000',
        country: 'Brasil'
      },
      isActive: true
    },
    {
      name: 'E-commerce Plus',
      cnpj: '56.789.012/0001-34',
      email: 'suporte@ecommerceplus.com.br',
      phone: '+55 51 3456-7890',
      address: {
        street: 'Av. Borges de Medeiros',
        number: '2000',
        complement: 'Sala 501',
        neighborhood: 'Centro Histórico',
        city: 'Porto Alegre',
        state: 'RS',
        zipCode: '90020-020',
        country: 'Brasil'
      },
      isActive: true
    }
  ];

  const clientesCriados = [];
  for (const cliente of clientes) {
    const clienteExistente = await prisma.client.findFirst({
      where: {
        tenantId: tenant.tenantId,
        name: cliente.name
      }
    });

    const clienteCriado = clienteExistente || await prisma.client.create({
      data: {
        tenantId: tenant.tenantId,
        name: cliente.name,
        cnpj: cliente.cnpj,
        email: cliente.email,
        phone: cliente.phone,
        address: cliente.address,
        isActive: cliente.isActive
      }
    });
    clientesCriados.push(clienteCriado);
    console.log(`✅ Cliente criado: ${cliente.name}`);
  }

  const fornecedores = [
    {
      name: 'Serviços de TI Premium',
      cnpj: '67.890.123/0001-45',
      email: 'vendas@servicostipremium.com.br',
      phone: '+55 11 9876-5432',
      address: {
        street: 'Rua Augusta',
        number: '2000',
        complement: 'Conjunto 301',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01413-000',
        country: 'Brasil'
      },
      services: ['Desenvolvimento', 'Infraestrutura', 'Suporte Técnico'],
      isActive: true
    },
    {
      name: 'Design Studio Creative',
      cnpj: '78.901.234/0001-56',
      email: 'contato@designstudio.com.br',
      phone: '+55 21 9876-5432',
      address: {
        street: 'Rua das Laranjeiras',
        number: '300',
        complement: '2º andar',
        neighborhood: 'Laranjeiras',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '22240-000',
        country: 'Brasil'
      },
      services: ['Design Gráfico', 'Branding', 'UI/UX Design'],
      isActive: true
    },
    {
      name: 'Marketing Digital Express',
      cnpj: '89.012.345/0001-67',
      email: 'atendimento@marketingexpress.com.br',
      phone: '+55 31 9876-5432',
      address: {
        street: 'Av. do Contorno',
        number: '4000',
        complement: 'Sala 200',
        neighborhood: 'Funcionários',
        city: 'Belo Horizonte',
        state: 'MG',
        zipCode: '30110-017',
        country: 'Brasil'
      },
      services: ['Marketing Digital', 'SEO', 'Redes Sociais'],
      isActive: true
    },
    {
      name: 'Cloud Hosting Solutions',
      cnpj: '90.123.456/0001-78',
      email: 'vendas@cloudhosting.com.br',
      phone: '+55 41 9876-5432',
      address: {
        street: 'Av. Maringá',
        number: '500',
        complement: 'Torre B',
        neighborhood: 'Centro',
        city: 'Curitiba',
        state: 'PR',
        zipCode: '80220-000',
        country: 'Brasil'
      },
      services: ['Hospedagem', 'Cloud Computing', 'Backup'],
      isActive: true
    }
  ];

  const fornecedoresCriados = [];
  for (const fornecedor of fornecedores) {
    const fornecedorExistente = await prisma.supplier.findFirst({
      where: {
        tenantId: tenant.tenantId,
        name: fornecedor.name
      }
    });

    const fornecedorCriado = fornecedorExistente || await prisma.supplier.create({
      data: {
        tenantId: tenant.tenantId,
        name: fornecedor.name,
        cnpj: fornecedor.cnpj,
        email: fornecedor.email,
        phone: fornecedor.phone,
        address: fornecedor.address,
        services: fornecedor.services,
        isActive: fornecedor.isActive
      }
    });
    fornecedoresCriados.push(fornecedorCriado);
    console.log(`✅ Fornecedor criado: ${fornecedor.name}`);
  }

  if (clientesCriados.length === 0) {
    throw new Error('Nenhum cliente foi criado. Não é possível criar projetos.');
  }

  const projetos = [
    {
      projectId: 'PROJ-001',
      name: 'Sistema de Gestão E-commerce',
      description: 'Desenvolvimento de plataforma completa de e-commerce com painel administrativo e integração com gateways de pagamento',
      clientId: clientesCriados[0]!.id,
      managerId: gestor.userId,
      status: 'active' as const,
      budget: {
        total: 250000,
        currency: 'BRL',
        allocated: 180000,
        spent: 120000
      },
      timeline: {
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-30'),
        milestones: [
          { name: 'Fase 1 - Planejamento', date: '2024-02-15', completed: true },
          { name: 'Fase 2 - Desenvolvimento', date: '2024-04-30', completed: false },
          { name: 'Fase 3 - Testes', date: '2024-05-31', completed: false },
          { name: 'Fase 4 - Lançamento', date: '2024-06-30', completed: false }
        ]
      },
      team: {
        members: [
          { userId: funcionario.userId, role: 'Desenvolvedor' },
          { userId: (await prisma.user.findUnique({ where: { userId: 'user-carlos-santos' } }))?.userId || '', role: 'Desenvolvedor' },
          { userId: (await prisma.user.findUnique({ where: { userId: 'user-maria-oliveira' } }))?.userId || '', role: 'Designer' }
        ],
        roles: ['Desenvolvedor', 'Designer', 'QA']
      },
      isActive: true
    },
    {
      projectId: 'PROJ-002',
      name: 'Aplicativo Mobile de Delivery',
      description: 'Desenvolvimento de aplicativo mobile nativo para iOS e Android com sistema de pedidos e rastreamento em tempo real',
      clientId: clientesCriados[1]!.id,
      managerId: (await prisma.user.findUnique({ where: { userId: 'user-ana-silva' } }))?.userId || gestor.userId,
      status: 'active' as const,
      budget: {
        total: 180000,
        currency: 'BRL',
        allocated: 150000,
        spent: 95000
      },
      timeline: {
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-07-15'),
        milestones: [
          { name: 'Fase 1 - Design', date: '2024-03-01', completed: true },
          { name: 'Fase 2 - Desenvolvimento iOS', date: '2024-05-15', completed: false },
          { name: 'Fase 3 - Desenvolvimento Android', date: '2024-06-30', completed: false },
          { name: 'Fase 4 - Testes e Lançamento', date: '2024-07-15', completed: false }
        ]
      },
      team: {
        members: [
          { userId: (await prisma.user.findUnique({ where: { userId: 'user-joao-costa' } }))?.userId || '', role: 'Desenvolvedor Mobile' },
          { userId: (await prisma.user.findUnique({ where: { userId: 'user-rafael-almeida' } }))?.userId || '', role: 'Desenvolvedor Frontend' }
        ],
        roles: ['Desenvolvedor Mobile', 'Designer', 'QA']
      },
      isActive: true
    },
    {
      projectId: 'PROJ-003',
      name: 'Portal Corporativo',
      description: 'Desenvolvimento de portal corporativo com área de membros, blog e sistema de notícias',
      clientId: clientesCriados[2]!.id,
      managerId: gestor.userId,
      status: 'planning' as const,
      budget: {
        total: 120000,
        currency: 'BRL',
        allocated: 0,
        spent: 0
      },
      timeline: {
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-08-31'),
        milestones: [
          { name: 'Fase 1 - Análise e Planejamento', date: '2024-03-31', completed: false },
          { name: 'Fase 2 - Desenvolvimento', date: '2024-07-31', completed: false },
          { name: 'Fase 3 - Testes', date: '2024-08-15', completed: false },
          { name: 'Fase 4 - Lançamento', date: '2024-08-31', completed: false }
        ]
      },
      team: {
        members: [],
        roles: []
      },
      isActive: true
    },
    {
      projectId: 'PROJ-004',
      name: 'Migração para Cloud',
      description: 'Migração completa da infraestrutura para cloud com otimização de custos e implementação de DevOps',
      clientId: clientesCriados[3]!.id,
      managerId: (await prisma.user.findUnique({ where: { userId: 'user-fernando-lima' } }))?.userId || gestor.userId,
      status: 'active' as const,
      budget: {
        total: 200000,
        currency: 'BRL',
        allocated: 200000,
        spent: 145000
      },
      timeline: {
        startDate: new Date('2024-01-10'),
        endDate: new Date('2024-05-30'),
        milestones: [
          { name: 'Fase 1 - Análise', date: '2024-01-31', completed: true },
          { name: 'Fase 2 - Migração', date: '2024-03-31', completed: true },
          { name: 'Fase 3 - Otimização', date: '2024-04-30', completed: false },
          { name: 'Fase 4 - Finalização', date: '2024-05-30', completed: false }
        ]
      },
      team: {
        members: [
          { userId: (await prisma.user.findUnique({ where: { userId: 'user-carlos-santos' } }))?.userId || '', role: 'DevOps' }
        ],
        roles: ['DevOps', 'Arquiteto de Sistemas']
      },
      isActive: true
    }
  ];

  const projetosCriados = [];
  for (const projeto of projetos) {
    const projetoCriado = await prisma.project.upsert({
      where: { projectId: projeto.projectId },
      update: {},
      create: {
        ...projeto,
        tenantId: tenant.tenantId
      }
    });
    projetosCriados.push(projetoCriado);
    console.log(`✅ Projeto criado: ${projeto.name}`);
  }

  if (projetosCriados.length === 0) {
    throw new Error('Nenhum projeto foi criado. Não é possível criar tarefas.');
  }

  const tarefas = [
    {
      taskId: 'TASK-001',
      projectId: projetosCriados[0]!.id,
      title: 'Criar wireframes do painel administrativo',
      description: 'Desenvolver wireframes detalhados de todas as telas do painel administrativo do e-commerce',
      assigneeId: (await prisma.user.findUnique({ where: { userId: 'user-maria-oliveira' } }))?.userId || funcionario.userId,
      reporterId: gestor.userId,
      status: 'done' as const,
      priority: 'high' as const,
      dueDate: new Date('2024-02-10'),
      estimatedHours: 16,
      completedHours: 18,
      tags: ['design', 'wireframe', 'ui'],
      isActive: true
    },
    {
      taskId: 'TASK-002',
      projectId: projetosCriados[0]!.id,
      title: 'Implementar sistema de autenticação',
      description: 'Desenvolver sistema completo de autenticação com JWT, refresh tokens e recuperação de senha',
      assigneeId: (await prisma.user.findUnique({ where: { userId: 'user-carlos-santos' } }))?.userId || funcionario.userId,
      reporterId: gestor.userId,
      status: 'in_progress' as const,
      priority: 'high' as const,
      dueDate: new Date('2024-03-15'),
      estimatedHours: 40,
      completedHours: 28,
      tags: ['backend', 'autenticação', 'segurança'],
      isActive: true
    },
    {
      taskId: 'TASK-003',
      projectId: projetosCriados[0]!.id,
      title: 'Integração com gateway de pagamento',
      description: 'Integrar sistema com gateway de pagamento (Stripe/PagSeguro) para processamento de transações',
      assigneeId: (await prisma.user.findUnique({ where: { userId: 'user-joao-costa' } }))?.userId || funcionario.userId,
      reporterId: gestor.userId,
      status: 'in_progress' as const,
      priority: 'urgent' as const,
      dueDate: new Date('2024-04-01'),
      estimatedHours: 32,
      completedHours: 20,
      tags: ['backend', 'integração', 'pagamento'],
      isActive: true
    },
    {
      taskId: 'TASK-004',
      projectId: projetosCriados[0]!.id,
      title: 'Desenvolver carrinho de compras',
      description: 'Criar funcionalidade completa de carrinho de compras com persistência e sincronização',
      assigneeId: (await prisma.user.findUnique({ where: { userId: 'user-rafael-almeida' } }))?.userId || funcionario.userId,
      reporterId: gestor.userId,
      status: 'todo' as const,
      priority: 'high' as const,
      dueDate: new Date('2024-04-15'),
      estimatedHours: 24,
      completedHours: 0,
      tags: ['frontend', 'carrinho', 'e-commerce'],
      isActive: true
    },
    {
      taskId: 'TASK-005',
      projectId: projetosCriados[1]!.id,
      title: 'Design do aplicativo mobile',
      description: 'Criar design completo do aplicativo seguindo guidelines do iOS e Material Design',
      assigneeId: (await prisma.user.findUnique({ where: { userId: 'user-maria-oliveira' } }))?.userId || funcionario.userId,
      reporterId: (await prisma.user.findUnique({ where: { userId: 'user-ana-silva' } }))?.userId || gestor.userId,
      status: 'done' as const,
      priority: 'high' as const,
      dueDate: new Date('2024-03-05'),
      estimatedHours: 48,
      completedHours: 50,
      tags: ['design', 'mobile', 'ui/ux'],
      isActive: true
    },
    {
      taskId: 'TASK-006',
      projectId: projetosCriados[1]!.id,
      title: 'Desenvolver tela de login e cadastro',
      description: 'Implementar telas de autenticação com validação e integração com backend',
      assigneeId: (await prisma.user.findUnique({ where: { userId: 'user-joao-costa' } }))?.userId || funcionario.userId,
      reporterId: (await prisma.user.findUnique({ where: { userId: 'user-ana-silva' } }))?.userId || gestor.userId,
      status: 'in_progress' as const,
      priority: 'high' as const,
      dueDate: new Date('2024-04-20'),
      estimatedHours: 20,
      completedHours: 12,
      tags: ['mobile', 'autenticação', 'ios'],
      isActive: true
    },
    {
      taskId: 'TASK-007',
      projectId: projetosCriados[1]!.id,
      title: 'Implementar rastreamento de pedidos',
      description: 'Desenvolver funcionalidade de rastreamento em tempo real com atualizações push',
      assigneeId: (await prisma.user.findUnique({ where: { userId: 'user-rafael-almeida' } }))?.userId || funcionario.userId,
      reporterId: (await prisma.user.findUnique({ where: { userId: 'user-ana-silva' } }))?.userId || gestor.userId,
      status: 'todo' as const,
      priority: 'medium' as const,
      dueDate: new Date('2024-06-15'),
      estimatedHours: 35,
      completedHours: 0,
      tags: ['mobile', 'real-time', 'notificações'],
      isActive: true
    },
    {
      taskId: 'TASK-008',
      projectId: projetosCriados[3]!.id,
      title: 'Configurar ambiente de produção na AWS',
      description: 'Configurar toda infraestrutura na AWS incluindo VPC, RDS, S3 e CloudFront',
      assigneeId: (await prisma.user.findUnique({ where: { userId: 'user-carlos-santos' } }))?.userId || funcionario.userId,
      reporterId: gestor.userId,
      status: 'done' as const,
      priority: 'urgent' as const,
      dueDate: new Date('2024-02-28'),
      estimatedHours: 40,
      completedHours: 42,
      tags: ['devops', 'aws', 'infraestrutura'],
      isActive: true
    },
    {
      taskId: 'TASK-009',
      projectId: projetosCriados[3]!.id,
      title: 'Migrar banco de dados para RDS',
      description: 'Realizar migração completa do banco de dados para Amazon RDS com backup e validação',
      assigneeId: (await prisma.user.findUnique({ where: { userId: 'user-carlos-santos' } }))?.userId || funcionario.userId,
      reporterId: gestor.userId,
      status: 'in_progress' as const,
      priority: 'high' as const,
      dueDate: new Date('2024-03-20'),
      estimatedHours: 24,
      completedHours: 18,
      tags: ['devops', 'database', 'migração'],
      isActive: true
    },
    {
      taskId: 'TASK-010',
      projectId: projetosCriados[3]!.id,
      title: 'Implementar CI/CD pipeline',
      description: 'Configurar pipeline completo de CI/CD usando GitHub Actions e AWS CodeDeploy',
      assigneeId: (await prisma.user.findUnique({ where: { userId: 'user-carlos-santos' } }))?.userId || funcionario.userId,
      reporterId: gestor.userId,
      status: 'todo' as const,
      priority: 'medium' as const,
      dueDate: new Date('2024-04-30'),
      estimatedHours: 30,
      completedHours: 0,
      tags: ['devops', 'ci/cd', 'automação'],
      isActive: true
    }
  ];

  for (const tarefa of tarefas) {
    await prisma.task.upsert({
      where: { taskId: tarefa.taskId },
      update: {},
      create: {
        ...tarefa,
        tenantId: tenant.tenantId
      }
    });
    console.log(`✅ Tarefa criada: ${tarefa.title}`);
  }

  const invoices = [
    {
      invoiceId: 'INV-001',
      projectId: projetosCriados[0]!.id,
      clientId: clientesCriados[0]!.id,
      invoiceNumber: 'FAT-2024-001',
      type: 'income' as const,
      amount: 50000,
      tax: 9000,
      total: 59000,
      currency: 'BRL',
      issueDate: new Date('2024-02-01'),
      dueDate: new Date('2024-02-28'),
      status: 'paid' as const,
      paymentDate: new Date('2024-02-25'),
      notes: 'Pagamento referente à Fase 1 do projeto'
    },
    {
      invoiceId: 'INV-002',
      projectId: projetosCriados[0]!.id,
      clientId: clientesCriados[0]!.id,
      invoiceNumber: 'FAT-2024-002',
      type: 'income' as const,
      amount: 75000,
      tax: 13500,
      total: 88500,
      currency: 'BRL',
      issueDate: new Date('2024-03-01'),
      dueDate: new Date('2024-03-31'),
      status: 'sent' as const,
      notes: 'Pagamento referente à Fase 2 do projeto'
    },
    {
      invoiceId: 'INV-003',
      projectId: projetosCriados[1]!.id,
      clientId: clientesCriados[1]!.id,
      invoiceNumber: 'FAT-2024-003',
      type: 'income' as const,
      amount: 45000,
      tax: 8100,
      total: 53100,
      currency: 'BRL',
      issueDate: new Date('2024-03-05'),
      dueDate: new Date('2024-04-05'),
      status: 'paid' as const,
      paymentDate: new Date('2024-04-02'),
      notes: 'Pagamento referente ao design do aplicativo'
    },
    {
      invoiceId: 'INV-004',
      supplierId: fornecedoresCriados[0]!.id,
      invoiceNumber: 'NF-2024-001',
      type: 'expense' as const,
      amount: 15000,
      tax: 2700,
      total: 17700,
      currency: 'BRL',
      issueDate: new Date('2024-02-15'),
      dueDate: new Date('2024-03-15'),
      status: 'paid' as const,
      paymentDate: new Date('2024-03-10'),
      notes: 'Serviços de infraestrutura e suporte'
    }
  ];

  for (const invoice of invoices) {
    await prisma.invoice.upsert({
      where: { invoiceId: invoice.invoiceId },
      update: {},
      create: {
        ...invoice,
        tenantId: tenant.tenantId
      }
    });
    console.log(`✅ Invoice criado: ${invoice.invoiceNumber}`);
  }

  const payments = [
    {
      paymentId: 'PAY-001',
      invoiceId: (await prisma.invoice.findUnique({ where: { invoiceId: 'INV-001' } }))?.id,
      amount: 59000,
      currency: 'BRL',
      method: 'bank_transfer' as const,
      paymentDate: new Date('2024-02-25'),
      status: 'completed' as const,
      transactionId: 'TXN-2024-001',
      notes: 'Pagamento via transferência bancária'
    },
    {
      paymentId: 'PAY-002',
      invoiceId: (await prisma.invoice.findUnique({ where: { invoiceId: 'INV-003' } }))?.id,
      amount: 53100,
      currency: 'BRL',
      method: 'pix' as const,
      paymentDate: new Date('2024-04-02'),
      status: 'completed' as const,
      transactionId: 'PIX-2024-001',
      notes: 'Pagamento via PIX'
    },
    {
      paymentId: 'PAY-003',
      invoiceId: (await prisma.invoice.findUnique({ where: { invoiceId: 'INV-004' } }))?.id,
      amount: 17700,
      currency: 'BRL',
      method: 'bank_transfer' as const,
      paymentDate: new Date('2024-03-10'),
      status: 'completed' as const,
      transactionId: 'TXN-2024-002',
      notes: 'Pagamento de despesa'
    }
  ];

  for (const payment of payments) {
    if (payment.invoiceId) {
      await prisma.payment.upsert({
        where: { paymentId: payment.paymentId },
        update: {},
        create: {
          ...payment,
          tenantId: tenant.tenantId
        }
      });
      console.log(`✅ Payment criado: ${payment.paymentId}`);
    }
  }

  console.log('');
  console.log('🎉 Seed concluído com sucesso!');
  console.log('');
  console.log('📋 Dados criados:');
  console.log(`- 1 Tenant: ${tenant.name}`);
  console.log(`- ${4 + usuariosAdicionais.length} Usuários`);
  console.log(`- ${clientes.length} Clientes`);
  console.log(`- ${fornecedores.length} Fornecedores`);
  console.log(`- ${projetos.length} Projetos`);
  console.log(`- ${tarefas.length} Tarefas`);
  console.log(`- ${invoices.length} Invoices`);
  console.log(`- ${payments.length} Payments`);
  console.log('');
  console.log('🔑 Credenciais de acesso (todos com senha 123456):');
  console.log('- Admin: admin@gestorpro.com');
  console.log('- Gestor: gestor@gestorpro.com');
  console.log('- Funcionário: funcionario@gestorpro.com');
  console.log('- Diretor: diretor@gestorpro.com');
  usuariosAdicionais.forEach(u => {
    console.log(`- ${u.firstName} ${u.lastName}: ${u.email}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
