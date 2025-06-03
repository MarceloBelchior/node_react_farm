import React from 'react';
import styled from 'styled-components';
import { theme, ErrorMessage } from './styled';

interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  name?: string;
  id?: string;
  min?: number;
  max?: number;
  step?: number;
}

const InputContainer = styled.div<{ fullWidth?: boolean }>`
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

const StyledInput = styled.input<{ hasError?: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${props => props.hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 1rem;
  background-color: ${theme.colors.surface};
  color: ${theme.colors.text};
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  
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
  
  &::placeholder {
    color: ${theme.colors.textLight};
  }
`;

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  fullWidth = false,
  name,
  id,
  min,
  max,
  step,
}) => {
  const inputId = id || name;

  return (
    <InputContainer fullWidth={fullWidth}>
      {label && (
        <Label htmlFor={inputId}>
          {label}
          {required && <span style={{ color: theme.colors.error }}> *</span>}
        </Label>
      )}
      <StyledInput
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        hasError={!!error}
        min={min}
        max={max}
        step={step}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};
