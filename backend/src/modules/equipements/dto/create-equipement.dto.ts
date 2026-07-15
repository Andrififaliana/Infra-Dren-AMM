import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateEquipementDto {
  @ApiProperty({ example: 'Table-banc' })
  @IsNotEmpty({ message: 'Le nom de l\'équipement est requis' })
  @IsString()
  nomEquip: string;

  @ApiPropertyOptional({ example: 'MOBILIER' })
  @IsOptional()
  @IsString()
  typeEquip?: string;

  @ApiPropertyOptional({ example: 'BON' })
  @IsOptional()
  @IsString()
  etat?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantite?: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  salleId: number;
}
