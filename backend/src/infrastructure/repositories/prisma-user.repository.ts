import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { IUserRepository } from '@/core/interfaces/repositories';
import { User, UserProfile, UserPermission } from '@/core/entities/user';
import { UserRole } from '@/core/base';
import { EmailVO, PasswordVO } from '@/core/entities/tenant';
import { TenantIdVO, UserIdVO } from '@/core/entities/tenant';

@injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(
    @inject(TYPES.PrismaClient) private readonly prisma: PrismaClient
  ) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) return null;

    return this.mapToDomain(user);
  }

  async findByUserId(userId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { userId: userId }
    });

    if (!user) return null;

    return this.mapToDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase() }
    });

    if (!user) return null;

    return this.mapToDomain(user);
  }

  async findByTenantId(tenantId: TenantIdVO): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { tenantId: tenantId.value },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => this.mapToDomain(user));
  }

  async findByRole(role: UserRole): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { role: role as any },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => this.mapToDomain(user));
  }

  async findActiveUsers(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => this.mapToDomain(user));
  }

  async findByEmailAndTenant(email: string, tenantId: TenantIdVO): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        tenantId: tenantId.value
      }
    });

    if (!user) return null;

    return this.mapToDomain(user);
  }

  async findUsersWithPermission(resource: string, action: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          {
            permissions: {
              path: ['profile'],
              array_contains: [{ resource, action }]
            }
          },
          {
            role: 'super_admin'
          }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => this.mapToDomain(user));
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => this.mapToDomain(user));
  }

  async save(entity: User): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        id: entity.id,
        userId: entity.userId.value,
        tenantId: entity.tenantId.value,
        email: entity.email.value,
        password: entity.password.value,
        firstName: entity.firstName,
        lastName: entity.lastName,
        role: entity.role as any,
        profile: entity.profile as any,
        permissions: entity.permissions as any,
        isActive: entity.isActive,
        lastLoginAt: entity.lastLoginAt || null,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt
      }
    });

    return this.mapToDomain(user);
  }

  async update(entity: User): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: entity.id },
      data: {
        email: entity.email.value,
        password: entity.password.value,
        firstName: entity.firstName,
        lastName: entity.lastName,
        role: entity.role as any,
        profile: entity.profile as any,
        permissions: entity.permissions as any,
        isActive: entity.isActive,
        lastLoginAt: entity.lastLoginAt || null,
        updatedAt: entity.updatedAt
      }
    });

    return this.mapToDomain(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id }
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id }
    });

    return count > 0;
  }

  private mapToDomain(user: any): User {
    if (!user) {
      throw new Error('User data is null or undefined');
    }

    if (!user.userId) {
      throw new Error(`User userId is missing for user ${user.id}`);
    }

    if (!user.tenantId) {
      throw new Error(`User tenantId is missing for user ${user.id}`);
    }

    if (!user.email) {
      throw new Error(`User email is missing for user ${user.id}`);
    }

    return new User(
      user.id,
      new UserIdVO(user.userId),
      new TenantIdVO(user.tenantId),
      new EmailVO(user.email),
      PasswordVO.fromHashed(user.password || ''),
      user.firstName || '',
      user.lastName || '',
      user.role as UserRole,
      user.profile as UserProfile || {},
      user.permissions as UserPermission[] || [],
      user.createdAt ? new Date(user.createdAt) : new Date(),
      user.updatedAt ? new Date(user.updatedAt) : new Date(),
      user.isActive !== undefined ? user.isActive : true,
      user.lastLoginAt ? new Date(user.lastLoginAt) : undefined
    );
  }
}
