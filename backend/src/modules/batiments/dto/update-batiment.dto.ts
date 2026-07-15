import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateBatimentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sigleBat?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  nbNiveau?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  srcFic?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  agenceC?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  srcFir?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  agenceR?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dispositifAc?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  etablissementId?: number;
}
