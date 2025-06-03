import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateProducerDto {
  @ApiProperty({
    description: 'Producer CPF or CNPJ document',
    example: '12345678901',
    pattern: '^[0-9]{11}$|^[0-9]{14}$'
  })
  @IsString()
  @IsNotEmpty({ message: 'CPF/CNPJ é obrigatório' })
  @Matches(/^[0-9]{11}$|^[0-9]{14}$/, {
    message: 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos'
  })
  cpfCnpj: string;

  @ApiProperty({
    description: 'Producer name',
    example: 'João Silva',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @Length(2, 100, {
    message: 'Nome deve ter entre 2 e 100 caracteres'
  })
  name: string;
}
