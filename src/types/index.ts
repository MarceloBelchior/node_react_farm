export interface Producer {
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
  farms: Farm[];
  createdAt: string;
  updatedAt: string;
}

export interface Farm {
  id: string;
  name: string;
  city: string;
  state: string;
  totalArea: number; // em hectares
  agriculturalArea: number; // em hectares
  vegetationArea: number; // em hectares
  crops: Crop[];
  producerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Crop {
  id: string;
  name: string;
  harvest: string;
  farmId: string;
  createdAt: string;
}

export interface DashboardData {
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

export interface FormErrors {
  [key: string]: string;
}

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;

export type BrazilianState = typeof BRAZILIAN_STATES[number];

export const CROP_TYPES = [
  'Soja', 'Milho', 'Algodão', 'Café', 'Cana de Açúcar'
] as const;

export type CropType = typeof CROP_TYPES[number];
