import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import producersReducer from '../store/slices/producersSlice';
import { DashboardPage } from '../pages/DashboardPage';

// Mock recharts components
jest.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

const createTestStore = (initialState?: any) => {
  return configureStore({
    reducer: {
      producers: producersReducer,
    },
    preloadedState: initialState,
  });
};

describe('DashboardPage', () => {
  test('renders dashboard title', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('displays statistics', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );

    expect(screen.getByText('Estatísticas Gerais')).toBeInTheDocument();
    expect(screen.getByText('Total de Fazendas')).toBeInTheDocument();
    expect(screen.getByText('Total de Hectares')).toBeInTheDocument();
  });

  test('displays charts section', () => {
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );

    expect(screen.getByText('Gráficos')).toBeInTheDocument();
  });
});
