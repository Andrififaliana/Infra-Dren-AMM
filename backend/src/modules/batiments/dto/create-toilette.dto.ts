import { IsOptional, IsString, IsInt, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateToiletteDto {
  @ApiProperty({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  nbCompartiment?: number;

  @ApiPropertyOptional({ example: 'FILLES' })
  @IsOptional()
  @IsString()
  fonctionToilette?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  pointEau?: boolean;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  batimentId?: number;
}
