import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateStructureDto {
  @ApiPropertyOptional({ example: 'MUR_CLOTURE' })
  @IsOptional()
  @IsString()
  typeStruc?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  existenceStruc?: boolean;

  @ApiPropertyOptional({ example: 'PARPAING' })
  @IsOptional()
  @IsString()
  materiauxStruc?: string;

  @ApiPropertyOptional({ example: 'BON' })
  @IsOptional()
  @IsString()
  etatStruc?: string;
}
