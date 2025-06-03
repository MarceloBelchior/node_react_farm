import React, { useState } from 'react';
import styled from 'styled-components';
import { Producer } from '../../types';
import { formatCpfCnpj, validateProducerForm } from '../../utils/validation';
import { Button, Card, FlexContainer, Input, theme } from '../atoms';

// Define types for form errors
interface AddressErrors {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface FormErrors {
  name?: string;
  cpfCnpj?: string;
  email?: string;
  phone?: string;
  address?: AddressErrors;
}

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
    email: producer?.email || '',
    phone: producer?.phone || '',
    address: producer?.address || {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    farms: producer?.farms || [],
  });
  const [errors, setErrors] = useState<FormErrors>({}); const handleInputChange = (field: keyof Omit<FormErrors, 'address'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'cpfCnpj' ? formatCpfCnpj(value) : value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleAddressChange = (field: keyof AddressErrors, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));

    // Clear error when user starts typing
    if (errors.address && errors.address[field]) {
      setErrors(prev => ({
        ...prev,
        address: {
          ...prev.address as AddressErrors,
          [field]: undefined,
        },
      }));
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); const validationErrors = validateProducerForm(formData) as FormErrors;

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Ensure all required fields are included when submitting
    const producerData: Omit<Producer, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      cpfCnpj: formData.cpfCnpj,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      farms: formData.farms || [],
    };

    onSubmit(producerData);
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
          />          <Input
            label="CPF ou CNPJ"
            value={formData.cpfCnpj}
            onChange={(e) => handleInputChange('cpfCnpj', e.target.value)}
            error={errors.cpfCnpj}
            required
            fullWidth
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
          />

          <Input
            label="E-mail"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            required
            fullWidth
            type="email"
            placeholder="exemplo@email.com"
          />

          <Input
            label="Telefone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={errors.phone}
            required
            fullWidth
            placeholder="(00) 00000-0000"
          />

          <Input
            label="Rua"
            value={formData.address.street}
            onChange={(e) => handleAddressChange('street', e.target.value)}
            error={errors.address?.street}
            required
            fullWidth
            placeholder="Nome da rua, número"
          />

          <Input
            label="Cidade"
            value={formData.address.city}
            onChange={(e) => handleAddressChange('city', e.target.value)}
            error={errors.address?.city}
            required
            fullWidth
            placeholder="Nome da cidade"
          />

          <Input
            label="Estado"
            value={formData.address.state}
            onChange={(e) => handleAddressChange('state', e.target.value)}
            error={errors.address?.state}
            required
            fullWidth
            placeholder="UF"
          />

          <Input
            label="CEP"
            value={formData.address.zipCode}
            onChange={(e) => handleAddressChange('zipCode', e.target.value)}
            error={errors.address?.zipCode}
            required
            fullWidth
            placeholder="00000-000"
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
