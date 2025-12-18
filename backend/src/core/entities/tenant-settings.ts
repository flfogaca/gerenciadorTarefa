import { BaseEntity } from '../base';
import { TenantIdVO } from './tenant';

export class TenantSettings extends BaseEntity {
  constructor(
    public readonly id: string,
    public readonly tenantId: TenantIdVO,
    public readonly settings: Record<string, any>,
    public readonly features: Record<string, any>,
    public readonly integrations: Record<string, any>,
    public readonly branding: Record<string, any>,
    public readonly limits: Record<string, any>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    super();
  }

  static create(
    tenantId: TenantIdVO,
    settings: Record<string, any> = {},
    features: Record<string, any> = {},
    integrations: Record<string, any> = {},
    branding: Record<string, any> = {},
    limits: Record<string, any> = {}
  ): TenantSettings {
    const now = new Date();
    const id = `tenant_settings_${tenantId.value}_${now.getTime()}`;

    return new TenantSettings(
      id,
      tenantId,
      settings,
      features,
      integrations,
      branding,
      limits,
      now,
      now
    );
  }

  updateSettings(settings: Record<string, any>): TenantSettings {
    return new TenantSettings(
      this.id,
      this.tenantId,
      { ...this.settings, ...settings },
      this.features,
      this.integrations,
      this.branding,
      this.limits,
      this.createdAt,
      new Date()
    );
  }

  updateFeatures(features: Record<string, any>): TenantSettings {
    return new TenantSettings(
      this.id,
      this.tenantId,
      this.settings,
      { ...this.features, ...features },
      this.integrations,
      this.branding,
      this.limits,
      this.createdAt,
      new Date()
    );
  }

  updateIntegrations(integrations: Record<string, any>): TenantSettings {
    return new TenantSettings(
      this.id,
      this.tenantId,
      this.settings,
      this.features,
      { ...this.integrations, ...integrations },
      this.branding,
      this.limits,
      this.createdAt,
      new Date()
    );
  }

  updateBranding(branding: Record<string, any>): TenantSettings {
    return new TenantSettings(
      this.id,
      this.tenantId,
      this.settings,
      this.features,
      this.integrations,
      { ...this.branding, ...branding },
      this.limits,
      this.createdAt,
      new Date()
    );
  }

  updateLimits(limits: Record<string, any>): TenantSettings {
    return new TenantSettings(
      this.id,
      this.tenantId,
      this.settings,
      this.features,
      this.integrations,
      this.branding,
      { ...this.limits, ...limits },
      this.createdAt,
      new Date()
    );
  }
}

