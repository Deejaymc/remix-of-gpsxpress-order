export interface Client {
  id: string;
  name: string;
  cpfCnpj: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  model: string;
  price: number;
  stock: number;
  createdAt: string;
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  email: string;
  specialty: string;
  active: boolean;
  createdAt: string;
}

export interface ServiceOrder {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  technicianId: string;
  technicianName: string;
  productId: string;
  productName: string;
  description: string;
  diagnosis: string;
  solution: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  value: number;
  createdAt: string;
  completedAt?: string;
}

export interface CompanyInfo {
  name: string;
  cnpj: string;
  ie: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
}
