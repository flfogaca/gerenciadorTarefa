import { TenantIdVO } from './tenant';

export interface SupplierProps {
  id?: string;
  tenantId: TenantIdVO;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  services?: string[];
  settings?: any;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Supplier {
  public readonly id: string;
  public readonly tenantId: TenantIdVO;
  public readonly name: string;
  public readonly cnpj?: string;
  public readonly email?: string;
  public readonly phone?: string;
  public readonly address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  public readonly services: string[];
  public readonly settings: any;
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: SupplierProps) {
    this.id = props.id || this.generateId();
    this.tenantId = props.tenantId;
    this.name = props.name;
    this.cnpj = props.cnpj;
    this.email = props.email;
    this.phone = props.phone;
    this.address = props.address;
    this.services = props.services || [];
    this.settings = props.settings || {};
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  private generateId(): string {
    return `supplier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public updateName(name: string): Supplier {
    return new Supplier({
      ...this,
      name,
      updatedAt: new Date()
    });
  }

  public updateContactInfo(email?: string, phone?: string): Supplier {
    return new Supplier({
      ...this,
      email,
      phone,
      updatedAt: new Date()
    });
  }

  public updateAddress(address: SupplierProps['address']): Supplier {
    return new Supplier({
      ...this,
      address,
      updatedAt: new Date()
    });
  }

  public updateServices(services: string[]): Supplier {
    return new Supplier({
      ...this,
      services,
      updatedAt: new Date()
    });
  }

  public addService(service: string): Supplier {
    if (this.services.includes(service)) {
      return this;
    }
    return new Supplier({
      ...this,
      services: [...this.services, service],
      updatedAt: new Date()
    });
  }

  public removeService(service: string): Supplier {
    return new Supplier({
      ...this,
      services: this.services.filter(s => s !== service),
      updatedAt: new Date()
    });
  }

  public updateSettings(settings: any): Supplier {
    return new Supplier({
      ...this,
      settings,
      updatedAt: new Date()
    });
  }

  public activate(): Supplier {
    return new Supplier({
      ...this,
      isActive: true,
      updatedAt: new Date()
    });
  }

  public deactivate(): Supplier {
    return new Supplier({
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

  public getServicesList(): string {
    return this.services.join(', ');
  }

  public hasService(service: string): boolean {
    return this.services.includes(service);
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
      services: this.services,
      settings: this.settings,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
