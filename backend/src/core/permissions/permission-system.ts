import { UserRole, Permission } from '../base';
import { UserIdVO } from '../entities/tenant';
import { ITenantContextService } from '../multi-tenant/tenant-context';

// Sistema de Permissões Granular
export class PermissionSystem {
  private static readonly ROLE_PERMISSIONS: Map<UserRole, Permission[]> = new Map([
    [UserRole.SUPER_ADMIN, [
      { resource: '*', action: '*' }, // Acesso total
    ]],
    [UserRole.TENANT_ADMIN, [
      { resource: 'tenant', action: 'read' },
      { resource: 'tenant', action: 'update' },
      { resource: 'tenant', action: 'manage_settings' },
      { resource: 'users', action: 'create' },
      { resource: 'users', action: 'read' },
      { resource: 'users', action: 'update' },
      { resource: 'users', action: 'delete' },
      { resource: 'users', action: 'manage_permissions' },
      { resource: 'projects', action: 'create' },
      { resource: 'projects', action: 'read' },
      { resource: 'projects', action: 'update' },
      { resource: 'projects', action: 'delete' },
      { resource: 'projects', action: 'manage_team' },
      { resource: 'tasks', action: 'create' },
      { resource: 'tasks', action: 'read' },
      { resource: 'tasks', action: 'update' },
      { resource: 'tasks', action: 'delete' },
      { resource: 'tasks', action: 'assign' },
      { resource: 'reports', action: 'read' },
      { resource: 'reports', action: 'create' },
      { resource: 'finance', action: 'read' },
      { resource: 'finance', action: 'update' },
      { resource: 'administrative', action: 'read' },
      { resource: 'administrative', action: 'update' },
      { resource: 'clients', action: 'create' },
      { resource: 'clients', action: 'read' },
      { resource: 'clients', action: 'update' },
      { resource: 'clients', action: 'delete' },
      { resource: 'suppliers', action: 'create' },
      { resource: 'suppliers', action: 'read' },
      { resource: 'suppliers', action: 'update' },
      { resource: 'suppliers', action: 'delete' },
      { resource: 'notifications', action: 'read' },
      { resource: 'notifications', action: 'update' },
    ]],
    [UserRole.MANAGER, [
      { resource: 'projects', action: 'create' },
      { resource: 'projects', action: 'read' },
      { resource: 'projects', action: 'update' },
      { resource: 'projects', action: 'manage_team' },
      { resource: 'tasks', action: 'create' },
      { resource: 'tasks', action: 'read' },
      { resource: 'tasks', action: 'update' },
      { resource: 'tasks', action: 'assign' },
      { resource: 'tasks', action: 'delete' },
      { resource: 'reports', action: 'read' },
      { resource: 'reports', action: 'create' },
      { resource: 'finance', action: 'read' },
      { resource: 'users', action: 'read' },
      { resource: 'clients', action: 'create' },
      { resource: 'clients', action: 'read' },
      { resource: 'clients', action: 'update' },
      { resource: 'suppliers', action: 'create' },
      { resource: 'suppliers', action: 'read' },
      { resource: 'suppliers', action: 'update' },
      { resource: 'notifications', action: 'read' },
      { resource: 'notifications', action: 'update' },
    ]],
    [UserRole.EMPLOYEE, [
      { resource: 'tasks', action: 'read' },
      { resource: 'tasks', action: 'update' },
      { resource: 'tasks', action: 'log_time' },
      { resource: 'projects', action: 'read' },
      { resource: 'reports', action: 'read' },
      { resource: 'profile', action: 'read' },
      { resource: 'profile', action: 'update' },
      { resource: 'clients', action: 'read' },
      { resource: 'suppliers', action: 'read' },
      { resource: 'notifications', action: 'read' },
      { resource: 'notifications', action: 'update' },
    ]],
    [UserRole.CLIENT, [
      { resource: 'projects', action: 'read' },
      { resource: 'tasks', action: 'read' },
      { resource: 'reports', action: 'read' },
      { resource: 'profile', action: 'read' },
      { resource: 'profile', action: 'update' },
      { resource: 'clients', action: 'read' },
      { resource: 'suppliers', action: 'read' },
      { resource: 'notifications', action: 'read' },
      { resource: 'notifications', action: 'update' },
    ]],
  ]);

  static getRolePermissions(role: UserRole): Permission[] {
    return this.ROLE_PERMISSIONS.get(role) || [];
  }

  static hasPermission(userRole: UserRole, resource: string, action: string): boolean {
    const rolePermissions = this.getRolePermissions(userRole);
    
    // Super admin tem acesso total
    if (rolePermissions.some(p => p.resource === '*' && p.action === '*')) {
      return true;
    }

    // Verificar permissão específica
    return rolePermissions.some(p => 
      p.resource === resource && p.action === action
    );
  }

