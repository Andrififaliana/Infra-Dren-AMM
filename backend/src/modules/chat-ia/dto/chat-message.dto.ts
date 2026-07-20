import { IsString, IsNotEmpty, IsOptional, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({ description: 'Message de l\'utilisateur' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ description: 'Historique de la conversation (messages précédents)' })
  @IsOptional()
  @IsArray()
  history?: ChatHistoryEntry[];
}

export class ChatHistoryEntry {
  @ApiProperty({ enum: ['user', 'assistant'] })
  role: 'user' | 'assistant';

  @ApiProperty()
  content: string;
}

export class ExecuteActionDto {
  @ApiProperty({ description: 'Type d\'action à exécuter' })
  @IsString()
  @IsNotEmpty()
  actionType: 'create' | 'update' | 'delete';

  @ApiProperty({ description: 'Nom de l\'entité (ex: Etablissement, Batiment, etc.)' })
  @IsString()
  @IsNotEmpty()
  entity: string;

  @ApiProperty({ description: 'Données pour l\'action' })
  @IsObject()
  data: Record<string, any>;

  @ApiPropertyOptional({ description: 'ID de l\'entité à modifier/supprimer' })
  @IsOptional()
  entityId?: number;
}

export class ChatResponseDto {
  @ApiProperty({ description: 'Réponse textuelle de l\'IA' })
  message: string;

  @ApiPropertyOptional({ description: 'Action proposée nécessitant confirmation', nullable: true })
  proposedAction?: ProposedActionDto | null;
}

export class ProposedActionDto {
  @ApiProperty()
  actionType: 'create' | 'update' | 'delete';

  @ApiProperty()
  entity: string;

  @ApiProperty()
  entityId?: number;

  @ApiProperty()
  data: Record<string, any>;

  @ApiProperty()
  summary: string;

  @ApiProperty()
  warning: string;
}
