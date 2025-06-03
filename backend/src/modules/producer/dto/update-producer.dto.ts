import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProducerDto } from './create-producer.dto';
import { IsOptional } from 'class-validator';

export class UpdateProducerDto extends PartialType(CreateProducerDto) {
  @ApiProperty({
    description: 'Producer CPF or CNPJ document',
    example: '12345678901',
    required: false
  })
  @IsOptional()
  cpfCnpj?: string;

  @ApiProperty({
    description: 'Producer name',
    example: 'João Silva',
    required: false
  })
  @IsOptional()
  name?: string;
}
