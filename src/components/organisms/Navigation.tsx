import React from 'react';
import styled from 'styled-components';
import { Button, Container, FlexContainer, theme } from '../atoms';

interface NavigationProps {
  currentPage: 'dashboard' | 'producers';
  onNavigate: (page: 'dashboard' | 'producers') => void;
}

const NavContainer = styled.nav`
  background-color: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
  padding: ${theme.spacing.md} 0;
  margin-bottom: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.small};
`;

const NavContent = styled(Container)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: ${theme.spacing.md};
  }
`;

const Logo = styled.h1`
  color: ${theme.colors.primary};
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: 1.5rem;
  }
`;

const NavButtons = styled(FlexContainer)`
  gap: ${theme.spacing.sm};
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    width: 100%;
    justify-content: center;
  }
`;

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  return (
    <NavContainer>
      <NavContent>
        <Logo>🌱 Brain Agriculture</Logo>
        
        <NavButtons>
          <Button
            variant={currentPage === 'dashboard' ? 'primary' : 'outline'}
            onClick={() => onNavigate('dashboard')}
          >
            Dashboard
          </Button>
          
          <Button
            variant={currentPage === 'producers' ? 'primary' : 'outline'}
            onClick={() => onNavigate('producers')}
          >
            Produtores
          </Button>
        </NavButtons>
      </NavContent>
    </NavContainer>
  );
};
