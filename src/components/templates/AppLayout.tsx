import React from 'react';
import styled from 'styled-components';
import { Container, theme } from '../atoms';
import { Navigation } from '../organisms';

interface AppLayoutProps {
  currentPage: 'dashboard' | 'producers';
  onNavigate: (page: 'dashboard' | 'producers') => void;
  children: React.ReactNode;
}

const Layout = styled.div`
  min-height: 100vh;
  background-color: ${theme.colors.background};
`;

const Main = styled.main`
  padding-bottom: ${theme.spacing.xxl};
`;

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPage,
  onNavigate,
  children,
}) => {
  return (
    <Layout>
      <Navigation currentPage={currentPage} onNavigate={onNavigate} />
      <Main>
        <Container>
          {children}
        </Container>
      </Main>
    </Layout>
  );
};
