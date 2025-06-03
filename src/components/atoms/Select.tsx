import React from 'react';
import styled from 'styled-components';
import { theme, ErrorMessage } from './styled';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  name?: string;
  id?: string;
}

const SelectContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  ${props => props.fullWidth && 'width: 100%;'}
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
`;

const StyledSelect = styled.select<{ hasError?: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${props => props.hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 1rem;
  background-color: ${theme.colors.surface};
  color: ${theme.colors.text};
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => 
      props.hasError 
        ? 'rgba(244, 67, 54, 0.1)' 
        : 'rgba(46, 125, 50, 0.1)'
    };
  }
  
  &:disabled {
    background-color: ${theme.colors.borderLight};
    color: ${theme.colors.textLight};
    cursor: not-allowed;
  }
`;

export const Select: React.FC<SelectProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  options,
  error,
  disabled = false,
  required = false,
  fullWidth = false,
  name,
  id,
}) => {
  const selectId = id || name;

  return (
    <SelectContainer fullWidth={fullWidth}>
      {label && (
        <Label htmlFor={selectId}>
          {label}
          {required && <span style={{ color: theme.colors.error }}> *</span>}
        </Label>
      )}
      <StyledSelect
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        hasError={!!error}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </StyledSelect>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </SelectContainer>
  );
};
