import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { GlobalStyle } from './components/atoms';
import { AppLayout } from './components/templates';
import { DashboardPage, ProducersPage } from './pages';

type PageType = 'dashboard' | 'producers';

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
        {renderPage()}
      </AppLayout>
    </Provider>
  );
}

export default App;
