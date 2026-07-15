import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class MoyensData {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  typeMoyen?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  dureeMoyen?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  distanceMoyen?: number;
}

class PeriodeData {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  debutPeriode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  finPeriode: string;
}

export class CreateTrajetDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nomTrajet?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  debutTrajet?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  finTrajet?: string;

  @ApiPropertyOptional({ type: () => MoyensData })
  @IsOptional()
  moyensData?: MoyensData;

  @ApiPropertyOptional({ type: () => PeriodeData })
  @IsOptional()
  periodeData?: PeriodeData;
}
