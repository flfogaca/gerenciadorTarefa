import { BaseEntity, TenantId, ValueObject } from '../base';

export class TenantIdVO extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }

  protected validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error('TenantId cannot be empty');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(this.value)) {
      throw new Error('TenantId can only contain letters, numbers, underscores and hyphens');
    }
  }
}

export class UserIdVO extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }

  protected validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error('UserId cannot be empty');
    }
  }
}

export class EmailVO extends ValueObject<string> {
  constructor(value: string) {
    super(value.toLowerCase().trim());
  }

  protected validate(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.value)) {
      throw new Error('Invalid email format');
    }
  }
}

export class PasswordVO extends ValueObject<string> {
  private _isHashed: boolean = false;

  constructor(value: string, skipValidation: boolean = false) {
    if (skipValidation) {
      const pw = Object.create(PasswordVO.prototype);
      (pw as any)._value = value;
      (pw as any)._isHashed = true;
      return pw;
    }
    super(value);
  }

  protected validate(): void {
    if (this._isHashed) return;
    if (this.value.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.value)) {
      throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }
  }

  static fromPlainText(plainText: string): PasswordVO {
    return new PasswordVO(plainText);
  }

  static fromHashed(hash: string): PasswordVO {
    return new PasswordVO(hash, true);
  }
}

export class Tenant extends BaseEntity {
  constructor(
    public readonly id: string,
    public readonly tenantId: TenantId,
    public readonly name: string,
    public readonly domain: string,
    public readonly settings: TenantSettings,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly isActive: boolean = true
  ) {
    super();
  }

  static create(
    tenantId: TenantId,
    name: string,
    domain: string,
    settings: TenantSettings
  ): Tenant {
    const now = new Date();
    const id = `tenant_${tenantId.value}_${now.getTime()}`;
    
    return new Tenant(
      id,
      tenantId,
      name,
      domain,
      settings,
      now,
      now
    );
  }

  updateSettings(newSettings: Partial<TenantSettings>): Tenant {
    return new Tenant(
      this.id,
      this.tenantId,
      this.name,
      this.domain,
      { ...this.settings, ...newSettings },
      this.createdAt,
      new Date(),
      this.isActive
    );
  }

  deactivate(): Tenant {
    return new Tenant(
      this.id,
      this.tenantId,
      this.name,
      this.domain,
      this.settings,
      this.createdAt,
      new Date(),
      false
    );
  }
}

export interface TenantSettings {
  readonly timezone: string;
  readonly language: string;
  readonly currency: string;
  readonly dateFormat: string;
  readonly maxUsers: number;
  readonly features: string[];
  readonly customFields: Record<string, any>;
}
