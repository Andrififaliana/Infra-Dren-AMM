import { IsOptional, IsString, IsInt, IsBoolean, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateSalleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sigleSalle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  niveauSalle?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  affectationSalle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  etatSalle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  estOperationnel?: boolean;

  @ApiPropertyOptional()
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

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  nbEleveF?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  nbEleveG?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  batimentId?: number;
}
