import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateEtablissementDto {
  @ApiProperty({ example: "École Primaire d'Ambohimanarina" })
  @IsNotEmpty({ message: "Le nom de l'établissement est requis" })
  @IsString()
  nomEtab!: string;

  @ApiPropertyOptional({ example: 'DREN Analamanga' })
  @IsOptional()
  @IsString()
  dren?: string;

  @ApiPropertyOptional({ example: 'CISCO Antananarivo' })
  @IsOptional()
  @IsString()
  cisco?: string;

  @ApiPropertyOptional({ example: 'Ambohimanarina' })
  @IsOptional()
  @IsString()
  commune?: string;

  @ApiPropertyOptional({ example: 'Fokontany A' })
  @IsOptional()
  @IsString()
  fokontany?: string;

  @ApiPropertyOptional({ example: 'Quartier Centre' })
  @IsOptional()
  @IsString()
  quartier?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  couvTelephonique?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  couvInternet?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  nbEnseignantG?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  nbEnseignantF?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  nbSectionG?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  nbSectionF?: number;
}
