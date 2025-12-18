# 🏗️ GestorPro Backend - Clean Architecture & SOLID Principles

Backend profissional para GestorPro implementado seguindo os princípios **SOLID**, **Clean Architecture** e **Multi-tenant**.

## 🎯 Características Principais

### ✅ **Arquitetura Limpa (Clean Architecture)**
- **Separação de responsabilidades** em camadas bem definidas
- **Inversão de dependências** com interfaces
- **Testabilidade** alta com mocks e stubs
- **Independência de frameworks** e banco de dados

### ✅ **Princípios SOLID**
- **S** - Single Responsibility Principle
- **O** - Open/Closed Principle  
- **L** - Liskov Substitution Principle
- **I** - Interface Segregation Principle
- **D** - Dependency Inversion Principle

### ✅ **Multi-tenant Architecture**
- **Isolamento completo** de dados por tenant
- **Escalabilidade horizontal** com databases separados
- **Contexto de tenant** em todas as operações
- **Migração automática** de schemas

### ✅ **Sistema de Permissões Robusto**
- **Permissões granulares** por recurso e ação
- **Hierarquia de roles** bem definida
- **Auditoria completa** de ações
- **Middleware de autorização** automático

### ✅ **Zero Repetição de Código**
- **Padrões Repository** e **Service**
- **Use Cases** reutilizáveis
- **Value Objects** e **Entities** compartilhadas
- **Interfaces** bem definidas

## 🏗️ Estrutura do Projeto

```
backend/
├── src/
│   ├── core/                    # Camada de Domínio
│   │   ├── entities/           # Entidades de negócio
│   │   ├── value-objects/      # Objetos de valor
│   │   ├── interfaces/         # Contratos/Interfaces
│   │   ├── permissions/        # Sistema de permissões
│   │   └── multi-tenant/       # Contexto multi-tenant
│   ├── application/            # Camada de Aplicação
│   │   ├── use-cases/         # Casos de uso
│   │   ├── services/          # Serviços de aplicação
│   │   └── dto/               # Data Transfer Objects
│   ├── infrastructure/         # Camada de Infraestrutura
│   │   ├── database/          # Configuração do banco
│   │   ├── repositories/      # Implementações dos repositórios
│   │   ├── di/               # Injeção de dependências
│   │   └── external/         # Serviços externos
│   ├── presentation/          # Camada de Apresentação
│   │   ├── controllers/       # Controladores REST
│   │   ├── middleware/        # Middlewares
│   │   ├── routes/           # Definição de rotas
│   │   └── validators/       # Validadores
│   └── shared/               # Código Compartilhado
│       ├── utils/            # Utilitários
│       ├── logging/          # Sistema de logs
│       └── validation/      # Validações
├── prisma/                   # Schema do banco
├── tests/                    # Testes
└── docs/                     # Documentação
```

## 🚀 Instalação e Configuração

### 1. **Pré-requisitos**
```bash
Node.js >= 18.0.0
npm >= 9.0.0
PostgreSQL >= 13
Redis >= 6.0 (opcional)
```

### 2. **Instalação**
```bash
# Clonar repositório
git clone <repository-url>
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env com suas configurações
```

### 3. **Configuração do Banco**
```bash
# Executar migrações
npm run migrate

# Gerar cliente Prisma
npm run generate
```

### 4. **Executar Aplicação**
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Executa em modo watch
npm run build            # Compila TypeScript
npm run start            # Executa versão compilada

# Testes
npm run test             # Executa todos os testes
npm run test:watch        # Executa testes em modo watch
npm run test:coverage     # Executa testes com coverage

# Qualidade de Código
npm run lint             # Executa ESLint
npm run lint:fix          # Corrige problemas do ESLint
npm run type-check        # Verifica tipos TypeScript

# Banco de Dados
npm run migrate           # Executa migrações
npm run migrate:prod      # Executa migrações em produção
npm run generate          # Gera cliente Prisma
npm run studio            # Abre Prisma Studio
```

## 🏢 Multi-tenant

### **Estratégia de Isolamento**
- **Database per Tenant**: Cada cliente tem seu próprio banco
- **Schema per Tenant**: Um banco, múltiplos schemas
- **Row-level Security**: Isolamento por linha (PostgreSQL)

### **Contexto de Tenant**
```typescript
// Middleware automático extrai tenantId de:
// - Header: X-Tenant-ID
// - Subdomínio: tenant.domain.com
// - Query parameter: ?tenantId=tenant
// - Body: { tenantId: "tenant" }

const context: TenantContext = {
  tenantId: new TenantIdVO('tenant123'),
  userId: 'user456',
  userRole: 'manager',
  requestId: 'req_789',
  timestamp: new Date()
};
```

### **Uso em Controllers**
```typescript
@RequireTenant()
async getTasks(req: Request, res: Response, tenantContext: TenantContext) {
  // tenantContext.tenantId já disponível
  const tasks = await this.taskService.findByTenantId(tenantContext.tenantId);
  res.json(tasks);
}
```

## 🔐 Sistema de Permissões

### **Hierarquia de Roles**
```typescript
enum UserRole {
  SUPER_ADMIN = 'super_admin',    // Acesso total
  TENANT_ADMIN = 'tenant_admin',   // Admin do tenant
  MANAGER = 'manager',            // Gerente de projetos
  EMPLOYEE = 'employee',          // Funcionário padrão
  CLIENT = 'client'               // Cliente externo
}
```

### **Permissões Granulares**
```typescript
// Exemplo de permissões por role
const MANAGER_PERMISSIONS = [
  { resource: 'projects', action: 'create' },
  { resource: 'projects', action: 'read' },
  { resource: 'projects', action: 'update' },
  { resource: 'tasks', action: 'assign' },
  { resource: 'reports', action: 'create' }
];
```

### **Uso em Controllers**
```typescript
@RequirePermission('tasks', 'create')
async createTask(req: Request, res: Response) {
  // Usuário tem permissão para criar tasks
  const task = await this.createTaskUseCase.execute(req.body);
  res.json(task);
}
```

## 🎯 Casos de Uso (Use Cases)

### **Estrutura Padrão**
```typescript
interface IUseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

