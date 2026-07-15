import { IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../common/constants';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @ApiProperty({ example: 'Jean Dupont' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  nom: string;

  @ApiProperty({ example: 'motdepasse123', minLength: 6 })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(6, { message: 'Minimum 6 caractères' })
  password: string;

  @ApiPropertyOptional({ enum: Role, default: Role.RESPONSABLE_INFRASTRUCTURE })
  @IsOptional()
  @IsEnum(Role, { message: 'Rôle invalide' })
  role?: Role;
}
