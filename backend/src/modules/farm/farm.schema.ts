import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export type FarmDocument = Farm & Document;

@Schema({ 
  timestamps: true,  collection: 'farms',
  toJSON: {
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class Farm {
  @Transform(({ value }) => value.toString())
  @ApiProperty({
    description: 'Farm ID',
    example: '507f1f77bcf86cd799439011'
  })
  id: string;

  @Prop({ 
    type: Types.ObjectId, 
    ref: 'Producer',
    required: true,
    index: true
  })
  @ApiProperty({
    description: 'Producer ID who owns this farm',
    example: '507f1f77bcf86cd799439011'
  })
  producerId: Types.ObjectId;

  @Prop({ 
    required: true,
    trim: true,
    maxlength: 200,
    index: true
  })
  @ApiProperty({
    description: 'Farm name',
    example: 'Fazenda São João',
    maxLength: 200
  })
  name: string;

  @Prop({ 
    required: true,
    trim: true,
    maxlength: 200
  })
  @ApiProperty({
    description: 'City where the farm is located',
    example: 'Ribeirão Preto',
    maxLength: 200
  })
  city: string;

  @Prop({ 
    required: true,
    trim: true,
    length: 2,
    uppercase: true
  })
  @ApiProperty({
    description: 'State abbreviation (2 letters)',
    example: 'SP',
    minLength: 2,
    maxLength: 2
  })
  state: string;

  @Prop({ 
    required: true,
    type: Number,
    min: 0.01,
    validate: {
      validator: function(this: Farm, value: number) {
        return value > (this.agriculturalArea || 0) + (this.vegetationArea || 0);
      },
      message: 'Total area must be greater than agricultural + vegetation areas'
    }
  })
  @ApiProperty({
    description: 'Total farm area in hectares',
    example: 1000.5,
    minimum: 0.01
  })
  totalArea: number;

  @Prop({ 
    required: true,
    type: Number,
    min: 0,
    validate: {
      validator: function(this: Farm, value: number) {
        const totalUsed = value + (this.vegetationArea || 0);
        return totalUsed <= (this.totalArea || 0);
      },
      message: 'Agricultural area + vegetation area cannot exceed total area'
    }
  })
  @ApiProperty({
    description: 'Agricultural area in hectares',
    example: 600.0,
    minimum: 0
  })
  agriculturalArea: number;

  @Prop({ 
    required: true,
    type: Number,
    min: 0,
    validate: {
      validator: function(this: Farm, value: number) {
        const totalUsed = (this.agriculturalArea || 0) + value;
        return totalUsed <= (this.totalArea || 0);
      },
      message: 'Agricultural area + vegetation area cannot exceed total area'
    }
  })
  @ApiProperty({
    description: 'Vegetation area in hectares',
    example: 300.0,
    minimum: 0
  })
  vegetationArea: number;

  @Prop({ 
    type: [String],
    enum: ['Soja', 'Milho', 'Algodão', 'Café', 'Cana de Açúcar', 'Trigo', 'Arroz', 'Feijão'],
    default: []
  })
  @ApiProperty({
    description: 'Crops planted on the farm',
    example: ['Soja', 'Milho'],
    enum: ['Soja', 'Milho', 'Algodão', 'Café', 'Cana de Açúcar', 'Trigo', 'Arroz', 'Feijão'],
    isArray: true
  })
  crops: string[];

  @ApiProperty({
    description: 'Farm creation date',
    example: '2023-01-15T10:30:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Farm last update date',
    example: '2023-06-15T14:45:00.000Z'
  })
  updatedAt: Date;
}

export const FarmSchema = SchemaFactory.createForClass(Farm);

// Add compound indexes for better query performance
FarmSchema.index({ producerId: 1, name: 1 });
FarmSchema.index({ city: 1, state: 1 });
FarmSchema.index({ crops: 1 });

// Add virtual for calculated unused area
FarmSchema.virtual('unusedArea').get(function(this: FarmDocument) {
  return this.totalArea - (this.agriculturalArea + this.vegetationArea);
});

// Add text index for search functionality
FarmSchema.index({
  name: 'text',
  city: 'text',
  state: 'text'
}, {
  weights: {
    name: 10,
    city: 5,
    state: 1
  }
});
