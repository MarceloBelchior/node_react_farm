import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { GlobalStyle } from './components/atoms';
import { AppLayout } from './components/templates';
import { DashboardPage, ProducersPage } from './pages';
import { healthApi } from './services/api';
import { AppDispatch, RootState, store } from './store';
import { fetchDashboardData, fetchFarms, fetchProducers, selectError, selectLoading } from './store/slices/producersSlice';

type PageType = 'dashboard' | 'producers';

const DataLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => selectLoading(state));
  const error = useSelector((state: RootState) => selectError(state));
  const [apiStatus, setApiStatus] = useState<{
    connected: boolean;
    checking: boolean;
    error?: string;
  }>({
    connected: false,
    checking: true
  });

  useEffect(() => {
    // Check API connection
    const checkApiConnection = async () => {
      try {

        await healthApi.check();

        setApiStatus({ connected: true, checking: false });

        // If API is connected, fetch initial data
        dispatch(fetchProducers());
        dispatch(fetchFarms());
        dispatch(fetchDashboardData());
      } catch (error) {
        console.error('API connection failed:', error);
        setApiStatus({
          connected: false,
          checking: false,
          error: 'Não foi possível conectar à API. Verifique se o backend está rodando.'
        });
      }
    };

    checkApiConnection();
  }, [dispatch]);

  if (apiStatus.checking) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Conectando à API...</p>
      </div>
    );
  }

  if (!apiStatus.connected) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#fee',
        color: '#c00',
        borderRadius: '8px',
        margin: '2rem'
      }}>
        <h3>Erro de Conexão</h3>
        <p>{apiStatus.error || 'Não foi possível conectar à API. Verifique se o backend está rodando.'}</p>
        <p>Verifique se o servidor está rodando em http://localhost:3001</p>
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'producers':
        return <ProducersPage />;
      default:
        return <DashboardPage />;
    }
  };
  return (
    <Provider store={store}>
      <GlobalStyle />
      <AppLayout currentPage={currentPage} onNavigate={handleNavigate}>
        <DataLoader>
          {renderPage()}
        </DataLoader>
      </AppLayout>
    </Provider>
  );
}

export default App;
