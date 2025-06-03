import { DashboardData, Farm, Producer } from '../types';

// Backend API types (matching the backend interface)
interface IProducerBackend {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

interface IProducer {
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
  createdAt: string;
  updatedAt: string;
  id: string;
}

interface IProducerInfo {
  id: string;
  cpfCnpj: string;
  name: string;
}

interface IFarm {
  _id?: string;
  producerId: string | IProducerInfo;  // Backend returns either a string or producer object
  name: string;
  city: string;
  state: string;
  totalArea: number;
  agriculturalArea: number;
  vegetationArea: number;
  crops: ICrop[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface ICrop {
  _id?: string;
  name: string;
  harvest: string;
  plantedArea?: number;
  createdAt?: Date;
}

interface IDashboardData {
  totalFarms: number;
  totalHectares: number;
  farmsByState: { [state: string]: number };
  farmsByCrop: { [crop: string]: number };
  landUse: {
    agricultural: number;
    vegetation: number;
  };
}

// API Response interface matching backend
interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API Configuration
const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001').replace(/\/$/, '') + '/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Type conversion functions
function convertBackendProducerToFrontend(backendProducer: IProducer): Producer {
  return {
    id: backendProducer.id,
    cpfCnpj: backendProducer.cpfCnpj,
    name: backendProducer.name,
    email: backendProducer.email,
    phone: backendProducer.phone,
    address: backendProducer.address,
    farms: [], // Will be populated separately
    createdAt: backendProducer.createdAt,
    updatedAt: backendProducer.updatedAt,
  };
}

function convertFrontendProducerToBackend(frontendProducer: Omit<Producer, 'id' | 'farms' | 'createdAt' | 'updatedAt'>): Partial<IProducer> {
  return {
    cpfCnpj: frontendProducer.cpfCnpj,
    name: frontendProducer.name,
    email: frontendProducer.email,
    phone: frontendProducer.phone,
    address: frontendProducer.address
  };
}

function convertBackendFarmToFrontend(backendFarm: IFarm): Farm {
  // Extract the producer ID from either a string or an object
  const producerId = typeof backendFarm.producerId === 'string'
    ? backendFarm.producerId
    : backendFarm.producerId.id;

  // Handle dates that might already be strings
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return new Date().toISOString();
    if (typeof date === 'string') return date;
    return date.toISOString();
  };

  return {
    id: backendFarm._id || backendFarm._id || '',
    producerId: producerId,
    name: backendFarm.name,
    city: backendFarm.city,
    state: backendFarm.state,
    totalArea: backendFarm.totalArea,
    agriculturalArea: backendFarm.agriculturalArea,
    vegetationArea: backendFarm.vegetationArea,
    crops: (backendFarm.crops || []).map(crop => ({
      id: crop._id || crop._id || '',
      name: crop.name,
      harvest: crop.harvest,
      farmId: backendFarm._id || backendFarm._id || '',
      createdAt: formatDate(crop.createdAt)
    })),
    createdAt: formatDate(backendFarm.createdAt),
    updatedAt: formatDate(backendFarm.updatedAt),
  };
}

function convertFrontendFarmToBackend(frontendFarm: Omit<Farm, 'id' | 'crops' | 'createdAt' | 'updatedAt'>): Omit<IFarm, '_id' | 'crops' | 'createdAt' | 'updatedAt'> {
  return {
    producerId: frontendFarm.producerId,
    name: frontendFarm.name,
    city: frontendFarm.city,
    state: frontendFarm.state,
    totalArea: frontendFarm.totalArea,
    agriculturalArea: frontendFarm.agriculturalArea,
    vegetationArea: frontendFarm.vegetationArea,
  };
}

// Dashboard API methods
interface DashboardResponse {
  totalFarms: number;
  totalProducers: number;
  totalArea: number;
  totalAgriculturalArea: number;
  totalVegetationArea: number;
  averageFarmSize: number;
  farmsByState: Array<{
    state: string;
    count: number;
    totalArea: number;
  }>;
  cropStatistics: Array<{
    count: number;
    totalArea: number;
    crop: {
      name: string;
      harvest: string;
      plantedArea: number;
      _id: string;
      createdAt: string;
    };
    percentage: number;
  }>;
  landUseDistribution: {
    agricultural: {
      area: number;
      percentage: number;
    };
    vegetation: {
      area: number;
      percentage: number;
    };
    unused: {
      area: number;
      percentage: number;
    };
  };
  topStates: Array<{
    state: string;
    farmCount: number;
    totalArea: number;
    averageSize: number;
  }>;
  recentActivity: {
    newProducersLastMonth: number;
    newFarmsLastMonth: number;
    totalGrowthPercentage: number;
  };
}

function convertBackendDashboardToFrontend(backendDashboard: DashboardResponse): DashboardData {
  return {
    ...backendDashboard
  };
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || data.message || 'Request failed',
        response.status,
        data
      );
    }

