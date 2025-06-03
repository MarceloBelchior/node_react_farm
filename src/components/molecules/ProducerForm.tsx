import React, { useState } from 'react';
import styled from 'styled-components';
import { Producer } from '../../types';
import { Button, Input, Card, FlexContainer, theme } from '../atoms';
import { validateProducerForm, formatCpfCnpj } from '../../utils/validation';

interface ProducerFormProps {
  producer?: Producer;
  onSubmit: (data: Omit<Producer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const FormContainer = styled(Card)`
  max-width: 600px;
  margin: 0 auto;
`;

const FormTitle = styled.h2`
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.lg};
  font-size: 1.5rem;
  font-weight: 600;
`;

const FormGrid = styled.div`
  display: grid;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const ButtonGroup = styled(FlexContainer)`
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    flex-direction: column;
    
    button {
      width: 100%;
    }
  }
`;

export const ProducerForm: React.FC<ProducerFormProps> = ({
  producer,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: producer?.name || '',
    cpfCnpj: producer?.cpfCnpj || '',
    farms: producer?.farms || [],
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'cpfCnpj' ? formatCpfCnpj(value) : value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateProducerForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <FormContainer>
      <FormTitle>
        {producer ? 'Editar Produtor' : 'Novo Produtor'}
      </FormTitle>
      
      <form onSubmit={handleSubmit}>
        <FormGrid>
          <Input
            label="Nome do Produtor"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            required
            fullWidth
            placeholder="Digite o nome do produtor"
          />
          
          <Input
            label="CPF ou CNPJ"
            value={formData.cpfCnpj}
            onChange={(e) => handleInputChange('cpfCnpj', e.target.value)}
            error={errors.cpfCnpj}
            required
            fullWidth
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
          />
        </FormGrid>
        
        <ButtonGroup>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {producer ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};
