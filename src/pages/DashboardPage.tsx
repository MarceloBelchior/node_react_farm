import React from 'react';
import { useSelector } from 'react-redux';
import { PageTitle } from '../components/atoms';
import { DashboardCharts } from '../components/molecules';
import { selectDashboardData, selectLoading } from '../store/slices/producersSlice';

export const DashboardPage: React.FC = () => {
  const dashboardData = useSelector(selectDashboardData);
  const loading = useSelector(selectLoading);

  return (
    <div>
      <PageTitle>Dashboard</PageTitle>
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Carregando dados do dashboard...</p>
        </div>
      ) : !dashboardData ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Nenhum dado disponível no momento. Adicione produtores e fazendas para visualizar estatísticas.</p>
        </div>
      ) : (
        <DashboardCharts data={dashboardData} />
      )}
    </div>
  );
};
