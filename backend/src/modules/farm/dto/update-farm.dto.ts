import { PartialType } from '@nestjs/swagger';
import { CreateFarmDto } from './create-farm.dto';
import { IsOptional } from 'class-validator';

export class UpdateFarmDto extends PartialType(CreateFarmDto) {
  @IsOptional()
  producerId?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  state?: string;

  @IsOptional()
  totalArea?: number;

  @IsOptional()
  agriculturalArea?: number;

  @IsOptional()
  vegetationArea?: number;

  @IsOptional()
  crops?: string[];
}
