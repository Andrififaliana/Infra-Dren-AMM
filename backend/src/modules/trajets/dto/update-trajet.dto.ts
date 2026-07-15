import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTrajetDto {
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
}
