import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNumber, 
  IsArray, 
  IsOptional, 
  IsNotEmpty, 
  Min, 
  MaxLength, 
  Length,
  IsMongoId,
  IsEnum,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { Transform } from 'class-transformer';

// Custom validator for area validation
@ValidatorConstraint({ name: 'totalAreaValidation', async: false })
export class TotalAreaValidation implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments) {
    const obj = args.object as CreateFarmDto;
    const totalUsed = (obj.agriculturalArea || 0) + (obj.vegetationArea || 0);
    return value > totalUsed;
  }
  defaultMessage(_args: ValidationArguments) {
    return 'Total area must be greater than agricultural + vegetation areas';
  }
}

@ValidatorConstraint({ name: 'areasSumValidation', async: false })
export class AreasSumValidation implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments) {
    const obj = args.object as CreateFarmDto;
    const totalUsed = value + (obj.vegetationArea || 0);
    return totalUsed <= (obj.totalArea || 0);
  }
  defaultMessage(_args: ValidationArguments) {
    return 'Agricultural area + vegetation area cannot exceed total area';
  }
}

export class CreateFarmDto {
  @ApiProperty({
    description: 'Producer ID who owns this farm',
    example: '507f1f77bcf86cd799439011'
  })
  @IsNotEmpty({ message: 'Producer ID is required' })
  @IsMongoId({ message: 'Producer ID must be a valid MongoDB ObjectId' })
  producerId: string;

  @ApiProperty({
    description: 'Farm name',
    example: 'Fazenda São João',
    maxLength: 200
  })
  @IsNotEmpty({ message: 'Farm name is required' })
  @IsString({ message: 'Farm name must be a string' })
  @MaxLength(200, { message: 'Farm name cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'City where the farm is located',
    example: 'Ribeirão Preto',
    maxLength: 200
  })
  @IsNotEmpty({ message: 'City is required' })
  @IsString({ message: 'City must be a string' })
  @MaxLength(200, { message: 'City cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  city: string;

  @ApiProperty({
    description: 'State abbreviation (2 letters)',
    example: 'SP',
    minLength: 2,
    maxLength: 2
  })
  @IsNotEmpty({ message: 'State is required' })
  @IsString({ message: 'State must be a string' })
  @Length(2, 2, { message: 'State must be exactly 2 characters' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  state: string;

  @ApiProperty({
    description: 'Total farm area in hectares',
    example: 1000.5,
    minimum: 0.01
  })
  @IsNotEmpty({ message: 'Total area is required' })
  @IsNumber({}, { message: 'Total area must be a number' })
  @Min(0.01, { message: 'Total area must be at least 0.01 hectares' })
  @Validate(TotalAreaValidation)
  totalArea: number;

  @ApiProperty({
    description: 'Agricultural area in hectares',
    example: 600.0,
    minimum: 0
  })
  @IsNotEmpty({ message: 'Agricultural area is required' })
  @IsNumber({}, { message: 'Agricultural area must be a number' })
  @Min(0, { message: 'Agricultural area cannot be negative' })
  @Validate(AreasSumValidation)
  agriculturalArea: number;

  @ApiProperty({
    description: 'Vegetation area in hectares',
    example: 300.0,
    minimum: 0
  })
  @IsNotEmpty({ message: 'Vegetation area is required' })
  @IsNumber({}, { message: 'Vegetation area must be a number' })
  @Min(0, { message: 'Vegetation area cannot be negative' })
  vegetationArea: number;

  @ApiProperty({
    description: 'Crops planted on the farm',
    example: ['Soja', 'Milho'],
    enum: ['Soja', 'Milho', 'Algodão', 'Café', 'Cana de Açúcar', 'Trigo', 'Arroz', 'Feijão'],
    isArray: true,
    required: false
  })
  @IsOptional()
  @IsArray({ message: 'Crops must be an array' })
  @IsEnum(['Soja', 'Milho', 'Algodão', 'Café', 'Cana de Açúcar', 'Trigo', 'Arroz', 'Feijão'], {
    each: true,
    message: 'Each crop must be one of: Soja, Milho, Algodão, Café, Cana de Açúcar, Trigo, Arroz, Feijão'
  })
  crops?: string[];
}
