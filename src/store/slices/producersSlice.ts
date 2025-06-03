import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ApiError, dashboardApi, farmApi, producerApi } from '../../services/api';
import { DashboardData, Farm, Producer } from '../../types';
import { generateId } from '../../utils/validation';

interface ProducersState {
  producers: Producer[];
  farms: Farm[];
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
  operationLoading: {
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}

const initialState: ProducersState = {
  producers: [],
  farms: [],
  dashboardData: null,
  loading: false,
  error: null,
  operationLoading: {
    create: false,
    update: false,
    delete: false,
  },
};

// Mock data for development
const mockProducers: Producer[] = [{
  id: '1',
  cpfCnpj: '123.456.789-00',
  name: 'João Silva',
  email: 'joao.silva@email.com',
  phone: '(16) 98765-4321',
  address: {
    street: 'Rua das Palmeiras, 123',
    city: 'Ribeirão Preto',
    state: 'SP',
    zipCode: '14020-040'
  },
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
}, {
  id: '2',
  cpfCnpj: '12.345.678/0001-90',
  name: 'Agropecuária Brasil Ltda',
  email: 'contato@agropecuariabrasil.com.br',
  phone: '(67) 3321-9876',
  address: {
    street: 'Avenida Central, 1500',
    city: 'Campo Grande',
    state: 'MS',
    zipCode: '79002-005'
  },
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

// Async thunks for API operations
export const fetchProducers = createAsyncThunk(
  'producers/fetchProducers',
  async (_, { rejectWithValue }) => {
    try {
      const producers = await producerApi.getAll();


      return producers;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to fetch producers';
      return rejectWithValue(message);
    }
  }
);

export const fetchFarms = createAsyncThunk(
  'producers/fetchFarms',
  async (_, { rejectWithValue }) => {
    try {
      const farms = await farmApi.getAll();

      return farms;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to fetch farms';
      return rejectWithValue(message);
    }
  }
);

export const fetchDashboardData = createAsyncThunk(
  'producers/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const dashboardData = await dashboardApi.getAnalytics();
      return dashboardData;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to fetch dashboard data';
      return rejectWithValue(message);
    }
  }
);

export const createProducerAsync = createAsyncThunk(
  'producers/createProducerAsync',
  async (producer: Omit<Producer, 'id' | 'farms' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const newProducer = await producerApi.create(producer);
      return newProducer;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to create producer';
      return rejectWithValue(message);
    }
  }
);

export const updateProducerAsync = createAsyncThunk(
  'producers/updateProducerAsync',
  async ({ id, data }: { id: string; data: Partial<Producer> }, { rejectWithValue }) => {
    try {
      const updatedProducer = await producerApi.update(id, data);
      return updatedProducer;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to update producer';
      return rejectWithValue(message);
    }
  }
);

export const deleteProducerAsync = createAsyncThunk(
  'producers/deleteProducerAsync',
  async (id: string, { rejectWithValue }) => {
    try {
      await producerApi.delete(id);
      return id;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to delete producer';
      return rejectWithValue(message);
    }
  }
);

export const createFarmAsync = createAsyncThunk(
  'producers/createFarmAsync',
  async (farm: Omit<Farm, 'id' | 'crops' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const newFarm = await farmApi.create(farm);
      return newFarm;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to create farm';
      return rejectWithValue(message);
    }
  }
);

export const updateFarmAsync = createAsyncThunk(
  'producers/updateFarmAsync',
  async ({ id, data }: { id: string; data: Partial<Farm> }, { rejectWithValue }) => {
    try {
      const updatedFarm = await farmApi.update(id, data);
      return updatedFarm;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to update farm';
      return rejectWithValue(message);
    }
  }
);

export const deleteFarmAsync = createAsyncThunk(
  'producers/deleteFarmAsync',
  async (id: string, { rejectWithValue }) => {
    try {
      await farmApi.delete(id);
      return id;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to delete farm';
      return rejectWithValue(message);
    }
  }
);

