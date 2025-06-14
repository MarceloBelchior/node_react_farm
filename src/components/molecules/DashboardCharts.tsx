import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import styled from 'styled-components';
import { DashboardData } from '../../types';
import { Card, Grid, SectionTitle, theme } from '../atoms';

interface DashboardChartsProps {
  data: DashboardData;
}

const StatsContainer = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  margin-bottom: ${theme.spacing.xl};
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: ${theme.spacing.lg};
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${theme.colors.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: ${theme.colors.textLight};
`;

const ChartContainer = styled(Card)`
  height: 400px;
  
  .recharts-wrapper {
    width: 100% !important;
    height: 100% !important;
  }
`;

const ChartGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
`;

const ChartTitle = styled.h3`
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.md};
  font-size: 1.25rem;
  font-weight: 500;
`;

const COLORS = [
  theme.colors.primary,
  theme.colors.secondary,
  theme.colors.success,
  theme.colors.warning,
  theme.colors.info,
  '#9C27B0',
  '#FF5722',
  '#607D8B',
];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ data }) => {
  // Transform data for charts - use static data if properties are null/undefined
  const stateData = data?.farmsByState?.map(item => ({
    name: item.state,
    value: item.count,
  })) || [];

  const cropData = data?.cropStatistics?.map(item => ({
    name: item.crop.name,
    value: item.count,
    area: item.totalArea,
    percentage: item.percentage,
  })) || [];

  const landUseData = [
    {
      name: 'Área Agricultável',
      value: data?.landUseDistribution?.agricultural?.area || 0,
      percentage: data?.landUseDistribution?.agricultural?.percentage || 0,
    },
    {
      name: 'Área de Vegetação',
      value: data?.landUseDistribution?.vegetation?.area || 0,
      percentage: data?.landUseDistribution?.vegetation?.percentage || 0,
    },
    {
      name: 'Área Não Utilizada',
      value: data?.landUseDistribution?.unused?.area || 0,
      percentage: data?.landUseDistribution?.unused?.percentage || 0,
    },
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.sm,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.borderRadius.small,
          boxShadow: theme.shadows.medium,
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <SectionTitle>Estatísticas Gerais</SectionTitle>
      <StatsContainer>
        <StatCard>
          <StatNumber>{data.totalFarms}</StatNumber>
          <StatLabel>Total de Fazendas</StatLabel>
        </StatCard>

        <StatCard>
          <StatNumber>{data.totalArea.toLocaleString()}</StatNumber>
          <StatLabel>Total de Hectares</StatLabel>
        </StatCard>

        <StatCard>
          <StatNumber>{data.totalProducers}</StatNumber>
          <StatLabel>Total de Produtores</StatLabel>
        </StatCard>

        <StatCard>
          <StatNumber>{Math.round(data.averageFarmSize).toLocaleString()}</StatNumber>
          <StatLabel>Média de Hectares por Fazenda</StatLabel>
        </StatCard>
      </StatsContainer>

      <SectionTitle>Gráficos</SectionTitle>
      <ChartGrid>
        {stateData.length > 0 && (
          <ChartContainer>
            <ChartTitle>Fazendas por Estado</ChartTitle>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={stateData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}

        {cropData.length > 0 && (
          <ChartContainer>
            <ChartTitle>Culturas Plantadas</ChartTitle>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={cropData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill={theme.colors.primary} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}

        {landUseData.length > 0 && (
          <ChartContainer>
            <ChartTitle>Uso do Solo</ChartTitle>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={landUseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {landUseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value.toLocaleString()} hectares`, 'Área']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </ChartGrid>
    </>
  );
};