@injectable()
export class CreateTaskUseCase implements ICreateTaskUseCase {
  constructor(
    @inject(TYPES.TaskService) private readonly taskService: ITaskService,
    @inject(TYPES.PermissionService) private readonly permissionService: IPermissionService
  ) {}

  async execute(request: CreateTaskRequest): Promise<CreateTaskResponse> {
    // 1. Validação
    this.validateRequest(request);
    
    // 2. Verificação de permissões
    await this.permissionService.checkPermission(
      request.userId, 'tasks', 'create'
    );
    
    // 3. Lógica de negócio
    const task = await this.taskService.create(request);
    
    // 4. Auditoria
    await this.auditService.logAction(
      request.userId, 'create_task', 'task', { taskId: task.id }
    );
    
    return { task };
  }
}
```

## 🗄️ Repositórios

### **Padrão Repository**
```typescript
interface IRepository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: ID): Promise<void>;
  exists(id: ID): Promise<boolean>;
}

interface ITaskRepository extends IRepository<Task, string> {
  findByProjectId(projectId: ProjectId): Promise<Task[]>;
  findByAssigneeId(assigneeId: UserId): Promise<Task[]>;
  findByStatus(status: TaskStatus): Promise<Task[]>;
  findOverdueTasks(): Promise<Task[]>;
}
```

## 🔄 Injeção de Dependências

### **Container Configuration**
```typescript
export class DIContainer {
  private static configureContainer(): void {
    // Repositories
    container.bind<ITaskRepository>(TYPES.TaskRepository).to(PrismaTaskRepository);
    
    // Services
    container.bind<ITaskService>(TYPES.TaskService).to(TaskService);
    
    // Use Cases
    container.bind<ICreateTaskUseCase>(TYPES.CreateTaskUseCase).to(CreateTaskUseCase);
  }
}
```

## 📊 API Endpoints

### **Tenants**
```
POST   /api/v1/tenants              # Criar tenant
GET    /api/v1/tenants              # Listar tenants
GET    /api/v1/tenants/:id          # Obter tenant
PUT    /api/v1/tenants/:id          # Atualizar tenant
DELETE /api/v1/tenants/:id          # Deletar tenant
```

### **Users**
```
POST   /api/v1/users                # Criar usuário
GET    /api/v1/users                # Listar usuários
GET    /api/v1/users/:id            # Obter usuário
PUT    /api/v1/users/:id            # Atualizar usuário
DELETE /api/v1/users/:id            # Deletar usuário
POST   /api/v1/users/authenticate    # Autenticar
```

### **Projects**
```
POST   /api/v1/projects             # Criar projeto
GET    /api/v1/projects             # Listar projetos
GET    /api/v1/projects/:id         # Obter projeto
PUT    /api/v1/projects/:id         # Atualizar projeto
DELETE /api/v1/projects/:id         # Deletar projeto
```

### **Tasks**
```
POST   /api/v1/tasks                # Criar tarefa
GET    /api/v1/tasks                # Listar tarefas
GET    /api/v1/tasks/:id            # Obter tarefa
PUT    /api/v1/tasks/:id            # Atualizar tarefa
DELETE /api/v1/tasks/:id            # Deletar tarefa
POST   /api/v1/tasks/:id/time       # Logar tempo
```

## 🧪 Testes

### **Estrutura de Testes**
```bash
tests/
├── unit/                    # Testes unitários
│   ├── entities/           # Testes de entidades
│   ├── use-cases/          # Testes de casos de uso
│   └── services/           # Testes de serviços
├── integration/            # Testes de integração
│   ├── repositories/       # Testes de repositórios
│   └── controllers/        # Testes de controllers
└── e2e/                    # Testes end-to-end
```

### **Executar Testes**
```bash
# Todos os testes
npm run test

# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📈 Monitoramento e Logs

### **Sistema de Logs**
```typescript
// Logs estruturados com contexto
this.logger.info('Task created successfully', {
  taskId: task.id,
  userId: user.id,
  tenantId: tenant.id,
  requestId: req.headers['x-request-id']
});
```

### **Métricas**
- **Performance**: Tempo de resposta, throughput
- **Business**: Tasks criadas, projetos ativos
- **Technical**: Uso de memória, CPU, conexões DB

## 🔒 Segurança

### **Medidas Implementadas**
- **Helmet**: Headers de segurança
- **Rate Limiting**: Proteção contra spam
- **CORS**: Controle de origem
- **JWT**: Autenticação stateless
- **BCrypt**: Hash de senhas
- **Validation**: Validação de entrada
- **Audit Logs**: Rastreamento de ações

## 🚀 Deploy

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### **Variáveis de Ambiente**
```bash
# Produção
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db:5432/gestorpro
JWT_SECRET=super-secret-key
REDIS_URL=redis://redis:6379
```

## 📚 Documentação

- **API Docs**: `/api/docs` (Swagger)
- **Database Schema**: `prisma/schema.prisma`
- **Architecture**: `docs/architecture.md`
- **Deployment**: `docs/deployment.md`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ seguindo os princípios SOLID e Clean Architecture**
