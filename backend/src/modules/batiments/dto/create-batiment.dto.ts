import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBatimentDto {
  @ApiProperty({ example: 'BAT-A' })
  @IsNotEmpty({ message: 'Le sigle du bâtiment est requis' })
  @IsString()
  sigleBat: string;

  @ApiPropertyOptional({ example: 2 })
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

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  etablissementId: number;
}
