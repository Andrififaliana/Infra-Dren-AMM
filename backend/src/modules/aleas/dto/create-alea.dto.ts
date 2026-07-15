import { IsOptional, IsString, IsArray, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class EffetAleaData {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  trajetId?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  nbElevesG?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  nbElevesF?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  nbEnseignG?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  nbEnseignF?: number;
}

export class CreateAleaDto {
  @ApiPropertyOptional({ example: 'INONDATION' })
  @IsOptional()
  @IsString()
  typeAleat?: string;

  @ApiPropertyOptional({ example: 'Inondation rivière' })
  @IsOptional()
  @IsString()
  nomAleat?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dateAleat?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  explication?: string;

  @ApiPropertyOptional({ type: [EffetAleaData] })
  @IsOptional()
  @IsArray()
  effets?: EffetAleaData[];
}
