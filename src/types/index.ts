export interface Producer {
  id: string;
  cpfCnpj: string;
  name: string;
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
  totalHectares: number;
  farmsByState: { [state: string]: number };
  farmsByCrop: { [crop: string]: number };
  landUse: {
    agricultural: number;
    vegetation: number;
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
