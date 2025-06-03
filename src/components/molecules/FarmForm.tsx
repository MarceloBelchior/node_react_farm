import React, { useState } from 'react';
import styled from 'styled-components';
import { BRAZILIAN_STATES, CROP_TYPES, Farm } from '../../types';
import { validateFarmForm } from '../../utils/validation';
import { Button, Card, FlexContainer, Input, Select, theme } from '../atoms';

interface FarmFormProps {
  farm?: Farm;
  onSubmit: (data: Omit<Farm, 'id' | 'createdAt' | 'updatedAt' | 'producerId'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const FormContainer = styled(Card)`
  max-width: 800px;
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
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
  
  .full-width {
    grid-column: 1 / -1;
  }
`;

const CropSection = styled.div`
  grid-column: 1 / -1;
  margin-top: ${theme.spacing.md};
`;

const CropList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};
`;

const CropTag = styled.div`
  background-color: ${theme.colors.primaryLight};
  color: white;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const RemoveCropButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  margin-left: ${theme.spacing.xs};
  
  &:hover {
    opacity: 0.7;
  }
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

const AddCropContainer = styled(FlexContainer)`
  gap: ${theme.spacing.sm};
  align-items: flex-end;
  margin-top: ${theme.spacing.sm};
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const FarmForm: React.FC<FarmFormProps> = ({
  farm,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: farm?.name || '',
    city: farm?.city || '',
    state: farm?.state || '',
    totalArea: farm?.totalArea || '',
    agriculturalArea: farm?.agriculturalArea || '',
    vegetationArea: farm?.vegetationArea || '',
    crops: farm?.crops || [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newCrop, setNewCrop] = useState({ name: '', harvest: '' });

  const stateOptions = BRAZILIAN_STATES.map(state => ({
    value: state,
    label: state,
  }));

  const cropOptions = CROP_TYPES.map(crop => ({
    value: crop,
    label: crop,
  }));

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleAddCrop = () => {
    if (newCrop.name && newCrop.harvest) {
      const cropToAdd = {
        id: Date.now().toString(),
        name: newCrop.name,
        harvest: newCrop.harvest,
        farmId: farm?.id || '',
        createdAt: new Date().toISOString(),
      };

      setFormData(prev => ({
        ...prev,
        crops: [...prev.crops, cropToAdd],
      }));

      setNewCrop({ name: '', harvest: '' });
    }
  };

  const handleRemoveCrop = (cropId: string) => {
    setFormData(prev => ({
      ...prev,
      crops: prev.crops.filter(crop => crop.id !== cropId),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dataToValidate = {
      ...formData,
      totalArea: Number(formData.totalArea),
      agriculturalArea: Number(formData.agriculturalArea),
      vegetationArea: Number(formData.vegetationArea),
    };

    const validationErrors = validateFarmForm(dataToValidate);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(dataToValidate);
  };

  return (
    <FormContainer>
      <FormTitle>
        {farm ? 'Editar Fazenda' : 'Nova Fazenda'}
      </FormTitle>

      <form onSubmit={handleSubmit}>
        <FormGrid>
          <Input
            label="Nome da Fazenda"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            required
            fullWidth
            placeholder="Digite o nome da fazenda"
          />

          <Input
            label="Cidade"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            error={errors.city}
            required
            fullWidth
            placeholder="Digite a cidade"
          />

          <Select
            label="Estado"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            options={stateOptions}
            error={errors.state}
            required
            fullWidth
            placeholder="Selecione o estado"
          />

          <Input
            label="Área Total (hectares)"
            type="number"
            value={formData.totalArea}
            onChange={(e) => handleInputChange('totalArea', e.target.value)}
            error={errors.totalArea}
            required
            fullWidth
            min={0}
            step={0.01}
            placeholder="0.00"
          />

          <Input
            label="Área Agricultável (hectares)"
            type="number"
            value={formData.agriculturalArea}
            onChange={(e) => handleInputChange('agriculturalArea', e.target.value)}
            error={errors.agriculturalArea}
            required
            fullWidth
            min={0}
            step={0.01}
            placeholder="0.00"
          />

          <Input
            label="Área de Vegetação (hectares)"
            type="number"
            value={formData.vegetationArea}
            onChange={(e) => handleInputChange('vegetationArea', e.target.value)}
            error={errors.vegetationArea}
            required
            fullWidth
            min={0}
            step={0.01}
            placeholder="0.00"
          />

          <CropSection>
            <h3>Culturas Plantadas</h3>

            <AddCropContainer>
              <Select
                label="Cultura"
                value={newCrop.name}
                onChange={(e) => setNewCrop(prev => ({ ...prev, name: e.target.value }))}
                options={cropOptions}
                placeholder="Selecione uma cultura"
              />

              <Input
                label="Safra"
                value={newCrop.harvest}
                onChange={(e) => setNewCrop(prev => ({ ...prev, harvest: e.target.value }))}
                placeholder="Ex: 2024"
              />

              <Button
                type="button"
                variant="secondary"
                onClick={handleAddCrop}
                disabled={!newCrop.name || !newCrop.harvest}
              >
                Adicionar
              </Button>
            </AddCropContainer>

            {formData.crops.length > 0 && (
              <CropList>
                {formData.crops.map((crop) => (
                  <CropTag key={crop.id}>
                    {crop.name} - {crop.harvest}
                    <RemoveCropButton
                      type="button"
                      onClick={() => handleRemoveCrop(crop.id)}
                    >
                      ×
                    </RemoveCropButton>
                  </CropTag>
                ))}
              </CropList>
            )}
          </CropSection>
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
            {farm ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};
