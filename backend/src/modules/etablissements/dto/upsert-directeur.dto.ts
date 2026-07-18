import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertDirecteurDto {
  @ApiProperty({ example: 'Rakotondrazaka' })
  @IsNotEmpty({ message: 'Le nom du directeur est requis' })
  @IsString()
  nomDirecteur!: string;

  @ApiPropertyOptional({ example: 'Henri' })
  @IsOptional()
  @IsString()
  prenomDr?: string;

  @ApiPropertyOptional({ example: 'directeur@ecole.mg' })
  @IsOptional()
  @IsString()
  emailDr?: string;

  @ApiPropertyOptional({ example: '+261 34 12 345 67' })
  @IsOptional()
  @IsString()
  telDr?: string;
}
