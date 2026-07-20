import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChatIaService } from './chat-ia.service';
import {
  ChatMessageDto,
  ExecuteActionDto,
  ChatResponseDto,
} from './dto/chat-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/constants';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Chat IA')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('chat-ia')
export class ChatIaController {
  constructor(private readonly chatIaService: ChatIaService) {}

  @Post('message')
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Envoyer un message au chat IA',
    description:
      'Envoie un message à l\'assistant IA et reçoit une réponse. ' +
      'Les conversations sont stockées en mémoire uniquement (pas de persistance DB). ' +
      'Si l\'IA propose une action (création/modification/suppression), ' +
      'un objet proposedAction sera retourné pour confirmation.',
  })
  @ApiResponse({ status: 200, description: 'Réponse de l\'IA' })
  async sendMessage(
    @Body() dto: ChatMessageDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ChatResponseDto> {
    return this.chatIaService.sendMessage(dto, user);
  }

  @Post('execute')
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Exécuter une action après confirmation',
    description:
      'Exécute une action de création/modification/suppression ' +
      'après que l\'utilisateur ait confirmé sévèrement. ' +
      'Cette action est irréversible pour les suppressions.',
  })
  @ApiResponse({ status: 200, description: 'Action exécutée' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  async executeAction(
    @Body() dto: ExecuteActionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.chatIaService.executeAction(
      dto.actionType,
      dto.entity,
      dto.data,
      dto.entityId,
      user,
    );
  }

  @Get('schema')
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtenir les informations sur les entités disponibles',
  })
  async getSchema(@CurrentUser() user: CurrentUserPayload) {
    return this.chatIaService.getSchemaInfo(user);
  }

  @Delete('conversation')
  @Roles(Role.ADMIN, Role.RESPONSABLE_INFRASTRUCTURE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Effacer la conversation en cours',
    description: 'Supprime la conversation en mémoire pour cet utilisateur',
  })
  async clearConversation(@CurrentUser() user: CurrentUserPayload) {
    this.chatIaService.clearConversation(user.id);
    return { message: 'Conversation effacée.' };
  }
}
