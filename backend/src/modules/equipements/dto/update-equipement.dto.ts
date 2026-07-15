import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateEquipementDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nomEquip?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  typeEquip?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  etat?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantite?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  salleId?: number;
}
