import { TenantIdVO } from './tenant';

export interface ClientProps {
  id?: string;
  tenantId: TenantIdVO;
  name: string;
  cnpj?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  } | null;
  settings?: any;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Client {
  public readonly id: string;
  public readonly tenantId: TenantIdVO;
  public readonly name: string;
  public readonly cnpj?: string | null;
  public readonly email?: string | null;
  public readonly phone?: string | null;
  public readonly address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  } | null;
  public readonly settings: any;
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: ClientProps) {
    this.id = props.id || this.generateId();
    this.tenantId = props.tenantId;
    this.name = props.name;
    this.cnpj = props.cnpj ?? null;
    this.email = props.email ?? null;
    this.phone = props.phone ?? null;
    this.address = props.address ?? null;
    this.settings = props.settings || {};
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  private generateId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public updateName(name: string): Client {
    return new Client({
      ...this,
      name,
      updatedAt: new Date()
    });
  }

  public updateContactInfo(email?: string, phone?: string): Client {
    return new Client({
      ...this,
      email,
      phone,
      updatedAt: new Date()
    });
  }

  public updateAddress(address: ClientProps['address']): Client {
    return new Client({
      ...this,
      address,
      updatedAt: new Date()
    });
  }

  public updateSettings(settings: any): Client {
    return new Client({
      ...this,
      settings,
      updatedAt: new Date()
    });
  }

  public activate(): Client {
    return new Client({
      ...this,
      isActive: true,
      updatedAt: new Date()
    });
  }

  public deactivate(): Client {
    return new Client({
      ...this,
      isActive: false,
      updatedAt: new Date()
    });
  }

  public isValid(): boolean {
    return !!(
      this.name &&
      this.name.length >= 2 &&
      this.tenantId &&
      this.tenantId.value
    );
  }

  public getFullAddress(): string {
    if (!this.address) return '';
    
    const parts = [
      this.address.street,
      this.address.number,
      this.address.complement,
      this.address.neighborhood,
      this.address.city,
      this.address.state,
      this.address.zipCode
    ].filter(Boolean);

    return parts.join(', ');
  }

  public getDisplayName(): string {
    return this.name;
  }

  public toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId.value,
      name: this.name,
      cnpj: this.cnpj,
      email: this.email,
      phone: this.phone,
      address: this.address,
      settings: this.settings,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
