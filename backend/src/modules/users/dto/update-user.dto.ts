import { IsEmail, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../common/constants';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'nouveau@email.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;

  @ApiPropertyOptional({ example: 'Jean Dupont' })
  @IsOptional()
  nom?: string;

  @ApiPropertyOptional({ example: 'nouveaumotdepasse', minLength: 6 })
  @IsOptional()
  @MinLength(6, { message: 'Minimum 6 caractères' })
  password?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role, { message: 'Rôle invalide' })
  role?: Role;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  actif?: boolean;
}
