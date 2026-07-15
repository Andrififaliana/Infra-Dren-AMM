import { ApiProperty } from '@nestjs/swagger';

export class UserInfo {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'Jean Dupont' })
  nom: string;

  @ApiProperty({ example: 'RESPONSABLE_INFRASTRUCTURE' })
  role: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  accessToken: string;

  @ApiProperty({ type: UserInfo })
  user: UserInfo;
}
