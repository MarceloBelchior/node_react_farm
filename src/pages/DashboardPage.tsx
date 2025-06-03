import React from 'react';
import { useSelector } from 'react-redux';
import { selectDashboardData } from '../store/slices/producersSlice';
import { PageTitle } from '../components/atoms';
import { DashboardCharts } from '../components/molecules';

export const DashboardPage: React.FC = () => {
  const dashboardData = useSelector(selectDashboardData);

  return (
    <div>
      <PageTitle>Dashboard</PageTitle>
      <DashboardCharts data={dashboardData} />
    </div>
  );
};
