import { IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateEtablissementDto {
  @ApiPropertyOptional({ example: "École Primaire d'Ambohimanarina" })
  @IsOptional()
  @IsString()
  nomEtab?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dren?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cisco?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zap?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commune?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fokontany?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  quartier?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  couvTelephonique?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  couvInternet?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  nbEnseignantG?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  nbEnseignantF?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  nbSectionG?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  nbSectionF?: number;
}