    // Handle health check endpoint which returns direct response
    if (endpoint === '/health') {
      if (data.status === 'ok' || data.status === 'OK') {
        return data as T;
      }
      throw new ApiError(
        data.error?.message || 'Health check failed',
        response.status,
        data
      );
    }

    // Handle standard API responses
    if ('success' in data) {
      if (!data.success) {
        throw new ApiError(data.error || data.message || 'API request failed');
      }
      return data.data as T;
    }

    // If neither health check nor standard format, return raw data
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred'
    );
  }
}

// Producer API functions
export const producerApi = {
  // Get all producers
  getAll: async (): Promise<Producer[]> => {
    const response = await apiRequest<PaginatedResponse<IProducer>>('/producers');
    return response.data.map(convertBackendProducerToFrontend);
  },

  // Get producer by ID
  getById: async (id: string): Promise<Producer> => {
    const backendProducer = await apiRequest<IProducer>(`/producers/${id}`);
    return convertBackendProducerToFrontend(backendProducer);
  },

  // Create new producer
  create: async (producer: Omit<Producer, 'id' | 'farms' | 'createdAt' | 'updatedAt'>): Promise<Producer> => {
    const backendProducerData = convertFrontendProducerToBackend(producer);
    const backendProducer = await apiRequest<IProducer>('/producers', {
      method: 'POST',
      body: JSON.stringify(backendProducerData),
    });
    return convertBackendProducerToFrontend(backendProducer);
  },

  // Update producer
  update: async (id: string, producer: Partial<Producer>): Promise<Producer> => {
    const backendProducer = await apiRequest<IProducer>(`/producers/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        cpfCnpj: producer.cpfCnpj,
        name: producer.name,
      }),
    });
    return convertBackendProducerToFrontend(backendProducer);
  },

  // Delete producer
  delete: (id: string): Promise<void> =>
    apiRequest<void>(`/producers/${id}`, {
      method: 'DELETE',
    }),
};

// Farm API functions
// Interface for paginated response
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const farmApi = {
  // Get all farms
  getAll: async (): Promise<Farm[]> => {
    const response = await apiRequest<PaginatedResponse<IFarm>>('/farms');
    return response.data.map(convertBackendFarmToFrontend);
  },

  // Get farm by ID
  getById: async (id: string): Promise<Farm> => {
    const backendFarm = await apiRequest<IFarm>(`/farms/${id}`);
    return convertBackendFarmToFrontend(backendFarm);
  },
  // Get farms by producer ID
  getByProducerId: async (producerId: string): Promise<Farm[]> => {
    const response = await apiRequest<PaginatedResponse<IFarm>>(`/farms/producer/${producerId}`);
    return response.data.map(convertBackendFarmToFrontend);
  },

  // Create new farm
  create: async (farm: Omit<Farm, 'id' | 'crops' | 'createdAt' | 'updatedAt'>): Promise<Farm> => {
    const backendFarmData = convertFrontendFarmToBackend(farm);
    const backendFarm = await apiRequest<IFarm>('/farms', {
      method: 'POST',
      body: JSON.stringify(backendFarmData),
    });
    return convertBackendFarmToFrontend(backendFarm);
  },

  // Update farm
  update: async (id: string, farm: Partial<Farm>): Promise<Farm> => {
    const backendFarm = await apiRequest<IFarm>(`/farms/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: farm.name,
        city: farm.city,
        state: farm.state,
        totalArea: farm.totalArea,
        agriculturalArea: farm.agriculturalArea,
        vegetationArea: farm.vegetationArea,
      }),
    });
    return convertBackendFarmToFrontend(backendFarm);
  },

  // Delete farm
  delete: (id: string): Promise<void> =>
    apiRequest<void>(`/farms/${id}`, {
      method: 'DELETE',
    }),
};

// Dashboard API functions
export const dashboardApi = {
  // Get dashboard analytics
  getAnalytics: async (): Promise<DashboardData> => {
    const backendDashboard = await apiRequest<DashboardResponse>('/dashboard/stats');
    return convertBackendDashboardToFrontend(backendDashboard);
  },
};
//{"status":"ok","info":{"database":{"status":"up"},"memory_heap":{"status":"up"},"memory_rss":{"status":"up"},"storage":{"status":"up"}},"error":{},"details":{"database":{"status":"up"},"memory_heap":{"status":"up"},"memory_rss":{"status":"up"},"storage":{"status":"up"}}}
// Health check interface matching actual response
interface IHealthCheckResponse {
  status: string;
  info: {
    database: { status: string };
    memory_heap: { status: string };
    memory_rss: { status: string };
    storage: { status: string };
  };
  error: Record<string, unknown>;
  details: {
    database: { status: string };
    memory_heap: { status: string };
    memory_rss: { status: string };
    storage: { status: string };
  };
}

// Health check
export const healthApi = {
  check: async (): Promise<IHealthCheckResponse> => {
    try {
      const response = await apiRequest<IHealthCheckResponse>('/health');
      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },
};

export { ApiError };

