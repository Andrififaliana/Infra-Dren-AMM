import { IsOptional, IsString, IsInt, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateOuvertureDto {
  @ApiPropertyOptional({ example: 'FENETRE' })
  @IsOptional()
  @IsString()
  typeOuvert?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  nbOuvert?: number;

  @ApiPropertyOptional({ example: 1.2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  largeurOuvert?: number;

  @ApiPropertyOptional({ example: 1.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  hauteurOuvert?: number;

  @ApiPropertyOptional({ example: 1.8 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  surfaceOuvert?: number;
}
