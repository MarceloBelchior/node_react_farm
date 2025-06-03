import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { Producer, Farm, Crop, DashboardData } from '../../types';
import { generateId } from '../../utils/validation';

interface ProducersState {
  producers: Producer[];
  loading: boolean;
  error: string | null;
}

const initialState: ProducersState = {
  producers: [],
  loading: false,
  error: null,
};

// Mock data for development
const mockProducers: Producer[] = [
  {
    id: '1',
    cpfCnpj: '123.456.789-00',
    name: 'João Silva',
    farms: [
      {
        id: '1',
        name: 'Fazenda Esperança',
        city: 'Ribeirão Preto',
        state: 'SP',
        totalArea: 1000,
        agriculturalArea: 600,
        vegetationArea: 400,
        producerId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        crops: [
          {
            id: '1',
            name: 'Soja',
            harvest: '2024',
            farmId: '1',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Milho',
            harvest: '2024',
            farmId: '1',
            createdAt: new Date().toISOString(),
          },
        ],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    cpfCnpj: '12.345.678/0001-90',
    name: 'Agropecuária Brasil Ltda',
    farms: [
      {
        id: '2',
        name: 'Fazenda Progresso',
        city: 'Campo Grande',
        state: 'MS',
        totalArea: 2000,
        agriculturalArea: 1200,
        vegetationArea: 800,
        producerId: '2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        crops: [
          {
            id: '3',
            name: 'Café',
            harvest: '2024',
            farmId: '2',
            createdAt: new Date().toISOString(),
          },
        ],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const producersSlice = createSlice({
  name: 'producers',
  initialState: {
    ...initialState,
    producers: mockProducers,
  },
  reducers: {
    addProducer: (state, action: PayloadAction<Omit<Producer, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newProducer: Producer = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.producers.push(newProducer);
    },
    
    updateProducer: (state, action: PayloadAction<Producer>) => {
      const index = state.producers.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.producers[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    deleteProducer: (state, action: PayloadAction<string>) => {
      state.producers = state.producers.filter(p => p.id !== action.payload);
    },
    
    addFarm: (state, action: PayloadAction<{ producerId: string; farm: Omit<Farm, 'id' | 'createdAt' | 'updatedAt' | 'producerId'> }>) => {
      const producer = state.producers.find(p => p.id === action.payload.producerId);
      if (producer) {
        const newFarm: Farm = {
          ...action.payload.farm,
          id: generateId(),
          producerId: action.payload.producerId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        producer.farms.push(newFarm);
        producer.updatedAt = new Date().toISOString();
      }
    },
    
    updateFarm: (state, action: PayloadAction<Farm>) => {
      const producer = state.producers.find(p => p.id === action.payload.producerId);
      if (producer) {
        const farmIndex = producer.farms.findIndex(f => f.id === action.payload.id);
        if (farmIndex !== -1) {
          producer.farms[farmIndex] = {
            ...action.payload,
            updatedAt: new Date().toISOString(),
          };
          producer.updatedAt = new Date().toISOString();
        }
      }
    },
    
    deleteFarm: (state, action: PayloadAction<{ producerId: string; farmId: string }>) => {
      const producer = state.producers.find(p => p.id === action.payload.producerId);
      if (producer) {
        producer.farms = producer.farms.filter(f => f.id !== action.payload.farmId);
        producer.updatedAt = new Date().toISOString();
      }
    },
    
    addCrop: (state, action: PayloadAction<{ producerId: string; farmId: string; crop: Omit<Crop, 'id' | 'createdAt' | 'farmId'> }>) => {
      const producer = state.producers.find(p => p.id === action.payload.producerId);
      if (producer) {
        const farm = producer.farms.find(f => f.id === action.payload.farmId);
        if (farm) {
          const newCrop: Crop = {
            ...action.payload.crop,
            id: generateId(),
            farmId: action.payload.farmId,
            createdAt: new Date().toISOString(),
          };
          farm.crops.push(newCrop);
          producer.updatedAt = new Date().toISOString();
        }
      }
    },
    
    deleteCrop: (state, action: PayloadAction<{ producerId: string; farmId: string; cropId: string }>) => {
      const producer = state.producers.find(p => p.id === action.payload.producerId);
      if (producer) {
        const farm = producer.farms.find(f => f.id === action.payload.farmId);
        if (farm) {
          farm.crops = farm.crops.filter(c => c.id !== action.payload.cropId);
          producer.updatedAt = new Date().toISOString();
        }
      }
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addProducer,
  updateProducer,
  deleteProducer,
  addFarm,
  updateFarm,
  deleteFarm,
  addCrop,
  deleteCrop,
  setLoading,
  setError,
} = producersSlice.actions;

// Selectors
export const selectAllProducers = (state: { producers: ProducersState }) => state.producers.producers;
export const selectProducerById = (id: string) => (state: { producers: ProducersState }) =>
  state.producers.producers.find(p => p.id === id);

export const selectDashboardData = createSelector(
  [selectAllProducers],
  (producers): DashboardData => {
    const totalFarms = producers.reduce((sum, producer) => sum + producer.farms.length, 0);
    const totalHectares = producers.reduce(
      (sum, producer) => sum + producer.farms.reduce((farmSum, farm) => farmSum + farm.totalArea, 0),
      0
    );

    const farmsByState: { [state: string]: number } = {};
    const farmsByCrop: { [crop: string]: number } = {};
    let agriculturalArea = 0;
    let vegetationArea = 0;

    producers.forEach(producer => {
      producer.farms.forEach(farm => {
        // Count farms by state
        farmsByState[farm.state] = (farmsByState[farm.state] || 0) + 1;
        
        // Sum land use
        agriculturalArea += farm.agriculturalArea;
        vegetationArea += farm.vegetationArea;
        
        // Count crops
        farm.crops.forEach(crop => {
          farmsByCrop[crop.name] = (farmsByCrop[crop.name] || 0) + 1;
        });
      });
    });

    return {
      totalFarms,
      totalHectares,
      farmsByState,
      farmsByCrop,
      landUse: {
        agricultural: agriculturalArea,
        vegetation: vegetationArea,
      },
    };
  }
);

export default producersSlice.reducer;
