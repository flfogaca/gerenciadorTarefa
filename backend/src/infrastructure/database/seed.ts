import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpando banco de dados...');
  
  await prisma.payment.deleteMany({});
  await prisma.financialTransaction.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.taskTimeEntry.deleteMany({});
  await prisma.taskComment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.template.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.userSettings.deleteMany({});
  await prisma.tenantSettings.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.tenant.deleteMany({});
  
  console.log('✅ Banco de dados limpo!');
  console.log('🌱 Iniciando seed do banco de dados...');

  const tenant = await prisma.tenant.create({
    data: {
      tenantId: 'default-tenant',
      name: 'GestorPro',
      domain: 'gestorpro.com',
      settings: {
        allowRegistration: true,
        maxUsers: 100,
        features: ['tasks', 'projects', 'reports', 'finance', 'team', 'analytics']
      }
    }
  });

  console.log('✅ Tenant criado:', tenant.name);

  const passwordHash = await bcrypt.hash('123456', 12);

  const admin = await prisma.user.create({
    data: {
      userId: 'admin-user-1',
      email: 'admin@gestorpro.com',
      firstName: 'Administrador',
      lastName: 'Sistema',
      password: passwordHash,
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

  const gestor = await prisma.user.create({
    data: {
      userId: 'gestor-user-1',
      email: 'gestor@gestorpro.com',
      firstName: 'Gestor',
      lastName: 'Projetos',
      password: passwordHash,
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

  const coordenador = await prisma.user.create({
    data: {
      userId: 'coordenador-user-1',
      email: 'coordenador@gestorpro.com',
      firstName: 'Coordenador',
      lastName: 'Projetos',
      password: passwordHash,
      role: 'manager',
      tenantId: tenant.tenantId,
      profile: {
        phone: '+55 11 99999-5555',
        department: 'Coordenação',
        position: 'Coordenador de Projetos'
      },
      isActive: true
    }
  });

  const funcionario = await prisma.user.create({
    data: {
      userId: 'func-user-1',
      email: 'funcionario@gestorpro.com',
      firstName: 'Funcionário',
      lastName: 'Exemplo',
      password: passwordHash,
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

  const diretor = await prisma.user.create({
    data: {
      userId: 'diretor-user-1',
      email: 'diretor@gestorpro.com',
      firstName: 'Diretor',
      lastName: 'Executivo',
      password: passwordHash,
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
    },
    {
      userId: 'user-lucas-martins',
      email: 'lucas.martins@gestorpro.com',
      firstName: 'Lucas',
      lastName: 'Martins',
      role: 'employee' as const,
      profile: {
        phone: '+55 11 98765-4329',
        department: 'Desenvolvimento',
        position: 'Desenvolvedor Mobile'
      }
    },
    {
      userId: 'user-patricia-souza',
      email: 'patricia.souza@gestorpro.com',
      firstName: 'Patrícia',
      lastName: 'Souza',
      role: 'employee' as const,
      profile: {
        phone: '+55 11 98765-4330',
        department: 'Financeiro',
        position: 'Analista Financeiro'
      }
    }
  ];

  for (const usuario of usuariosAdicionais) {
    await prisma.user.create({
      data: {
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
    },
    {
      name: 'StartupTech Innovation',
      cnpj: '67.890.123/0001-45',
      email: 'contato@startuptech.com.br',
      phone: '+55 11 3456-7891',
      address: {
        street: 'Rua Funchal',
        number: '300',
        complement: 'Conjunto 201',
        neighborhood: 'Vila Olímpia',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '04551-060',
        country: 'Brasil'
      },
      isActive: true
    }
  ];

  const clientesCriados = [];
  for (const cliente of clientes) {
    const clienteCriado = await prisma.client.create({
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
      cnpj: '78.901.234/0001-56',
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
      cnpj: '89.012.345/0001-67',
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
      cnpj: '90.123.456/0001-78',
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
      cnpj: '01.234.567/0001-89',
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
    const fornecedorCriado = await prisma.supplier.create({
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

  const usuariosMap = new Map();
  usuariosMap.set('gestor', gestor);
  usuariosMap.set('coordenador', coordenador);
  usuariosMap.set('funcionario', funcionario);
  usuariosMap.set('admin', admin);
  usuariosMap.set('diretor', diretor);
  
  for (const usuario of usuariosAdicionais) {
    const user = await prisma.user.findUnique({ where: { userId: usuario.userId } });
    if (user) usuariosMap.set(usuario.userId, user);
  }

  const projetos = [
    {
      projectId: 'PROJ-001',
      name: 'Sistema de Gestão E-commerce',
      description: 'Desenvolvimento de plataforma completa de e-commerce com painel administrativo, integração com gateways de pagamento e sistema de gestão de estoque',
      clientId: clientesCriados[0]!.id,
      managerId: gestor.userId,
      status: 'active' as const,
      budget: {
        total: 350000,
        currency: 'BRL',
        allocated: 280000,
        spent: 195000,
        remaining: 85000
      },
      timeline: {
        startDate: '2024-01-15',
        endDate: '2024-08-30',
        milestones: [
          { name: 'Fase 1 - Planejamento e Design', date: '2024-02-15', completed: true },
          { name: 'Fase 2 - Desenvolvimento Backend', date: '2024-05-30', completed: false },
          { name: 'Fase 3 - Desenvolvimento Frontend', date: '2024-07-15', completed: false },
          { name: 'Fase 4 - Testes e Integração', date: '2024-08-15', completed: false },
          { name: 'Fase 5 - Lançamento', date: '2024-08-30', completed: false }
        ]
      },
      team: {
        members: [
          { userId: funcionario.userId, role: 'Desenvolvedor Full Stack' },
          { userId: usuariosMap.get('user-carlos-santos')?.userId || '', role: 'Desenvolvedor Backend' },
          { userId: usuariosMap.get('user-maria-oliveira')?.userId || '', role: 'Designer UX/UI' },
          { userId: usuariosMap.get('user-rafael-almeida')?.userId || '', role: 'Desenvolvedor Frontend' }
        ],
        roles: ['Desenvolvedor', 'Designer', 'QA']
      },
      isActive: true
    },
    {
      projectId: 'PROJ-002',
      name: 'Aplicativo Mobile de Delivery',
      description: 'Desenvolvimento de aplicativo mobile nativo para iOS e Android com sistema de pedidos, rastreamento em tempo real e integração com restaurantes',
      clientId: clientesCriados[1]!.id,
      managerId: usuariosMap.get('user-ana-silva')?.userId || gestor.userId,
      status: 'active' as const,
      budget: {
        total: 280000,
        currency: 'BRL',
        allocated: 220000,
        spent: 165000,
        remaining: 55000
      },
      timeline: {
        startDate: '2024-02-01',
        endDate: '2024-09-15',
        milestones: [
          { name: 'Fase 1 - Design e Prototipação', date: '2024-03-01', completed: true },
          { name: 'Fase 2 - Desenvolvimento iOS', date: '2024-06-15', completed: false },
          { name: 'Fase 3 - Desenvolvimento Android', date: '2024-08-15', completed: false },
          { name: 'Fase 4 - Testes e Lançamento', date: '2024-09-15', completed: false }
        ]
      },
      team: {
        members: [
          { userId: usuariosMap.get('user-lucas-martins')?.userId || '', role: 'Desenvolvedor Mobile' },
          { userId: usuariosMap.get('user-rafael-almeida')?.userId || '', role: 'Desenvolvedor Frontend' },
          { userId: usuariosMap.get('user-maria-oliveira')?.userId || '', role: 'Designer Mobile' }
        ],
        roles: ['Desenvolvedor Mobile', 'Designer', 'QA']
      },
      isActive: true
    },
    {
      projectId: 'PROJ-003',
      name: 'Portal Corporativo Moderno',
      description: 'Desenvolvimento de portal corporativo responsivo com área de membros, blog integrado, sistema de notícias e painel administrativo',
      clientId: clientesCriados[2]!.id,
      managerId: gestor.userId,
      status: 'active' as const,
      budget: {
        total: 180000,
        currency: 'BRL',
        allocated: 150000,
        spent: 95000,
        remaining: 55000
      },
      timeline: {
        startDate: '2024-03-01',
        endDate: '2024-10-31',
        milestones: [
          { name: 'Fase 1 - Análise e Planejamento', date: '2024-03-31', completed: true },
          { name: 'Fase 2 - Desenvolvimento', date: '2024-08-31', completed: false },
          { name: 'Fase 3 - Testes', date: '2024-10-15', completed: false },
          { name: 'Fase 4 - Lançamento', date: '2024-10-31', completed: false }
        ]
      },
      team: {
        members: [
          { userId: usuariosMap.get('user-joao-costa')?.userId || '', role: 'Desenvolvedor Backend' },
          { userId: usuariosMap.get('user-rafael-almeida')?.userId || '', role: 'Desenvolvedor Frontend' }
        ],
        roles: ['Desenvolvedor', 'Designer']
      },
      isActive: true
    },
    {
      projectId: 'PROJ-004',
      name: 'Migração para Cloud AWS',
      description: 'Migração completa da infraestrutura para AWS com otimização de custos, implementação de DevOps e automação de processos',
      clientId: clientesCriados[3]!.id,
      managerId: usuariosMap.get('user-fernando-lima')?.userId || gestor.userId,
      status: 'active' as const,
      budget: {
        total: 250000,
        currency: 'BRL',
        allocated: 250000,
        spent: 185000,
        remaining: 65000
      },
      timeline: {
        startDate: '2024-01-10',
        endDate: '2024-06-30',
        milestones: [
          { name: 'Fase 1 - Análise e Planejamento', date: '2024-01-31', completed: true },
          { name: 'Fase 2 - Migração de Dados', date: '2024-03-31', completed: true },
          { name: 'Fase 3 - Otimização', date: '2024-05-31', completed: false },
          { name: 'Fase 4 - Finalização', date: '2024-06-30', completed: false }
        ]
      },
      team: {
        members: [
          { userId: usuariosMap.get('user-carlos-santos')?.userId || '', role: 'DevOps Engineer' },
          { userId: usuariosMap.get('user-joao-costa')?.userId || '', role: 'Arquiteto de Sistemas' }
        ],
        roles: ['DevOps', 'Arquiteto']
      },
      isActive: true
    },
    {
      projectId: 'PROJ-005',
      name: 'Sistema de CRM Personalizado',
      description: 'Desenvolvimento de sistema CRM completo com gestão de leads, pipeline de vendas, automação de marketing e relatórios avançados',
      clientId: clientesCriados[4]!.id,
      managerId: usuariosMap.get('user-paula-ferreira')?.userId || gestor.userId,
      status: 'active' as const,
      budget: {
        total: 320000,
        currency: 'BRL',
        allocated: 280000,
        spent: 210000,
        remaining: 70000
      },
      timeline: {
        startDate: '2024-02-15',
        endDate: '2024-11-30',
        milestones: [
          { name: 'Fase 1 - Requisitos e Design', date: '2024-03-15', completed: true },
          { name: 'Fase 2 - Módulo de Leads', date: '2024-06-30', completed: false },
          { name: 'Fase 3 - Módulo de Vendas', date: '2024-09-30', completed: false },
          { name: 'Fase 4 - Módulo de Marketing', date: '2024-11-15', completed: false },
          { name: 'Fase 5 - Lançamento', date: '2024-11-30', completed: false }
        ]
      },
      team: {
        members: [
          { userId: usuariosMap.get('user-carlos-santos')?.userId || '', role: 'Desenvolvedor Backend' },
          { userId: usuariosMap.get('user-rafael-almeida')?.userId || '', role: 'Desenvolvedor Frontend' },
          { userId: usuariosMap.get('user-maria-oliveira')?.userId || '', role: 'Designer UX' }
        ],
        roles: ['Desenvolvedor', 'Designer', 'Analista']
      },
      isActive: true
    },
    {
      projectId: 'PROJ-006',
      name: 'Plataforma de E-learning',
      description: 'Desenvolvimento de plataforma completa de ensino a distância com videoaulas, quizzes, certificados e área de membros',
      clientId: clientesCriados[5]!.id,
      managerId: usuariosMap.get('user-ana-silva')?.userId || gestor.userId,
      status: 'planning' as const,
      budget: {
        total: 400000,
        currency: 'BRL',
        allocated: 0,
        spent: 0,
        remaining: 400000
      },
      timeline: {
        startDate: '2024-04-01',
        endDate: '2024-12-31',
        milestones: [
          { name: 'Fase 1 - Planejamento', date: '2024-04-30', completed: false },
          { name: 'Fase 2 - Desenvolvimento', date: '2024-10-31', completed: false },
          { name: 'Fase 3 - Testes', date: '2024-12-15', completed: false },
          { name: 'Fase 4 - Lançamento', date: '2024-12-31', completed: false }
        ]
      },
      team: {
        members: [],
        roles: []
      },
      isActive: true
    },
    {
      projectId: 'PROJ-007',
      name: 'Dashboard Analytics Avançado',
      description: 'Desenvolvimento de dashboard de analytics com visualizações interativas, relatórios em tempo real e exportação de dados',
      clientId: clientesCriados[0]!.id,
      managerId: gestor.userId,
      status: 'active' as const,
      budget: {
        total: 150000,
        currency: 'BRL',
        allocated: 120000,
        spent: 85000,
        remaining: 35000
      },
      timeline: {
        startDate: '2024-03-15',
        endDate: '2024-08-15',
        milestones: [
          { name: 'Fase 1 - Design', date: '2024-04-15', completed: true },
          { name: 'Fase 2 - Desenvolvimento', date: '2024-07-15', completed: false },
          { name: 'Fase 3 - Testes', date: '2024-08-01', completed: false },
          { name: 'Fase 4 - Deploy', date: '2024-08-15', completed: false }
        ]
      },
      team: {
        members: [
          { userId: usuariosMap.get('user-rafael-almeida')?.userId || '', role: 'Desenvolvedor Frontend' },
          { userId: usuariosMap.get('user-joao-costa')?.userId || '', role: 'Desenvolvedor Backend' }
        ],
        roles: ['Desenvolvedor', 'Analista de Dados']
      },
      isActive: true
    },
    {
      projectId: 'PROJ-008',
      name: 'Sistema de Gestão de Estoque',
      description: 'Sistema completo de gestão de estoque com controle de entrada/saída, relatórios de inventário e integração com fornecedores',
      clientId: clientesCriados[1]!.id,
      managerId: usuariosMap.get('user-fernando-lima')?.userId || gestor.userId,
      status: 'completed' as const,
      budget: {
        total: 200000,
        currency: 'BRL',
        allocated: 200000,
        spent: 195000,
        remaining: 5000
      },
      timeline: {
        startDate: '2023-10-01',
        endDate: '2024-01-31',
        milestones: [
          { name: 'Fase 1 - Planejamento', date: '2023-10-31', completed: true },
          { name: 'Fase 2 - Desenvolvimento', date: '2023-12-31', completed: true },
          { name: 'Fase 3 - Testes', date: '2024-01-15', completed: true },
          { name: 'Fase 4 - Lançamento', date: '2024-01-31', completed: true }
        ]
      },
      team: {
        members: [
          { userId: usuariosMap.get('user-carlos-santos')?.userId || '', role: 'Desenvolvedor' },
          { userId: usuariosMap.get('user-juliana-rodrigues')?.userId || '', role: 'QA' }
        ],
        roles: ['Desenvolvedor', 'QA']
      },
      isActive: true
    }
  ];

  const projetosCriados = [];
  for (const projeto of projetos) {
    const projetoCriado = await prisma.project.create({
      data: {
        ...projeto,
        tenantId: tenant.tenantId
      }
    });
    projetosCriados.push(projetoCriado);
    console.log(`✅ Projeto criado: ${projeto.name}`);
  }

  const tarefas = [
    {
      taskId: 'TASK-001',
      projectId: projetosCriados[0]!.id,
      title: 'Criar wireframes do painel administrativo',
      description: 'Desenvolver wireframes detalhados de todas as telas do painel administrativo do e-commerce',
      assigneeId: usuariosMap.get('user-maria-oliveira')?.userId || funcionario.userId,
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
      assigneeId: usuariosMap.get('user-carlos-santos')?.userId || funcionario.userId,
      reporterId: gestor.userId,
      status: 'done' as const,
      priority: 'high' as const,
      dueDate: new Date('2024-03-15'),
      estimatedHours: 40,
      completedHours: 42,
      tags: ['backend', 'autenticação', 'segurança'],
      isActive: true
    },
    {
      taskId: 'TASK-003',
      projectId: projetosCriados[0]!.id,
      title: 'Integração com gateway de pagamento',
      description: 'Integrar sistema com gateway de pagamento (Stripe/PagSeguro) para processamento de transações',
      assigneeId: usuariosMap.get('user-joao-costa')?.userId || funcionario.userId,
      reporterId: gestor.userId,
      status: 'in_progress' as const,
      priority: 'urgent' as const,
      dueDate: new Date('2024-04-01'),
      estimatedHours: 32,
      completedHours: 24,
      tags: ['backend', 'integração', 'pagamento'],
      isActive: true
    },
    {
      taskId: 'TASK-004',
      projectId: projetosCriados[0]!.id,
      title: 'Desenvolver carrinho de compras',
      description: 'Criar funcionalidade completa de carrinho de compras com persistência e sincronização',
      assigneeId: usuariosMap.get('user-rafael-almeida')?.userId || funcionario.userId,
      reporterId: gestor.userId,
      status: 'in_progress' as const,
      priority: 'high' as const,
      dueDate: new Date('2024-04-15'),
      estimatedHours: 24,
      completedHours: 16,
      tags: ['frontend', 'carrinho', 'e-commerce'],
      isActive: true
    },
    {
      taskId: 'TASK-005',
      projectId: projetosCriados[0]!.id,
      title: 'Sistema de gestão de produtos',
      description: 'Desenvolver CRUD completo de produtos com categorias, variações e estoque',
      assigneeId: usuariosMap.get('user-carlos-santos')?.userId || funcionario.userId,
      reporterId: gestor.userId,
      status: 'todo' as const,
      priority: 'high' as const,
      dueDate: new Date('2024-05-01'),
      estimatedHours: 48,
      completedHours: 0,
      tags: ['backend', 'crud', 'produtos'],
      isActive: true
    },
    {
      taskId: 'TASK-006',
      projectId: projetosCriados[1]!.id,
      title: 'Design do aplicativo mobile',
      description: 'Criar design completo do aplicativo seguindo guidelines do iOS e Material Design',
      assigneeId: usuariosMap.get('user-maria-oliveira')?.userId || funcionario.userId,
      reporterId: usuariosMap.get('user-ana-silva')?.userId || gestor.userId,
      status: 'done' as const,
      priority: 'high' as const,
      dueDate: new Date('2024-03-05'),
      estimatedHours: 48,
      completedHours: 50,
      tags: ['design', 'mobile', 'ui/ux'],
      isActive: true
    },
    {
      taskId: 'TASK-007',
      projectId: projetosCriados[1]!.id,
      title: 'Desenvolver tela de login e cadastro',
      description: 'Implementar telas de autenticação com validação e integração com backend',
      assigneeId: usuariosMap.get('user-lucas-martins')?.userId || funcionario.userId,
      reporterId: usuariosMap.get('user-ana-silva')?.userId || gestor.userId,
      status: 'in_progress' as const,
      priority: 'high' as const,
      dueDate: new Date('2024-04-20'),
      estimatedHours: 20,
      completedHours: 14,
      tags: ['mobile', 'autenticação', 'ios'],
      isActive: true
    },
    {
      taskId: 'TASK-008',
      projectId: projetosCriados[1]!.id,
      title: 'Implementar rastreamento de pedidos',
      description: 'Desenvolver funcionalidade de rastreamento em tempo real com atualizações push',
      assigneeId: usuariosMap.get('user-lucas-martins')?.userId || funcionario.userId,
      reporterId: usuariosMap.get('user-ana-silva')?.userId || gestor.userId,
      status: 'todo' as const,
      priority: 'medium' as const,
      dueDate: new Date('2024-06-15'),
      estimatedHours: 35,
      completedHours: 0,
      tags: ['mobile', 'real-time', 'notificações'],
      isActive: true
    },
    {
      taskId: 'TASK-009',
      projectId: projetosCriados[3]!.id,
      title: 'Configurar ambiente de produção na AWS',
      description: 'Configurar toda infraestrutura na AWS incluindo VPC, RDS, S3 e CloudFront',
      assigneeId: usuariosMap.get('user-carlos-santos')?.userId || funcionario.userId,
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
      taskId: 'TASK-010',
      projectId: projetosCriados[3]!.id,
      title: 'Migrar banco de dados para RDS',
      description: 'Realizar migração completa do banco de dados para Amazon RDS com backup e validação',
      assigneeId: usuariosMap.get('user-carlos-santos')?.userId || funcionario.userId,
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
      taskId: 'TASK-011',
      projectId: projetosCriados[3]!.id,
      title: 'Implementar CI/CD pipeline',
      description: 'Configurar pipeline completo de CI/CD usando GitHub Actions e AWS CodeDeploy',
      assigneeId: usuariosMap.get('user-carlos-santos')?.userId || funcionario.userId,
      reporterId: gestor.userId,
      status: 'todo' as const,
      priority: 'medium' as const,
      dueDate: new Date('2024-04-30'),
      estimatedHours: 30,
      completedHours: 0,
      tags: ['devops', 'ci/cd', 'automação'],
      isActive: true
    },
    {
      taskId: 'TASK-012',
      projectId: projetosCriados[4]!.id,
      title: 'Desenvolver módulo de gestão de leads',
      description: 'Criar sistema completo de captura, qualificação e acompanhamento de leads',
      assigneeId: usuariosMap.get('user-carlos-santos')?.userId || funcionario.userId,
      reporterId: usuariosMap.get('user-paula-ferreira')?.userId || gestor.userId,
      status: 'in_progress' as const,
      priority: 'high' as const,
      dueDate: new Date('2024-05-15'),
      estimatedHours: 60,
      completedHours: 45,
      tags: ['backend', 'crm', 'leads'],
      isActive: true
    },
    {
      taskId: 'TASK-013',
      projectId: projetosCriados[4]!.id,
      title: 'Criar pipeline de vendas visual',
      description: 'Desenvolver interface visual para gerenciamento de pipeline de vendas com drag and drop',
      assigneeId: usuariosMap.get('user-rafael-almeida')?.userId || funcionario.userId,
      reporterId: usuariosMap.get('user-paula-ferreira')?.userId || gestor.userId,
      status: 'todo' as const,
      priority: 'high' as const,
      dueDate: new Date('2024-07-30'),
      estimatedHours: 40,
      completedHours: 0,
      tags: ['frontend', 'crm', 'pipeline'],
      isActive: true
    },
    {
      taskId: 'TASK-014',
      projectId: projetosCriados[7]!.id,
      title: 'Implementar controle de entrada/saída',
      description: 'Desenvolver sistema de controle de entrada e saída de produtos com validação',
      assigneeId: usuariosMap.get('user-carlos-santos')?.userId || funcionario.userId,
      reporterId: usuariosMap.get('user-fernando-lima')?.userId || gestor.userId,
      status: 'done' as const,
      priority: 'high' as const,
      dueDate: new Date('2023-11-30'),
      estimatedHours: 32,
      completedHours: 35,
      tags: ['backend', 'estoque', 'controle'],
      isActive: true
    },
    {
      taskId: 'TASK-015',
      projectId: projetosCriados[7]!.id,
      title: 'Relatórios de inventário',
      description: 'Criar sistema de relatórios de inventário com exportação para Excel e PDF',
      assigneeId: usuariosMap.get('user-joao-costa')?.userId || funcionario.userId,
      reporterId: usuariosMap.get('user-fernando-lima')?.userId || gestor.userId,
      status: 'done' as const,
      priority: 'medium' as const,
      dueDate: new Date('2023-12-15'),
      estimatedHours: 24,
      completedHours: 26,
      tags: ['backend', 'relatórios', 'exportação'],
      isActive: true
    }
  ];

  for (const tarefa of tarefas) {
    await prisma.task.create({
      data: {
        ...tarefa,
        tenantId: tenant.tenantId
      }
    });
    console.log(`✅ Tarefa criada: ${tarefa.title}`);
  }

  const expenses = [
    {
      expenseId: 'EXP-001',
      projectId: projetosCriados[0]!.id,
      supplierId: fornecedoresCriados[0]!.id,
      category: 'Infraestrutura',
      description: 'Serviços de hospedagem e infraestrutura cloud',
      amount: 15000,
      currency: 'BRL',
      date: new Date('2024-02-15'),
      invoiceNumber: 'NF-2024-001',
      status: 'paid' as const,
      approvedBy: gestor.userId,
      approvedAt: new Date('2024-02-20'),
      notes: 'Hospedagem mensal AWS'
    },
    {
      expenseId: 'EXP-002',
      projectId: projetosCriados[1]!.id,
      supplierId: fornecedoresCriados[1]!.id,
      category: 'Design',
      description: 'Serviços de design gráfico e UI/UX',
      amount: 25000,
      currency: 'BRL',
      date: new Date('2024-03-01'),
      invoiceNumber: 'NF-2024-002',
      status: 'paid' as const,
      approvedBy: usuariosMap.get('user-ana-silva')?.userId || gestor.userId,
      approvedAt: new Date('2024-03-05'),
      notes: 'Design do aplicativo mobile'
    },
    {
      expenseId: 'EXP-003',
      projectId: projetosCriados[3]!.id,
      supplierId: fornecedoresCriados[3]!.id,
      category: 'Infraestrutura',
      description: 'Serviços de cloud hosting e backup',
      amount: 18000,
      currency: 'BRL',
      date: new Date('2024-02-20'),
      invoiceNumber: 'NF-2024-003',
      status: 'paid' as const,
      approvedBy: gestor.userId,
      approvedAt: new Date('2024-02-25'),
      notes: 'Serviços de cloud para migração'
    },
    {
      expenseId: 'EXP-004',
      projectId: projetosCriados[4]!.id,
      supplierId: fornecedoresCriados[2]!.id,
      category: 'Marketing',
      description: 'Serviços de marketing digital e SEO',
      amount: 12000,
      currency: 'BRL',
      date: new Date('2024-03-10'),
      invoiceNumber: 'NF-2024-004',
      status: 'approved' as const,
      approvedBy: usuariosMap.get('user-paula-ferreira')?.userId || gestor.userId,
      approvedAt: new Date('2024-03-12'),
      notes: 'Campanha de marketing para CRM'
    },
    {
      expenseId: 'EXP-005',
      category: 'Geral',
      description: 'Material de escritório e suprimentos',
      amount: 3500,
      currency: 'BRL',
      date: new Date('2024-03-15'),
      invoiceNumber: 'NF-2024-005',
      status: 'pending' as const,
      notes: 'Material de escritório'
    }
  ];

  for (const expense of expenses) {
    await prisma.expense.create({
      data: {
        ...expense,
        tenantId: tenant.tenantId
      }
    });
    console.log(`✅ Despesa criada: ${expense.description}`);
  }

  const invoices = [
    {
      invoiceId: 'INV-001',
      projectId: projetosCriados[0]!.id,
      clientId: clientesCriados[0]!.id,
      invoiceNumber: 'FAT-2024-001',
      type: 'income' as const,
      amount: 70000,
      tax: 12600,
      total: 82600,
      currency: 'BRL',
      issueDate: new Date('2024-02-01'),
      dueDate: new Date('2024-02-28'),
      status: 'paid' as const,
      paymentDate: new Date('2024-02-25'),
      notes: 'Pagamento referente à Fase 1 do projeto - E-commerce'
    },
    {
      invoiceId: 'INV-002',
      projectId: projetosCriados[0]!.id,
      clientId: clientesCriados[0]!.id,
      invoiceNumber: 'FAT-2024-002',
      type: 'income' as const,
      amount: 105000,
      tax: 18900,
      total: 123900,
      currency: 'BRL',
      issueDate: new Date('2024-03-01'),
      dueDate: new Date('2024-03-31'),
      status: 'sent' as const,
      notes: 'Pagamento referente à Fase 2 do projeto - E-commerce'
    },
    {
      invoiceId: 'INV-003',
      projectId: projetosCriados[1]!.id,
      clientId: clientesCriados[1]!.id,
      invoiceNumber: 'FAT-2024-003',
      type: 'income' as const,
      amount: 55000,
      tax: 9900,
      total: 64900,
      currency: 'BRL',
      issueDate: new Date('2024-03-05'),
      dueDate: new Date('2024-04-05'),
      status: 'paid' as const,
      paymentDate: new Date('2024-04-02'),
      notes: 'Pagamento referente ao design do aplicativo mobile'
    },
    {
      invoiceId: 'INV-004',
      projectId: projetosCriados[1]!.id,
      clientId: clientesCriados[1]!.id,
      invoiceNumber: 'FAT-2024-004',
      type: 'income' as const,
      amount: 80000,
      tax: 14400,
      total: 94400,
      currency: 'BRL',
      issueDate: new Date('2024-04-01'),
      dueDate: new Date('2024-05-01'),
      status: 'sent' as const,
      notes: 'Pagamento referente ao desenvolvimento iOS'
    },
    {
      invoiceId: 'INV-005',
      projectId: projetosCriados[3]!.id,
      clientId: clientesCriados[3]!.id,
      invoiceNumber: 'FAT-2024-005',
      type: 'income' as const,
      amount: 95000,
      tax: 17100,
      total: 112100,
      currency: 'BRL',
      issueDate: new Date('2024-02-15'),
      dueDate: new Date('2024-03-15'),
      status: 'paid' as const,
      paymentDate: new Date('2024-03-12'),
      notes: 'Pagamento referente à migração para AWS - Fase 1'
    },
    {
      invoiceId: 'INV-006',
      projectId: projetosCriados[4]!.id,
      clientId: clientesCriados[4]!.id,
      invoiceNumber: 'FAT-2024-006',
      type: 'income' as const,
      amount: 120000,
      tax: 21600,
      total: 141600,
      currency: 'BRL',
      issueDate: new Date('2024-03-01'),
      dueDate: new Date('2024-04-01'),
      status: 'paid' as const,
      paymentDate: new Date('2024-03-28'),
      notes: 'Pagamento referente ao módulo de leads do CRM'
    },
    {
      invoiceId: 'INV-007',
      projectId: projetosCriados[7]!.id,
      clientId: clientesCriados[1]!.id,
      invoiceNumber: 'FAT-2023-010',
      type: 'income' as const,
      amount: 200000,
      tax: 36000,
      total: 236000,
      currency: 'BRL',
      issueDate: new Date('2024-01-15'),
      dueDate: new Date('2024-02-15'),
      status: 'paid' as const,
      paymentDate: new Date('2024-02-10'),
      notes: 'Pagamento final do projeto de gestão de estoque'
    },
    {
      invoiceId: 'INV-008',
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
    },
    {
      invoiceId: 'INV-009',
      supplierId: fornecedoresCriados[1]!.id,
      invoiceNumber: 'NF-2024-002',
      type: 'expense' as const,
      amount: 25000,
      tax: 4500,
      total: 29500,
      currency: 'BRL',
      issueDate: new Date('2024-03-01'),
      dueDate: new Date('2024-04-01'),
      status: 'paid' as const,
      paymentDate: new Date('2024-03-28'),
      notes: 'Serviços de design gráfico'
    }
  ];

  for (const invoice of invoices) {
    await prisma.invoice.create({
      data: {
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
      amount: 82600,
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
      amount: 64900,
      currency: 'BRL',
      method: 'pix' as const,
      paymentDate: new Date('2024-04-02'),
      status: 'completed' as const,
      transactionId: 'PIX-2024-001',
      notes: 'Pagamento via PIX'
    },
    {
      paymentId: 'PAY-003',
      invoiceId: (await prisma.invoice.findUnique({ where: { invoiceId: 'INV-005' } }))?.id,
      amount: 112100,
      currency: 'BRL',
      method: 'bank_transfer' as const,
      paymentDate: new Date('2024-03-12'),
      status: 'completed' as const,
      transactionId: 'TXN-2024-003',
      notes: 'Pagamento via transferência bancária'
    },
    {
      paymentId: 'PAY-004',
      invoiceId: (await prisma.invoice.findUnique({ where: { invoiceId: 'INV-006' } }))?.id,
      amount: 141600,
      currency: 'BRL',
      method: 'bank_transfer' as const,
      paymentDate: new Date('2024-03-28'),
      status: 'completed' as const,
      transactionId: 'TXN-2024-004',
      notes: 'Pagamento via transferência bancária'
    },
    {
      paymentId: 'PAY-005',
      invoiceId: (await prisma.invoice.findUnique({ where: { invoiceId: 'INV-007' } }))?.id,
      amount: 236000,
      currency: 'BRL',
      method: 'bank_transfer' as const,
      paymentDate: new Date('2024-02-10'),
      status: 'completed' as const,
      transactionId: 'TXN-2023-010',
      notes: 'Pagamento final do projeto'
    },
    {
      paymentId: 'PAY-006',
      invoiceId: (await prisma.invoice.findUnique({ where: { invoiceId: 'INV-008' } }))?.id,
      amount: 17700,
      currency: 'BRL',
      method: 'bank_transfer' as const,
      paymentDate: new Date('2024-03-10'),
      status: 'completed' as const,
      transactionId: 'TXN-2024-005',
      notes: 'Pagamento de despesa'
    },
    {
      paymentId: 'PAY-007',
      invoiceId: (await prisma.invoice.findUnique({ where: { invoiceId: 'INV-009' } }))?.id,
      amount: 29500,
      currency: 'BRL',
      method: 'bank_transfer' as const,
      paymentDate: new Date('2024-03-28'),
      status: 'completed' as const,
      transactionId: 'TXN-2024-006',
      notes: 'Pagamento de despesa'
    }
  ];

  for (const payment of payments) {
    if (payment.invoiceId) {
      await prisma.payment.create({
        data: {
          ...payment,
          tenantId: tenant.tenantId
        }
      });
      console.log(`✅ Payment criado: ${payment.paymentId}`);
    }
  }

  const financialTransactions = [
    {
      transactionId: 'TXN-FIN-001',
      type: 'income' as const,
      amount: 82600,
      currency: 'BRL',
      category: 'Receita de Projetos',
      description: 'Recebimento Fase 1 - Sistema E-commerce',
      relatedEntity: 'invoice',
      relatedEntityId: (await prisma.invoice.findUnique({ where: { invoiceId: 'INV-001' } }))?.id,
      date: new Date('2024-02-25'),
      reconciled: true,
      reconciledAt: new Date('2024-02-25')
    },
    {
      transactionId: 'TXN-FIN-002',
      type: 'income' as const,
      amount: 64900,
      currency: 'BRL',
      category: 'Receita de Projetos',
      description: 'Recebimento Design - App Mobile',
      relatedEntity: 'invoice',
      relatedEntityId: (await prisma.invoice.findUnique({ where: { invoiceId: 'INV-003' } }))?.id,
      date: new Date('2024-04-02'),
      reconciled: true,
      reconciledAt: new Date('2024-04-02')
    },
    {
      transactionId: 'TXN-FIN-003',
      type: 'expense' as const,
      amount: 17700,
      currency: 'BRL',
      category: 'Infraestrutura',
      description: 'Pagamento serviços de infraestrutura',
      relatedEntity: 'invoice',
      relatedEntityId: (await prisma.invoice.findUnique({ where: { invoiceId: 'INV-008' } }))?.id,
      date: new Date('2024-03-10'),
      reconciled: true,
      reconciledAt: new Date('2024-03-10')
    },
    {
      transactionId: 'TXN-FIN-004',
      type: 'income' as const,
      amount: 112100,
      currency: 'BRL',
      category: 'Receita de Projetos',
      description: 'Recebimento Migração AWS',
      relatedEntity: 'invoice',
      relatedEntityId: (await prisma.invoice.findUnique({ where: { invoiceId: 'INV-005' } }))?.id,
      date: new Date('2024-03-12'),
      reconciled: true,
      reconciledAt: new Date('2024-03-12')
    },
    {
      transactionId: 'TXN-FIN-005',
      type: 'income' as const,
      amount: 141600,
      currency: 'BRL',
      category: 'Receita de Projetos',
      description: 'Recebimento Módulo Leads CRM',
      relatedEntity: 'invoice',
      relatedEntityId: (await prisma.invoice.findUnique({ where: { invoiceId: 'INV-006' } }))?.id,
      date: new Date('2024-03-28'),
      reconciled: true,
      reconciledAt: new Date('2024-03-28')
    }
  ];

  for (const transaction of financialTransactions) {
    await prisma.financialTransaction.create({
      data: {
        ...transaction,
        tenantId: tenant.tenantId
      }
    });
    console.log(`✅ Transação financeira criada: ${transaction.transactionId}`);
  }

  const reports = [
    {
      name: 'Relatório Financeiro Mensal - Março 2024',
      type: 'financial',
      projectId: null,
      data: {
        totalRevenue: 404200,
        totalExpenses: 47200,
        netProfit: 357000,
        invoices: 6,
        payments: 5,
        expenses: 3
      },
      filters: {
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        type: 'monthly'
      }
    },
    {
      name: 'Relatório de Projetos Ativos',
      type: 'projects',
      projectId: null,
      data: {
        totalProjects: 7,
        activeProjects: 6,
        completedProjects: 1,
        totalBudget: 1980000,
        totalSpent: 945000,
        totalRemaining: 1035000
      },
      filters: {
        status: 'active',
        dateRange: 'all'
      }
    },
    {
      name: 'Relatório de Produtividade da Equipe',
      type: 'team',
      projectId: null,
      data: {
        totalTasks: 15,
        completedTasks: 6,
        inProgressTasks: 5,
        todoTasks: 4,
        totalHours: 480,
        completedHours: 280
      },
      filters: {
        startDate: '2024-01-01',
        endDate: '2024-04-30'
      }
    },
    {
      name: 'Relatório do Projeto E-commerce',
      type: 'project',
      projectId: projetosCriados[0]!.id,
      data: {
        projectName: 'Sistema de Gestão E-commerce',
        tasks: 5,
        completedTasks: 2,
        budget: 350000,
        spent: 195000,
        progress: 55.7
      },
      filters: {
        projectId: projetosCriados[0]!.id
      }
    }
  ];

  for (const report of reports) {
    await prisma.report.create({
      data: {
        ...report,
        tenantId: tenant.tenantId
      }
    });
    console.log(`✅ Relatório criado: ${report.name}`);
  }

  const templates = [
    {
      templateId: 'TEMPLATE-001',
      name: 'Template E-commerce Completo',
      description: 'Template completo para projetos de e-commerce incluindo todas as fases',
      category: 'E-commerce',
      isDefault: true,
      isPublic: true,
      createdBy: gestor.userId,
      phases: [
        { name: 'Planejamento', order: 1, duration: 30 },
        { name: 'Design', order: 2, duration: 45 },
        { name: 'Desenvolvimento', order: 3, duration: 120 },
        { name: 'Testes', order: 4, duration: 30 },
        { name: 'Lançamento', order: 5, duration: 15 }
      ],
      tasks: [
        { name: 'Wireframes', phase: 1, estimatedHours: 16 },
        { name: 'Design UI/UX', phase: 2, estimatedHours: 48 },
        { name: 'Desenvolvimento Backend', phase: 3, estimatedHours: 200 },
        { name: 'Desenvolvimento Frontend', phase: 3, estimatedHours: 160 },
        { name: 'Testes de Integração', phase: 4, estimatedHours: 40 }
      ],
      tags: ['e-commerce', 'web', 'completo'],
      isActive: true
    },
    {
      templateId: 'TEMPLATE-002',
      name: 'Template Aplicativo Mobile',
      description: 'Template para desenvolvimento de aplicativos mobile nativos',
      category: 'Mobile',
      isDefault: false,
      isPublic: true,
      createdBy: usuariosMap.get('user-ana-silva')?.userId || gestor.userId,
      phases: [
        { name: 'Design', order: 1, duration: 30 },
        { name: 'Desenvolvimento iOS', order: 2, duration: 90 },
        { name: 'Desenvolvimento Android', order: 3, duration: 90 },
        { name: 'Testes', order: 4, duration: 30 }
      ],
      tasks: [
        { name: 'Design Mobile', phase: 1, estimatedHours: 48 },
        { name: 'Desenvolvimento iOS', phase: 2, estimatedHours: 240 },
        { name: 'Desenvolvimento Android', phase: 3, estimatedHours: 240 }
      ],
      tags: ['mobile', 'ios', 'android'],
      isActive: true
    },
    {
      templateId: 'TEMPLATE-003',
      name: 'Template Migração Cloud',
      description: 'Template para projetos de migração para cloud',
      category: 'Infraestrutura',
      isDefault: false,
      isPublic: true,
      createdBy: gestor.userId,
      phases: [
        { name: 'Análise', order: 1, duration: 20 },
        { name: 'Planejamento', order: 2, duration: 15 },
        { name: 'Migração', order: 3, duration: 60 },
        { name: 'Otimização', order: 4, duration: 30 }
      ],
      tasks: [
        { name: 'Análise de Infraestrutura', phase: 1, estimatedHours: 40 },
        { name: 'Planejamento de Migração', phase: 2, estimatedHours: 30 },
        { name: 'Migração de Dados', phase: 3, estimatedHours: 120 }
      ],
      tags: ['cloud', 'migração', 'devops'],
      isActive: true
    }
  ];

  for (const template of templates) {
    await prisma.template.create({
      data: {
        ...template,
        tenantId: tenant.tenantId
      }
    });
    console.log(`✅ Template criado: ${template.name}`);
  }

  const notifications = [
    {
      tenantId: tenant.tenantId,
      userId: gestor.userId,
      type: 'task_assigned',
      title: 'Nova tarefa atribuída',
      message: 'Você foi atribuído à tarefa "Integração com gateway de pagamento"',
      data: { taskId: 'TASK-003', projectId: projetosCriados[0]!.id },
      channel: 'in_app',
      status: 'sent',
      priority: 'high',
      sentAt: new Date('2024-03-20'),
      createdAt: new Date('2024-03-20')
    },
    {
      tenantId: tenant.tenantId,
      userId: funcionario.userId,
      type: 'project_update',
      title: 'Atualização no projeto',
      message: 'O projeto "Sistema de Gestão E-commerce" foi atualizado',
      data: { projectId: projetosCriados[0]!.id },
      channel: 'in_app',
      status: 'sent',
      priority: 'normal',
      sentAt: new Date('2024-03-18'),
      createdAt: new Date('2024-03-18')
    },
    {
      tenantId: tenant.tenantId,
      userId: admin.userId,
      type: 'invoice_paid',
      title: 'Invoice pago',
      message: 'O invoice FAT-2024-001 foi pago com sucesso',
      data: { invoiceId: 'INV-001' },
      channel: 'in_app',
      status: 'sent',
      priority: 'normal',
      sentAt: new Date('2024-02-25'),
      createdAt: new Date('2024-02-25')
    }
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification
    });
    console.log(`✅ Notificação criada: ${notification.title}`);
  }

  console.log('');
  console.log('🎉 Seed concluído com sucesso!');
  console.log('');
  console.log('📋 Dados criados:');
  console.log(`- 1 Tenant: ${tenant.name}`);
  console.log(`- ${5 + usuariosAdicionais.length} Usuários`);
  console.log(`- ${clientes.length} Clientes`);
  console.log(`- ${fornecedores.length} Fornecedores`);
  console.log(`- ${projetos.length} Projetos`);
  console.log(`- ${tarefas.length} Tarefas`);
  console.log(`- ${expenses.length} Despesas`);
  console.log(`- ${invoices.length} Invoices`);
  console.log(`- ${payments.length} Payments`);
  console.log(`- ${financialTransactions.length} Transações Financeiras`);
  console.log(`- ${reports.length} Relatórios`);
  console.log(`- ${templates.length} Templates`);
  console.log(`- ${notifications.length} Notificações`);
  console.log('');
  console.log('🔑 Credenciais de acesso (todos com senha 123456):');
  console.log('- Admin: admin@gestorpro.com');
  console.log('- Diretor: diretor@gestorpro.com');
  console.log('- Coordenador: coordenador@gestorpro.com');
  console.log('- Gestor: gestor@gestorpro.com');
  console.log('- Funcionário: funcionario@gestorpro.com');
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
