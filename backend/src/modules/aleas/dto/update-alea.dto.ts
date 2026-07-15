import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAleaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  typeAleat?: string;

  @ApiPropertyOptional()
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
}
