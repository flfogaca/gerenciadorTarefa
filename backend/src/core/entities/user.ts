import { BaseEntity, TenantId, UserId, UserRole } from '../base';
import { EmailVO, PasswordVO } from './tenant';

export class User extends BaseEntity {
  constructor(
    public readonly id: string,
    public readonly userId: UserId,
    public readonly tenantId: TenantId,
    public readonly email: EmailVO,
    public readonly password: PasswordVO,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly role: UserRole,
    public readonly profile: UserProfile,
    public readonly permissions: UserPermission[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly isActive: boolean = true,
    public readonly lastLoginAt?: Date
  ) {
    super();
  }

  static create(
    userId: UserId,
    tenantId: TenantId,
    email: EmailVO,
    password: PasswordVO,
    firstName: string,
    lastName: string,
    role: UserRole,
    profile: UserProfile
  ): User {
    const now = new Date();
    const id = `user_${userId.value}_${now.getTime()}`;
    
    return new User(
      id,
      userId,
      tenantId,
      email,
      password,
      firstName,
      lastName,
      role,
      profile,
      [],
      now,
      now
    );
  }

  updateProfile(newProfile: Partial<UserProfile>): User {
    return new User(
      this.id,
      this.userId,
      this.tenantId,
      this.email,
      this.password,
      this.firstName,
      this.lastName,
      this.role,
      { ...this.profile, ...newProfile },
      this.permissions,
      this.createdAt,
      new Date(),
      this.isActive,
      this.lastLoginAt
    );
  }

  changePassword(newPassword: PasswordVO): User {
    return new User(
      this.id,
      this.userId,
      this.tenantId,
      this.email,
      newPassword,
      this.firstName,
      this.lastName,
      this.role,
      this.profile,
      this.permissions,
      this.createdAt,
      new Date(),
      this.isActive,
      this.lastLoginAt
    );
  }

  updateRole(newRole: UserRole): User {
    return new User(
      this.id,
      this.userId,
      this.tenantId,
      this.email,
      this.password,
      this.firstName,
      this.lastName,
      newRole,
      this.profile,
      this.permissions,
      this.createdAt,
      new Date(),
      this.isActive,
      this.lastLoginAt
    );
  }

  addPermission(permission: UserPermission): User {
    const existingPermission = this.permissions.find(p => 
      p.resource === permission.resource && p.action === permission.action
    );
    
    if (existingPermission) {
      return this;
    }

    return new User(
      this.id,
      this.userId,
      this.tenantId,
      this.email,
      this.password,
      this.firstName,
      this.lastName,
      this.role,
      this.profile,
      [...this.permissions, permission],
      this.createdAt,
      new Date(),
      this.isActive,
      this.lastLoginAt
    );
  }

  removePermission(resource: string, action: string): User {
    const filteredPermissions = this.permissions.filter(p => 
      !(p.resource === resource && p.action === action)
    );

    return new User(
      this.id,
      this.userId,
      this.tenantId,
      this.email,
      this.password,
      this.firstName,
      this.lastName,
      this.role,
      this.profile,
      filteredPermissions,
      this.createdAt,
      new Date(),
      this.isActive,
      this.lastLoginAt
    );
  }

  recordLogin(): User {
    return new User(
      this.id,
      this.userId,
      this.tenantId,
      this.email,
      this.password,
      this.firstName,
      this.lastName,
      this.role,
      this.profile,
      this.permissions,
      this.createdAt,
      new Date(),
      this.isActive,
      new Date()
    );
  }

  deactivate(): User {
    return new User(
      this.id,
      this.userId,
      this.tenantId,
      this.email,
      this.password,
      this.firstName,
      this.lastName,
      this.role,
      this.profile,
      this.permissions,
      this.createdAt,
      new Date(),
      false,
      this.lastLoginAt
    );
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  hasPermission(resource: string, action: string): boolean {
    if (this.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    return this.permissions.some(p => 
      p.resource === resource && p.action === action
    );
  }

  canAccessTenant(tenantId: TenantId): boolean {
    if (this.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    return this.tenantId.equals(tenantId);
  }
}

export interface UserProfile {
  readonly avatar?: string;
  readonly phone?: string;
  readonly department?: string;
  readonly position?: string;
  readonly bio?: string;
  readonly preferences: UserPreferences;
  readonly customFields: Record<string, any>;
  readonly twoFactorSecret?: string;
  readonly twoFactorEnabled?: boolean;
  readonly twoFactorBackupCodes?: string[];
  readonly twoFactorPending?: boolean;
  readonly passwordResetToken?: string;
  readonly passwordResetExpires?: Date;
}

export interface UserPreferences {
  readonly theme: 'light' | 'dark';
  readonly language: string;
  readonly timezone: string;
  readonly notifications: NotificationSettings;
}

export interface NotificationSettings {
  readonly email: boolean;
  readonly push: boolean;
  readonly sms: boolean;
  readonly types: string[];
}

export interface UserPermission {
  readonly resource: string;
  readonly action: string;
  readonly conditions?: Record<string, any>;
  readonly grantedAt: Date;
  readonly grantedBy: UserId;
  readonly expiresAt?: Date;
}