const producersSlice = createSlice({
  name: 'producers',
  initialState,
  reducers: {
    // Legacy reducers (keeping for backwards compatibility but recommending async versions)
    addProducer: (state, action: PayloadAction<Omit<Producer, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newProducer: Producer = {
        ...action.payload,
        id: generateId(),
        farms: [],
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

    clearError: (state) => {
      state.error = null;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Producers
    builder
      .addCase(fetchProducers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducers.fulfilled, (state, action) => {
        state.loading = false;
        state.producers = action.payload;
      })
      .addCase(fetchProducers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Farms
    builder
      .addCase(fetchFarms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarms.fulfilled, (state, action) => {
        state.loading = false;
        state.farms = action.payload;
      })
      .addCase(fetchFarms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Dashboard Data
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Producer
    builder
      .addCase(createProducerAsync.pending, (state) => {
        state.operationLoading.create = true;
        state.error = null;
      })
      .addCase(createProducerAsync.fulfilled, (state, action) => {
        state.operationLoading.create = false;
        state.producers.push(action.payload);
      })
      .addCase(createProducerAsync.rejected, (state, action) => {
        state.operationLoading.create = false;
        state.error = action.payload as string;
      });

    // Update Producer
    builder
      .addCase(updateProducerAsync.pending, (state) => {
        state.operationLoading.update = true;
        state.error = null;
      })
      .addCase(updateProducerAsync.fulfilled, (state, action) => {
        state.operationLoading.update = false;
        const index = state.producers.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.producers[index] = action.payload;
        }
      })
      .addCase(updateProducerAsync.rejected, (state, action) => {
        state.operationLoading.update = false;
        state.error = action.payload as string;
      });

    // Delete Producer
    builder
      .addCase(deleteProducerAsync.pending, (state) => {
        state.operationLoading.delete = true;
        state.error = null;
      })
      .addCase(deleteProducerAsync.fulfilled, (state, action) => {
        state.operationLoading.delete = false;
        state.producers = state.producers.filter(p => p.id !== action.payload);
      })
      .addCase(deleteProducerAsync.rejected, (state, action) => {
        state.operationLoading.delete = false;
        state.error = action.payload as string;
      });

    // Create Farm
    builder
      .addCase(createFarmAsync.pending, (state) => {
        state.operationLoading.create = true;
        state.error = null;
      })
      .addCase(createFarmAsync.fulfilled, (state, action) => {
        state.operationLoading.create = false;
        state.farms.push(action.payload);
      })
      .addCase(createFarmAsync.rejected, (state, action) => {
        state.operationLoading.create = false;
        state.error = action.payload as string;
      });

    // Update Farm
    builder
      .addCase(updateFarmAsync.pending, (state) => {
        state.operationLoading.update = true;
        state.error = null;
      })
      .addCase(updateFarmAsync.fulfilled, (state, action) => {
        state.operationLoading.update = false;
        const index = state.farms.findIndex(f => f.id === action.payload.id);
        if (index !== -1) {
          state.farms[index] = action.payload;
        }
      })
      .addCase(updateFarmAsync.rejected, (state, action) => {
        state.operationLoading.update = false;
        state.error = action.payload as string;
      });

    // Delete Farm
    builder
      .addCase(deleteFarmAsync.pending, (state) => {
        state.operationLoading.delete = true;
        state.error = null;
      })
      .addCase(deleteFarmAsync.fulfilled, (state, action) => {
        state.operationLoading.delete = false;
        state.farms = state.farms.filter(f => f.id !== action.payload);
      })
      .addCase(deleteFarmAsync.rejected, (state, action) => {
        state.operationLoading.delete = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addProducer,
  updateProducer,
  deleteProducer,
  clearError,
  setLoading,
} = producersSlice.actions;

// Selectors
export const selectAllProducers = (state: { producers: ProducersState }) => state.producers.producers;
export const selectAllFarms = (state: { producers: ProducersState }) => state.producers.farms;
export const selectDashboardData = (state: { producers: ProducersState }) => state.producers.dashboardData;
export const selectLoading = (state: { producers: ProducersState }) => state.producers.loading;
export const selectError = (state: { producers: ProducersState }) => state.producers.error;
export const selectOperationLoading = (state: { producers: ProducersState }) => state.producers.operationLoading;

export const selectProducerById = (id: string) => (state: { producers: ProducersState }) =>
  state.producers.producers.find(p => p.id === id);

export const selectFarmsByProducerId = (producerId: string) => (state: { producers: ProducersState }) =>
  state.producers.farms.filter(f => f.producerId === producerId);

// Computed dashboard data selector (fallback if API data not available)
export const selectComputedDashboardData = createSelector(
  [selectAllProducers, selectAllFarms], (producers, farms): DashboardData => {
    const totalFarms = farms.length;
    const totalProducers = producers.length;
    const totalArea = farms.reduce((sum, farm) => sum + farm.totalArea, 0);
    const totalAgriculturalArea = farms.reduce((sum, farm) => sum + farm.agriculturalArea, 0);
    const totalVegetationArea = farms.reduce((sum, farm) => sum + farm.vegetationArea, 0);
    const averageFarmSize = totalArea / totalFarms || 0;

    // Process farms by state
    const stateData = new Map<string, { count: number; area: number }>();
    farms.forEach(farm => {
      const current = stateData.get(farm.state) || { count: 0, area: 0 };
      stateData.set(farm.state, {
        count: current.count + 1,
        area: current.area + farm.totalArea
      });
    });

    const farmsByState = Array.from(stateData.entries()).map(([state, data]) => ({
      state,
      count: data.count,
      totalArea: data.area
    }));

    // Process crop statistics
    const cropMap = new Map<string, { count: number; area: number; harvest: string; createdAt: string }>();
    farms.forEach(farm => {
      farm.crops.forEach(crop => {
        const current = cropMap.get(crop.name) || { count: 0, area: 0, harvest: crop.harvest, createdAt: crop.createdAt };
        cropMap.set(crop.name, {
          count: current.count + 1,
          area: farm.agriculturalArea / farm.crops.length, // Estimate planted area per crop
          harvest: crop.harvest,
          createdAt: crop.createdAt
        });
      });
    });

    const cropStatistics = Array.from(cropMap.entries()).map(([name, data]) => ({
      count: data.count,
      totalArea: data.area,
      crop: {
        name,
        harvest: data.harvest,
        plantedArea: data.area,
        createdAt: data.createdAt
      },
      percentage: (data.count / totalFarms) * 100
    }));

    // Calculate land use distribution
    const totalLandArea = totalAgriculturalArea + totalVegetationArea;
    const unusedArea = totalArea - totalLandArea;

    const landUseDistribution = {
      agricultural: {
        area: totalAgriculturalArea,
        percentage: (totalAgriculturalArea / totalArea) * 100
      },
      vegetation: {
        area: totalVegetationArea,
        percentage: (totalVegetationArea / totalArea) * 100
      },
      unused: {
        area: unusedArea,
        percentage: (unusedArea / totalArea) * 100
      }
    };

    // Calculate top states
    const topStates = farmsByState
      .map(state => ({
        state: state.state,
        farmCount: state.count,
        totalArea: state.totalArea,
        averageSize: state.totalArea / state.count
      }))
      .sort((a, b) => b.totalArea - a.totalArea)
      .slice(0, 5);

    // Calculate recent activity (simulate with mock data since we don't have real timestamps)
    const recentActivity = {
      newProducersLastMonth: Math.floor(totalProducers * 0.1), // Assume 10% are new
      newFarmsLastMonth: Math.floor(totalFarms * 0.1), // Assume 10% are new
      totalGrowthPercentage: 10 // Assume 10% growth
    };

    return {
      totalFarms,
      totalProducers,
      totalArea,
      totalAgriculturalArea,
      totalVegetationArea,
      averageFarmSize,
      farmsByState,
      cropStatistics,
      landUseDistribution,
      topStates,
      recentActivity
    };
  }
);

export default producersSlice.reducer;
