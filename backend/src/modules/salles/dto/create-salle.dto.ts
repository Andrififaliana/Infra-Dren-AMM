import { IsNotEmpty, IsOptional, IsString, IsInt, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSalleDto {
  @ApiProperty({ example: 'SALLE-101' })
  @IsOptional()
  @IsString()
  sigleSalle?: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  niveauSalle: number;

  @ApiPropertyOptional({ example: 'CLASSE' })
  @IsOptional()
  @IsString()
  affectationSalle?: string;

  @ApiPropertyOptional({ example: 'BON' })
  @IsOptional()
  @IsString()
  etatSalle?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  estOperationnel?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  estElectrifiee?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  longueurInt?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  hauteurSP?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  nbEleveF?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  nbEleveG?: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  batimentId: number;
}
