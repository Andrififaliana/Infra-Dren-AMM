import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmSignupDto {
  @ApiProperty({
    description: 'Token de confirmation Supabase (récupéré du hash d\'URL)',
    example: 'eyJhbGciOiJIUzI1NiIs...',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le token est requis' })
  accessToken: string;
}

export class ConfirmSignupResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Email confirmé avec succès. Vous pouvez maintenant vous connecter.' })
  message: string;
}
