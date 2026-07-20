import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ChatIaService } from './chat-ia.service';
import { IaMonitoringService } from './ia-monitoring.service';
import {
  ChatMessageDto,
  ExecuteActionDto,
  ChatResponseDto,
} from './dto/chat-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/constants';

@ApiTags('Chat IA')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('chat-ia')
export class ChatIaController {
  constructor(
    private readonly chatIaService: ChatIaService,
    private readonly iaMonitoring: IaMonitoringService,
  ) {}

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

  @Get('logs')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lister les logs de monitoring IA',
    description:
      'Retourne les logs paginés de toutes les requêtes IA. Accessible uniquement aux administrateurs.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'success', required: false, description: 'Filtrer par succès (true/false)' })
  async getLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('success') success?: string,
  ) {
    return this.iaMonitoring.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
      success,
    });
  }

  @Get('logs/stats')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Statistiques des logs IA',
    description: 'Retourne les statistiques globales (total requêtes, tokens, temps moyen, etc.)',
  })
  async getLogsStats() {
    return this.iaMonitoring.getStats();
  }
}
