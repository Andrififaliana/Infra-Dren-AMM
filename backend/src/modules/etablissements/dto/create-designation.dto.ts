import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDesignationDto {
  @ApiProperty({ example: 'Terrain A' })
  @IsNotEmpty({ message: 'Le nom de la désignation est requis' })
  @IsString()
  nomDesign!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  estEnceinteEtab?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  estTitre?: boolean;

  @ApiPropertyOptional({ example: 'TITRE_FONCIER' })
  @IsOptional()
  @IsString()
  typeDesignation?: string;

  @ApiPropertyOptional({ example: 'TG 12345' })
  @IsOptional()
  @IsString()
  numCadastre?: string;

  @ApiPropertyOptional({ example: 2500.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  superficieDesign?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  estLitigieux?: boolean;
}
