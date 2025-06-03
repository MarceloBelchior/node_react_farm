export interface IProducer {
  _id?: string;
  cpfCnpj: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFarm {
  _id?: string;
  producerId: string;
  name: string;
  city: string;
  state: string;
  totalArea: number; // hectares
  agriculturalArea: number; // hectares
  vegetationArea: number; // hectares
  crops: ICrop[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICrop {
  _id?: string;
  name: string;
  harvest: string; // e.g., "2024", "2025"
  plantedArea?: number; // hectares (optional)
  createdAt?: Date;
}

export interface IDashboardData {
  totalFarms: number;
  totalHectares: number;
  farmsByState: { [state: string]: number };
  farmsByCrop: { [crop: string]: number };
  landUse: {
    agricultural: number;
    vegetation: number;
  };
}

export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface IQueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  state?: string;
  crop?: string;
}

export interface IValidationError {
  field: string;
  message: string;
  value?: any;
}
