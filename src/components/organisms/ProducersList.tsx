import React, { useState } from 'react';
import styled from 'styled-components';
import { Producer, Farm } from '../../types';
import { Button, Card, FlexContainer, Grid, theme } from '../atoms';

interface ProducersListProps {
  producers: Producer[];
  onEditProducer: (producer: Producer) => void;
  onDeleteProducer: (id: string) => void;
  onAddFarm: (producerId: string) => void;
  onEditFarm: (producerId: string, farm: Farm) => void;
  onDeleteFarm: (producerId: string, farmId: string) => void;
}

const ProducerCard = styled(Card)`
  border-left: 4px solid ${theme.colors.primary};
`;

const ProducerHeader = styled(FlexContainer)`
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ProducerInfo = styled.div`
  flex: 1;
`;

const ProducerName = styled.h3`
  color: ${theme.colors.text};
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: ${theme.spacing.xs};
`;

const ProducerDetail = styled.p`
  color: ${theme.colors.textLight};
  font-size: 0.875rem;
  margin: 0;
`;

const ActionButtons = styled(FlexContainer)`
  gap: ${theme.spacing.sm};
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    justify-content: flex-end;
  }
`;

const FarmsList = styled.div`
  margin-top: ${theme.spacing.md};
`;

const FarmCard = styled.div`
  background-color: ${theme.colors.borderLight};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.sm};
`;

const FarmHeader = styled(FlexContainer)`
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.sm};
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FarmInfo = styled.div`
  flex: 1;
`;

const FarmName = styled.h4`
  color: ${theme.colors.text};
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: ${theme.spacing.xs};
`;

const FarmDetails = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.sm};
  font-size: 0.875rem;
  color: ${theme.colors.textLight};
`;

const CropsList = styled.div`
  margin-top: ${theme.spacing.sm};
`;

const CropTag = styled.span`
  background-color: ${theme.colors.primaryLight};
  color: white;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  font-size: 0.75rem;
  margin-right: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.xs};
  display: inline-block;
`;

const NoDataMessage = styled.div`
  text-align: center;
  color: ${theme.colors.textLight};
  font-style: italic;
  padding: ${theme.spacing.xl};
`;

const FarmsSection = styled.div`
  margin-top: ${theme.spacing.md};
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border};
`;

const SectionHeader = styled(FlexContainer)`
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

const SectionTitle = styled.h4`
  color: ${theme.colors.text};
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
`;

export const ProducersList: React.FC<ProducersListProps> = ({
  producers,
  onEditProducer,
  onDeleteProducer,
  onAddFarm,
  onEditFarm,
  onDeleteFarm,
}) => {
  const [expandedProducers, setExpandedProducers] = useState<Set<string>>(new Set());

  const toggleExpanded = (producerId: string) => {
    setExpandedProducers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(producerId)) {
        newSet.delete(producerId);
      } else {
        newSet.add(producerId);
      }
      return newSet;
    });
  };

  if (producers.length === 0) {
    return (
      <NoDataMessage>
        Nenhum produtor cadastrado. Clique em "Novo Produtor" para começar.
      </NoDataMessage>
    );
  }

  return (
    <div>
      {producers.map((producer) => (
        <ProducerCard key={producer.id}>
          <ProducerHeader>
            <ProducerInfo>
              <ProducerName>{producer.name}</ProducerName>
              <ProducerDetail>CPF/CNPJ: {producer.cpfCnpj}</ProducerDetail>
              <ProducerDetail>
                {producer.farms.length} fazenda(s) cadastrada(s)
              </ProducerDetail>
            </ProducerInfo>
            
            <ActionButtons>
              <Button
                size="small"
                variant="outline"
                onClick={() => toggleExpanded(producer.id)}
              >
                {expandedProducers.has(producer.id) ? 'Ocultar' : 'Ver'} Fazendas
              </Button>
              <Button
                size="small"
                variant="secondary"
                onClick={() => onEditProducer(producer)}
              >
                Editar
              </Button>
              <Button
                size="small"
                variant="danger"
                onClick={() => onDeleteProducer(producer.id)}
              >
                Excluir
              </Button>
            </ActionButtons>
          </ProducerHeader>

          {expandedProducers.has(producer.id) && (
            <FarmsSection>
              <SectionHeader>
                <SectionTitle>Fazendas ({producer.farms.length})</SectionTitle>
                <Button
                  size="small"
                  variant="success"
                  onClick={() => onAddFarm(producer.id)}
                >
                  + Nova Fazenda
                </Button>
              </SectionHeader>

              <FarmsList>
                {producer.farms.length === 0 ? (
                  <NoDataMessage>
                    Nenhuma fazenda cadastrada para este produtor.
                  </NoDataMessage>
                ) : (
                  producer.farms.map((farm) => (
                    <FarmCard key={farm.id}>
                      <FarmHeader>
                        <FarmInfo>
                          <FarmName>{farm.name}</FarmName>
                          <FarmDetails>
                            <div>📍 {farm.city}, {farm.state}</div>
                            <div>🌾 Total: {farm.totalArea.toLocaleString()} ha</div>
                            <div>🚜 Agricultável: {farm.agriculturalArea.toLocaleString()} ha</div>
                            <div>🌳 Vegetação: {farm.vegetationArea.toLocaleString()} ha</div>
                          </FarmDetails>
                          
                          {farm.crops.length > 0 && (
                            <CropsList>
                              <strong>Culturas:</strong>{' '}
                              {farm.crops.map((crop) => (
                                <CropTag key={crop.id}>
                                  {crop.name} - {crop.harvest}
                                </CropTag>
                              ))}
                            </CropsList>
                          )}
                        </FarmInfo>
                        
                        <ActionButtons>
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => onEditFarm(producer.id, farm)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="small"
                            variant="danger"
                            onClick={() => onDeleteFarm(producer.id, farm.id)}
                          >
                            Excluir
                          </Button>
                        </ActionButtons>
                      </FarmHeader>
                    </FarmCard>
                  ))
                )}
              </FarmsList>
            </FarmsSection>
          )}
        </ProducerCard>
      ))}
    </div>
  );
};