  static canAccessResource(userRole: UserRole, resource: string): boolean {
    const rolePermissions = this.getRolePermissions(userRole);
    
    if (rolePermissions.some(p => p.resource === '*' && p.action === '*')) {
      return true;
    }

    return rolePermissions.some(p => p.resource === resource);
  }

  static getAllowedActions(userRole: UserRole, resource: string): string[] {
    const rolePermissions = this.getRolePermissions(userRole);
    
    if (rolePermissions.some(p => p.resource === '*' && p.action === '*')) {
      return ['*'];
    }

    return rolePermissions
      .filter(p => p.resource === resource)
      .map(p => p.action);
  }
}

// Middleware de Autorização
export class AuthorizationMiddleware {
  static create(resource: string, action: string) {
    return (req: any, res: any, next: any) => {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const hasPermission = PermissionSystem.hasPermission(
        user.role,
        resource,
        action
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: `You don't have permission to ${action} ${resource}`
        });
      }

      next();
    };
  }
}

// Decorator para Controllers
export function RequirePermission(resource: string, action: string) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req = args[0];
      const res = args[1];
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const hasPermission = PermissionSystem.hasPermission(
        user.role,
        resource,
        action
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: `You don't have permission to ${action} ${resource}`
        });
      }

      // Preservar todos os argumentos (incluindo tenantContext se foi adicionado por outros decorators)
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// Service de Permissões
export interface IPermissionService {
  checkPermission(userId: string, resource: string, action: string): Promise<boolean>;
  getUserPermissions(userId: string): Promise<Permission[]>;
  grantPermission(userId: string, resource: string, action: string): Promise<void>;
  revokePermission(userId: string, resource: string, action: string): Promise<void>;
  getRolePermissions(role: UserRole): Promise<Permission[]>;
  hasResourceAccess(userId: string, resource: string): Promise<boolean>;
  getAllowedActions(userId: string, resource: string): Promise<string[]>;
}

// Implementação do Service de Permissões
export class PermissionService implements IPermissionService {
  constructor(
    private readonly userRepository: any, // IUserRepository
    private readonly auditService: any,   // IAuditService
    private readonly tenantContextService?: ITenantContextService
  ) {}

  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const user = await this.userRepository.findByUserId(new UserIdVO(userId));
    
    if (!user) {
      return false;
    }

    // Verificar permissões do role
    const hasRolePermission = PermissionSystem.hasPermission(user.role, resource, action);
    
    if (hasRolePermission) {
      return true;
    }

    // Verificar permissões específicas do usuário
    return user.hasPermission(resource, action);
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await this.userRepository.findByUserId(new UserIdVO(userId));
    
    if (!user) {
      return [];
    }

    const rolePermissions = PermissionSystem.getRolePermissions(user.role);
    const userPermissions = user.permissions.map((p: any) => ({
      resource: p.resource,
      action: p.action,
      conditions: p.conditions
    }));

    return [...rolePermissions, ...userPermissions];
  }

  async grantPermission(userId: string, resource: string, action: string): Promise<void> {
    const user = await this.userRepository.findByUserId(new UserIdVO(userId));
    
    if (!user) {
      throw new Error('User not found');
    }

    const actorUserId = this.tenantContextService?.getUserId() || userId;

    const permission = {
      resource,
      action,
      grantedAt: new Date(),
      grantedBy: new UserIdVO(actorUserId),
      expiresAt: undefined
    };

    const updatedUser = user.addPermission(permission);
    await this.userRepository.update(updatedUser);

    // Log da ação
    await this.auditService.logAction(
      actorUserId,
      'grant_permission',
      'permission',
      { userId, resource, action, grantedBy: actorUserId }
    );
  }

  async revokePermission(userId: string, resource: string, action: string): Promise<void> {
    const user = await this.userRepository.findByUserId(new UserIdVO(userId));
    
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = user.removePermission(resource, action);
    const actorUserId = this.tenantContextService?.getUserId() || userId;
    await this.userRepository.update(updatedUser);

    // Log da ação
    await this.auditService.logAction(
      actorUserId,
      'revoke_permission',
      'permission',
      { userId, resource, action, revokedBy: actorUserId }
    );
  }

  async getRolePermissions(role: UserRole): Promise<Permission[]> {
    return PermissionSystem.getRolePermissions(role);
  }

  async hasResourceAccess(userId: string, resource: string): Promise<boolean> {
    const user = await this.userRepository.findByUserId(new UserIdVO(userId));
    
    if (!user) {
      return false;
    }

    return PermissionSystem.canAccessResource(user.role, resource);
  }

  async getAllowedActions(userId: string, resource: string): Promise<string[]> {
    const user = await this.userRepository.findByUserId(new UserIdVO(userId));
    
    if (!user) {
      return [];
    }

    return PermissionSystem.getAllowedActions(user.role, resource);
  }
}
